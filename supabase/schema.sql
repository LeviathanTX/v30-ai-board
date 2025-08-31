-- V21 AI Board of Advisors - Supabase Schema
-- Version: 21.0.0
-- Last Updated: January 2024

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE advisor_type AS ENUM ('default', 'custom', 'specialized');
CREATE TYPE document_status AS ENUM ('uploading', 'processing', 'ready', 'failed');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  company_role TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_name TEXT,
  type TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  storage_path TEXT,
  storage_bucket TEXT DEFAULT 'documents',
  status document_status DEFAULT 'uploading',
  content TEXT,
  summary TEXT,
  key_points TEXT[],
  entities JSONB,
  metadata JSONB DEFAULT '{}',
  analysis JSONB,
  vector_id TEXT,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_documents_user_id ON documents(user_id),
  INDEX idx_documents_status ON documents(status),
  INDEX idx_documents_created_at ON documents(created_at DESC),
  INDEX idx_documents_vector_id ON documents(vector_id)
);

-- Document embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_embeddings_document_id ON document_embeddings(document_id),
  INDEX idx_embeddings_embedding ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
);

-- Advisors table
CREATE TABLE IF NOT EXISTS public.advisors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  type advisor_type DEFAULT 'default',
  expertise TEXT[],
  personality JSONB NOT NULL,
  avatar_emoji TEXT,
  avatar_url TEXT,
  voice_profile JSONB,
  system_prompt TEXT,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_advisors_user_id ON advisors(user_id),
  INDEX idx_advisors_type ON advisors(type),
  INDEX idx_advisors_is_public ON advisors(is_public)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  type TEXT DEFAULT 'chat',
  status TEXT DEFAULT 'active',
  advisors UUID[],
  advisor_names TEXT[],
  document_ids UUID[],
  summary TEXT,
  action_items JSONB,
  key_insights JSONB,
  metadata JSONB DEFAULT '{}',
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_conversations_user_id ON conversations(user_id),
  INDEX idx_conversations_updated_at ON conversations(updated_at DESC),
  INDEX idx_conversations_archived ON conversations(archived)
);

-- Messages table (separate for performance)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES advisors(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  advisor_name TEXT,
  referenced_documents UUID[],
  referenced_messages UUID[],
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_messages_conversation_id ON messages(conversation_id),
  INDEX idx_messages_created_at ON messages(created_at)
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT CHECK (platform IN ('internal', 'google_meet', 'zoom', 'teams')),
  platform_meeting_id TEXT,
  platform_meeting_url TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  status meeting_status DEFAULT 'scheduled',
  attendees JSONB DEFAULT '[]',
  advisors UUID[],
  documents UUID[],
  recording_url TEXT,
  transcript TEXT,
  summary TEXT,
  action_items JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_meetings_user_id ON meetings(user_id),
  INDEX idx_meetings_scheduled_at ON meetings(scheduled_at),
  INDEX idx_meetings_status ON meetings(status)
);

-- Custom advisor templates (marketplace)
CREATE TABLE IF NOT EXISTS public.advisor_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  base_advisor JSONB NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  downloads INTEGER DEFAULT 0,
  rating FLOAT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_advisor_templates_category ON advisor_templates(category),
  INDEX idx_advisor_templates_is_featured ON advisor_templates(is_featured)
);

-- Usage tracking
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  resource_id UUID,
  resource_type TEXT,
  tokens_used INTEGER,
  credits_used INTEGER,
  cost DECIMAL(10,4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_usage_logs_user_id ON usage_logs(user_id),
  INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC),
  INDEX idx_usage_logs_type ON usage_logs(type)
);

-- Subscription usage limits
CREATE TABLE IF NOT EXISTS public.subscription_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tier subscription_tier UNIQUE NOT NULL,
  max_documents INTEGER NOT NULL,
  max_conversations_per_month INTEGER NOT NULL,
  max_advisors INTEGER NOT NULL,
  max_custom_advisors INTEGER NOT NULL,
  max_meeting_minutes_per_month INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription limits
