-- V30 AI Board of Advisors - Supabase Schema  
-- Version: 30.0.0 - Theatrical Environments Edition
-- Created: August 2024

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE advisor_type AS ENUM ('default', 'custom', 'specialized');
CREATE TYPE document_status AS ENUM ('uploading', 'processing', 'ready', 'failed');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
CREATE TYPE view_mode AS ENUM ('chat', 'boardroom', 'shark_tank');

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
  preferred_view_mode view_mode DEFAULT 'chat',
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
  deleted_at TIMESTAMPTZ
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
  deleted_at TIMESTAMPTZ
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  view_mode view_mode DEFAULT 'chat',
  advisor_ids UUID[],
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB,
  view_mode view_mode DEFAULT 'chat',
  active_advisors UUID[],
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- V30 specific: View mode preferences
CREATE TABLE IF NOT EXISTS public.view_mode_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_mode view_mode DEFAULT 'chat',
  boardroom_settings JSONB DEFAULT '{}',
  shark_tank_settings JSONB DEFAULT '{}',
  chat_settings JSONB DEFAULT '{}',
  transition_enabled BOOLEAN DEFAULT true,
  effects_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_advisors_user_id ON advisors(user_id);
CREATE INDEX IF NOT EXISTS idx_advisors_is_active ON advisors(is_active);
CREATE INDEX IF NOT EXISTS idx_advisors_type ON advisors(type);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_view_mode ON conversations(view_mode);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_mode_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own advisors" ON advisors FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own advisors" ON advisors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own advisors" ON advisors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own advisors" ON advisors FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own view preferences" ON view_mode_preferences FOR ALL USING (auth.uid() = user_id);

-- Insert default advisors (V30 specific with theatrical awareness)
INSERT INTO public.advisors (id, user_id, name, role, type, expertise, personality, avatar_emoji, system_prompt, is_public) VALUES
  (
    'default-host-v30',
    '00000000-0000-0000-0000-000000000000',
    'V30 Meeting Host',
    'Theatrical Experience Facilitator', 
    'default',
    ARRAY['Meeting Management', 'Theatrical Environments', 'Voice Interaction'],
    '{"traits": ["professional", "adaptable", "theatrical"], "communication_style": "dynamic"}',
    '🎭',
    'You are the V30 Meeting Host, specializing in theatrical business environments. You adapt your communication style based on the current view mode: professional in Boardroom, energetic in Shark Tank, and focused in Chat mode. You help users navigate between different theatrical environments and maximize their strategic discussions.',
    true
  ),
  (
    'default-strategist-v30',
    '00000000-0000-0000-0000-000000000000',
    'Strategic Theater Director',
    'Business Strategy & Performance Coach',
    'default', 
    ARRAY['Strategic Planning', 'Performance Coaching', 'Theatrical Business Presentation'],
    '{"traits": ["visionary", "dramatic", "results-focused"], "communication_style": "inspiring"}',
    '🎪',
    'You are a Strategic Theater Director who helps transform business discussions into powerful theatrical experiences. You understand that the right environment can elevate strategic thinking, whether it\'s the focused intimacy of Chat mode, the executive gravitas of Boardroom mode, or the high-stakes energy of Shark Tank mode.',
    true
  );

-- Functions for V30 theatrical features
CREATE OR REPLACE FUNCTION get_user_view_mode_settings(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_build_object(
      'current_mode', current_mode,
      'boardroom_settings', boardroom_settings,
      'shark_tank_settings', shark_tank_settings,
      'chat_settings', chat_settings,
      'transition_enabled', transition_enabled,
      'effects_enabled', effects_enabled
    ),
    jsonb_build_object(
      'current_mode', 'chat',
      'boardroom_settings', '{}',
      'shark_tank_settings', '{}', 
      'chat_settings', '{}',
      'transition_enabled', true,
      'effects_enabled', true
    )
  ) INTO settings
  FROM view_mode_preferences 
  WHERE view_mode_preferences.user_id = get_user_view_mode_settings.user_id;
  
  RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;