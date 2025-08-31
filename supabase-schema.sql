-- Supabase Schema Setup for AI Board of Advisors V21
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings (if you plan to use RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  storage_path TEXT,
  content TEXT,
  analysis JSONB,
  embeddings vector(1536), -- For OpenAI embeddings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_embeddings_idx ON documents 
USING ivfflat (embeddings vector_cosine_ops)
WITH (lists = 100);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  advisors JSONB,
  messages JSONB DEFAULT '[]'::jsonb,
  documents UUID[] DEFAULT '{}',
  summary TEXT,
  action_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- =====================================================
-- ADVISORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS advisors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  expertise TEXT[],
  personality JSONB DEFAULT '{}'::jsonb,
  avatar_emoji TEXT,
  avatar_url TEXT,
  voice_profile JSONB DEFAULT '{}'::jsonb,
  system_prompt TEXT,
  knowledge_base JSONB DEFAULT '[]'::jsonb,
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_advisors_user_id ON advisors(user_id);
CREATE INDEX IF NOT EXISTS idx_advisors_is_custom ON advisors(is_custom);

-- =====================================================
-- ADVISOR KNOWLEDGE BASE TABLE (for RAG)
-- =====================================================
CREATE TABLE IF NOT EXISTS advisor_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT, -- 'document', 'note', 'training'
  embeddings vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS advisor_knowledge_embeddings_idx ON advisor_knowledge 
USING ivfflat (embeddings vector_cosine_ops)
WITH (lists = 100);

-- Create index for advisor lookups
CREATE INDEX IF NOT EXISTS idx_advisor_knowledge_advisor_id ON advisor_knowledge(advisor_id);

-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  voice_enabled BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  default_advisors UUID[] DEFAULT '{}',
  ai_settings JSONB DEFAULT '{
    "response_style": "professional",
    "response_length": "standard",
    "auto_play_voice": true,
    "language": "en"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'professional', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  features JSONB DEFAULT '{
    "max_advisors": 3,
    "max_documents": 10,
    "max_conversations": 50,
    "voice_minutes": 60,
    "custom_advisors": false,
    "api_access": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USAGE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  conversations_count INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  voice_minutes_used FLOAT DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Advisors policies
CREATE POLICY "Users can view all advisors" ON advisors
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own custom advisors" ON advisors
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can update own custom advisors" ON advisors
  FOR UPDATE USING (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can delete own custom advisors" ON advisors
  FOR DELETE USING (auth.uid() = user_id AND is_custom = true);

-- Advisor knowledge policies
CREATE POLICY "Users can view advisor knowledge" ON advisor_knowledge
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE advisors.id = advisor_knowledge.advisor_id 
      AND (advisors.user_id = auth.uid() OR advisors.is_custom = false)
    )
  );

