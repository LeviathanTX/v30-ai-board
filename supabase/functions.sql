-- Additional PostgreSQL functions for V21 AI Board
-- Add these after running the main schema.sql

-- Function for semantic search using vector similarity
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  user_id uuid,
  match_count int DEFAULT 10,
  similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  document_id uuid,
  chunk_text text,
  chunk_index int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.document_id,
    de.chunk_text,
    de.chunk_index,
    (1 - (de.embedding <=> query_embedding)) as similarity
  FROM document_embeddings de
  JOIN documents d ON de.document_id = d.id
  WHERE 
    d.user_id = search_documents.user_id
    AND d.deleted_at IS NULL
    AND (1 - (de.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get user's current usage for the month
CREATE OR REPLACE FUNCTION get_user_monthly_usage(user_id uuid)
RETURNS TABLE (
  conversations_count int,
  messages_count int,
  documents_count int,
  tokens_used bigint,
  meeting_minutes int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::int as conversations_count,
    COUNT(DISTINCT m.id)::int as messages_count,
    COUNT(DISTINCT d.id)::int as documents_count,
    COALESCE(SUM(ul.tokens_used), 0)::bigint as tokens_used,
    COALESCE(SUM(mt.duration_minutes), 0)::int as meeting_minutes
  FROM user_profiles u
  LEFT JOIN conversations c ON u.id = c.user_id 
    AND c.created_at >= date_trunc('month', CURRENT_DATE)
  LEFT JOIN messages m ON u.id = m.user_id 
    AND m.created_at >= date_trunc('month', CURRENT_DATE)
  LEFT JOIN documents d ON u.id = d.user_id 
    AND d.created_at >= date_trunc('month', CURRENT_DATE)
    AND d.deleted_at IS NULL
  LEFT JOIN usage_logs ul ON u.id = ul.user_id 
    AND ul.created_at >= date_trunc('month', CURRENT_DATE)
  LEFT JOIN meetings mt ON u.id = mt.user_id 
    AND mt.created_at >= date_trunc('month', CURRENT_DATE)
  WHERE u.id = get_user_monthly_usage.user_id
  GROUP BY u.id;
END;
$$;

-- Function to check if user has exceeded limits
CREATE OR REPLACE FUNCTION check_user_limits(
  user_id uuid,
  limit_type text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  user_tier subscription_tier;
  usage_record record;
  limits_record record;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM user_profiles
  WHERE id = check_user_limits.user_id;

  -- Get subscription limits
  SELECT * INTO limits_record
  FROM subscription_limits
  WHERE tier = user_tier;

  -- Get current usage
  SELECT * INTO usage_record
  FROM get_user_monthly_usage(check_user_limits.user_id);

  -- Check specific limit
  CASE limit_type
    WHEN 'conversations' THEN
      RETURN limits_record.max_conversations_per_month = -1 
        OR usage_record.conversations_count < limits_record.max_conversations_per_month;
    WHEN 'documents' THEN
      RETURN limits_record.max_documents = -1 
        OR usage_record.documents_count < limits_record.max_documents;
    WHEN 'meeting_minutes' THEN
      RETURN limits_record.max_meeting_minutes_per_month = -1 
        OR usage_record.meeting_minutes < limits_record.max_meeting_minutes_per_month;
    ELSE
      RETURN true;
  END CASE;
END;
$$;

-- Function to get conversation context (for AI)
CREATE OR REPLACE FUNCTION get_conversation_context(
  conversation_id uuid,
  message_limit int DEFAULT 50
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  conv_record record;
  messages_json json;
  documents_json json;
BEGIN
  -- Get conversation details
  SELECT * INTO conv_record
  FROM conversations
  WHERE id = get_conversation_context.conversation_id;

  -- Get recent messages
  SELECT json_agg(msg_data)
  INTO messages_json
  FROM (
    SELECT 
      m.id,
      m.role,
      m.content,
      m.advisor_name,
      m.created_at
    FROM messages m
    WHERE m.conversation_id = get_conversation_context.conversation_id
    ORDER BY m.created_at DESC
    LIMIT message_limit
  ) msg_data;

  -- Get referenced documents
  SELECT json_agg(doc_data)
  INTO documents_json
  FROM (
    SELECT 
      d.id,
      d.name,
      d.summary,
      d.key_points
    FROM documents d
    WHERE d.id = ANY(conv_record.document_ids)
      AND d.deleted_at IS NULL
  ) doc_data;

  -- Return combined context
  RETURN json_build_object(
    'conversation', json_build_object(
      'id', conv_record.id,
      'title', conv_record.title,
      'type', conv_record.type,
      'advisor_names', conv_record.advisor_names,
      'created_at', conv_record.created_at
    ),
    'messages', messages_json,
    'documents', documents_json
  );
END;
$$;

-- Function to generate conversation title from first message
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  first_message text;
  generated_title text;
BEGIN
  -- Only generate if title is null
  IF NEW.title IS NULL THEN
    -- Get first user message
    SELECT content INTO first_message
    FROM messages
    WHERE conversation_id = NEW.id
      AND role = 'user'
    ORDER BY created_at
    LIMIT 1;

    IF first_message IS NOT NULL THEN
      -- Take first 50 characters or until punctuation
      generated_title := substring(first_message from 1 for 50);
      
      -- Clean up title
      IF length(first_message) > 50 THEN
        generated_title := generated_title || '...';
      END IF;
      
      NEW.title := generated_title;
    ELSE
      -- Default title
      NEW.title := 'Conversation ' || to_char(NEW.created_at, 'MM/DD/YYYY');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating conversation titles
CREATE TRIGGER auto_generate_conversation_title
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  WHEN (OLD.message_count = 0 AND NEW.message_count > 0)
  EXECUTE FUNCTION generate_conversation_title();

-- Index for faster advisor lookups
CREATE INDEX idx_advisors_name ON advisors(name);
CREATE INDEX idx_documents_name ON documents(name);

-- Add GIN index for JSONB searches
CREATE INDEX idx_documents_metadata ON documents USING gin(metadata);
CREATE INDEX idx_advisors_personality ON advisors USING gin(personality);

-- Performance optimization for conversation queries
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION search_documents TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_monthly_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_limits TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_context TO authenticated;