INSERT INTO subscription_limits (tier, max_documents, max_conversations_per_month, max_advisors, max_custom_advisors, max_meeting_minutes_per_month, features) VALUES
('free', 5, 10, 3, 0, 0, '{"basic_chat": true, "document_upload": true}'),
('starter', 50, 100, 5, 2, 60, '{"basic_chat": true, "document_upload": true, "voice_input": true, "export": true}'),
('professional', 500, 1000, 10, 10, 500, '{"basic_chat": true, "document_upload": true, "voice_input": true, "export": true, "api_access": true, "priority_support": true}'),
('enterprise', -1, -1, -1, -1, -1, '{"all_features": true}')
ON CONFLICT (tier) DO NOTHING;

-- Insert default advisors
INSERT INTO advisors (id, user_id, name, role, type, expertise, personality, avatar_emoji, voice_profile) VALUES
('a1000000-0000-0000-0000-000000000001', NULL, 'Sarah Chen', 'Chief Strategy Officer', 'default', 
 ARRAY['Strategic Planning', 'Market Analysis', 'Growth Strategy', 'Competitive Intelligence'], 
 '{"traits": ["analytical", "visionary", "direct"], "communication_style": "professional", "thinking_style": "big-picture"}',
 '👩‍💼',
 '{"model": "nova-2", "style": "professional", "gender": "female", "speed": 1.0}'),

('a1000000-0000-0000-0000-000000000002', NULL, 'Marcus Johnson', 'Chief Financial Officer', 'default',
 ARRAY['Financial Planning', 'Risk Management', 'Investment Strategy', 'Financial Analysis'],
 '{"traits": ["detail-oriented", "conservative", "thorough"], "communication_style": "formal", "thinking_style": "analytical"}',
 '👨‍💼',
 '{"model": "nova-2", "style": "authoritative", "gender": "male", "speed": 0.95}'),

('a1000000-0000-0000-0000-000000000003', NULL, 'Emily Rodriguez', 'Chief Marketing Officer', 'default',
 ARRAY['Brand Strategy', 'Digital Marketing', 'Customer Experience', 'Market Research'],
 '{"traits": ["creative", "enthusiastic", "innovative"], "communication_style": "energetic", "thinking_style": "creative"}',
 '👩‍🎨',
 '{"model": "nova-2", "style": "friendly", "gender": "female", "speed": 1.05}'),

('a1000000-0000-0000-0000-000000000004', NULL, 'Dr. Alex Kim', 'Chief Technology Officer', 'default',
 ARRAY['Technology Strategy', 'Digital Transformation', 'Cybersecurity', 'Innovation'],
 '{"traits": ["logical", "innovative", "pragmatic"], "communication_style": "technical", "thinking_style": "systematic"}',
 '👨‍💻',
 '{"model": "nova-2", "style": "clear", "gender": "non-binary", "speed": 1.0}'),

('a1000000-0000-0000-0000-000000000005', NULL, 'Rachel Green', 'Chief People Officer', 'default',
 ARRAY['Organizational Culture', 'Talent Management', 'Leadership Development', 'Change Management'],
 '{"traits": ["empathetic", "collaborative", "insightful"], "communication_style": "warm", "thinking_style": "people-focused"}',
 '👩‍💼',
 '{"model": "nova-2", "style": "conversational", "gender": "female", "speed": 0.98}')
ON CONFLICT (id) DO NOTHING;

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON advisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Advisors policies
CREATE POLICY "Users can view default and own advisors" ON advisors
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own advisors" ON advisors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own advisors" ON advisors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own advisors" ON advisors
  FOR DELETE USING (auth.uid() = user_id AND type != 'default');

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Meetings policies
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', false),
  ('avatars', 'avatars', true),
  ('recordings', 'recordings', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Indexes for performance
CREATE INDEX idx_documents_content_search ON documents USING gin(to_tsvector('english', content));
CREATE INDEX idx_conversations_title_search ON conversations USING gin(to_tsvector('english', title));
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Views for common queries
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.subscription_tier,
  COUNT(DISTINCT d.id) as document_count,
  COUNT(DISTINCT c.id) as conversation_count,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT mt.id) as meeting_count,
  COALESCE(SUM(ul.tokens_used), 0) as total_tokens_used
FROM user_profiles u
LEFT JOIN documents d ON u.id = d.user_id AND d.deleted_at IS NULL
LEFT JOIN conversations c ON u.id = c.user_id AND c.archived = false
LEFT JOIN messages m ON u.id = m.user_id
LEFT JOIN meetings mt ON u.id = mt.user_id
LEFT JOIN usage_logs ul ON u.id = ul.user_id
GROUP BY u.id, u.email, u.subscription_tier;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;