CREATE POLICY "Users can insert knowledge for own advisors" ON advisor_knowledge
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE advisors.id = advisor_knowledge.advisor_id 
      AND advisors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update knowledge for own advisors" ON advisor_knowledge
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE advisors.id = advisor_knowledge.advisor_id 
      AND advisors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete knowledge for own advisors" ON advisor_knowledge
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE advisors.id = advisor_knowledge.advisor_id 
      AND advisors.user_id = auth.uid()
    )
  );

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON advisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage tracking
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_metric TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := DATE_TRUNC('month', CURRENT_DATE);
  
  INSERT INTO usage_tracking (user_id, month, created_at, updated_at)
  VALUES (p_user_id, v_month, NOW(), NOW())
  ON CONFLICT (user_id, month) DO NOTHING;
  
  EXECUTE format('
    UPDATE usage_tracking 
    SET %I = %I + $1, updated_at = NOW()
    WHERE user_id = $2 AND month = $3
  ', p_metric, p_metric)
  USING p_amount, p_user_id, v_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DEFAULT ADVISORS
-- =====================================================

-- Insert default advisors (these will be available to all users)
INSERT INTO advisors (id, name, role, expertise, personality, avatar_emoji, is_custom, system_prompt) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Meeting Host', 'AI Board Facilitator', 
   ARRAY['Meeting Facilitation', 'Roberts Rules of Order', 'Behavioral Economics', 'Design Thinking', 'Brainstorming', 'Action Planning'],
   '{"traits": ["professional", "organized", "neutral", "strategic", "empathetic"], "communication_style": "structured", "approach": "facilitative"}'::jsonb,
   '🤖', false,
   'You are the Meeting Host, a highly trained AI Board Facilitator with expertise in Roberts Rules of Order, behavioral economics, design thinking, and meeting productivity. Your role is to facilitate productive discussions, ensure all voices are heard, and drive actionable outcomes.'),
   
  ('00000000-0000-0000-0000-000000000002', 'Sarah Chen', 'Chief Strategy Officer', 
   ARRAY['Strategic Planning', 'Market Analysis', 'Growth Strategy', 'Competitive Intelligence', 'Innovation Management'],
   '{"traits": ["analytical", "visionary", "direct", "strategic"], "communication_style": "professional"}'::jsonb,
   '👩‍💼', false,
   'You are Sarah Chen, Chief Strategy Officer with 20+ years experience in strategic planning and growth strategy. You provide data-driven insights and help companies navigate complex market dynamics.'),
   
  ('00000000-0000-0000-0000-000000000003', 'Marcus Johnson', 'CFO', 
   ARRAY['Financial Planning', 'Risk Management', 'Investment Strategy', 'Financial Analysis', 'Budgeting'],
   '{"traits": ["detail-oriented", "conservative", "thorough", "analytical"], "communication_style": "formal"}'::jsonb,
   '👨‍💼', false,
   'You are Marcus Johnson, an experienced CFO who specializes in financial planning, risk management, and ensuring fiscal responsibility. You provide careful analysis of financial implications for all business decisions.'),
   
  ('00000000-0000-0000-0000-000000000004', 'Emily Rodriguez', 'CMO', 
   ARRAY['Brand Strategy', 'Digital Marketing', 'Customer Experience', 'Content Marketing', 'Growth Marketing'],
   '{"traits": ["creative", "enthusiastic", "innovative", "customer-focused"], "communication_style": "energetic"}'::jsonb,
   '👩‍🎨', false,
   'You are Emily Rodriguez, Chief Marketing Officer with expertise in brand building, digital transformation, and customer-centric marketing strategies. You bring creative solutions and data-driven marketing insights.'),
   
  ('00000000-0000-0000-0000-000000000005', 'Dr. Alex Kim', 'Chief Technology Officer', 
   ARRAY['Technology Strategy', 'Digital Transformation', 'Cybersecurity', 'Innovation', 'AI/ML', 'Cloud Architecture'],
   '{"traits": ["logical", "innovative", "pragmatic", "analytical", "forward-thinking"], "communication_style": "technical"}'::jsonb,
   '👨‍💻', false,
   'You are Dr. Alex Kim, CTO with deep expertise in technology strategy, digital transformation, and emerging technologies. You help companies leverage technology for competitive advantage while ensuring security and scalability.'),
   
  ('00000000-0000-0000-0000-000000000006', 'Rachel Green', 'Chief People Officer', 
   ARRAY['Organizational Culture', 'Talent Management', 'Leadership Development', 'Change Management', 'Employee Engagement'],
   '{"traits": ["empathetic", "collaborative", "insightful", "supportive", "strategic"], "communication_style": "warm"}'::jsonb,
   '👩‍💼', false,
   'You are Rachel Green, Chief People Officer focused on building high-performing teams and positive organizational cultures. You bring expertise in talent strategy, leadership development, and organizational transformation.')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Note: Run these commands in the Supabase Dashboard under Storage

-- Create storage bucket for documents
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage bucket for avatars
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for documents bucket
-- CREATE POLICY "Users can upload own documents" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own documents" ON storage.objects
--   FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
-- CREATE POLICY "Anyone can view avatars" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload own avatars" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update own avatars" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own avatars" ON storage.objects
--   FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);