-- V21 AI Board of Advisors - Supabase Database Schema
-- Run this SQL in your Supabase SQL editor to create all necessary tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for better data integrity
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE document_status AS ENUM ('pending', 'uploading', 'processing', 'processed', 'error');
CREATE TYPE conversation_type AS ENUM ('chat', 'meeting', 'workshop');

-- User profiles table (extends Supabase auth.users)
-- This stores additional user information beyond authentication
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'active',
  subscription_end_date TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{
    "theme": "light",
    "voiceEnabled": true,
    "autoSave": true,
    "notificationsEnabled": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advisors table for both default and custom advisors
-- Default advisors have null user_id, custom ones are tied to users
CREATE TABLE IF NOT EXISTS public.advisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  personality JSONB DEFAULT '{
    "traits": [],
    "communication_style": "professional"
  }'::jsonb,
  avatar_emoji TEXT,
  avatar_url TEXT,
  voice_profile JSONB DEFAULT '{}'::jsonb,
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table stores all chat sessions
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  type conversation_type DEFAULT 'chat',
  status TEXT DEFAULT 'active',
  participants JSONB DEFAULT '[]'::jsonb, -- Array of advisor IDs
  metadata JSONB DEFAULT '{}'::jsonb,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table stores all conversation content
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
  documents UUID[] DEFAULT '{}', -- Referenced document IDs
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table stores uploaded files and their analysis
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT,
  storage_path TEXT, -- Path in Supabase Storage
  content TEXT, -- Extracted text content
  content_hash TEXT, -- For deduplication
  extracted_data JSONB DEFAULT '{}'::jsonb, -- Full extraction results
  analysis JSONB DEFAULT '{}'::jsonb, -- AI analysis results
  metadata JSONB DEFAULT '{}'::jsonb,
  status document_status DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_advisors_user_id ON advisors(user_id);
CREATE INDEX idx_advisors_is_custom ON advisors(is_custom);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Security policies ensure users can only access their own data

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Advisors policies
CREATE POLICY "Everyone can view default advisors" ON advisors
  FOR SELECT USING (is_custom = false);

CREATE POLICY "Users can view own custom advisors" ON advisors
  FOR SELECT USING (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can create own advisors" ON advisors
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can update own advisors" ON advisors
  FOR UPDATE USING (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can delete own advisors" ON advisors
  FOR DELETE USING (auth.uid() = user_id AND is_custom = true);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions for common operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update timestamps
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON advisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation's last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger 
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Insert default advisors (these are available to all users)
INSERT INTO advisors (id, name, role, expertise, personality, avatar_emoji, is_custom, is_active)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Sarah Chen',
    'Chief Strategy Officer',
    ARRAY['Strategic Planning', 'Market Analysis', 'Growth Strategy', 'Competitive Intelligence'],
    '{"traits": ["analytical", "visionary", "direct"], "communication_style": "professional"}'::jsonb,
    '👩‍💼',
    false,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Marcus Johnson',
    'CFO',
    ARRAY['Financial Planning', 'Risk Management', 'Investment Strategy', 'Cost Optimization'],
    '{"traits": ["detail-oriented", "conservative", "thorough"], "communication_style": "formal"}'::jsonb,
    '👨‍💼',
    false,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Emily Rodriguez',
    'CMO',
    ARRAY['Brand Strategy', 'Digital Marketing', 'Customer Experience', 'Market Research'],
    '{"traits": ["creative", "enthusiastic", "innovative"], "communication_style": "energetic"}'::jsonb,
    '👩‍🎨',
    false,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Create a view for user statistics (useful for dashboards)
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT d.id) as total_documents,
  MAX(c.last_message_at) as last_activity
FROM user_profiles u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN messages m ON c.id = m.conversation_id
LEFT JOIN documents d ON u.id = d.user_id
GROUP BY u.id;

-- Grant access to the view
GRANT SELECT ON user_statistics TO authenticated;

-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

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

-- Success! Your database is now ready for the V21 AI Board of Advisors platform