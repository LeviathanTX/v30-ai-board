-- V21 AI Board of Advisors - Seed Data for Development
-- This file contains sample data for testing and development

-- Sample user (password: testuser123)
-- Note: You'll need to create this user through Supabase Auth first
-- Then update the UUID below with the actual user ID

-- Example user profile (replace 'YOUR-USER-ID' with actual auth.users id)
/*
INSERT INTO user_profiles (id, email, full_name, company_name, company_role, subscription_tier, onboarding_completed) VALUES
('YOUR-USER-ID', 'test@example.com', 'Test User', 'Acme Corp', 'CEO', 'professional', true);
*/

-- Sample documents (uncomment and update user_id after creating user)
/*
INSERT INTO documents (user_id, name, original_name, type, mime_type, size, status, content, summary, key_points) VALUES
('YOUR-USER-ID', 'Q4 Financial Report', 'q4-financial-report.pdf', 'financial_report', 'application/pdf', 245678, 'ready',
 'Q4 2023 Financial Report showing 15% revenue growth...', 
 'Strong Q4 performance with 15% YoY revenue growth and improved margins.',
 ARRAY['15% revenue growth', '23% margin improvement', 'Positive cash flow']),
 
('YOUR-USER-ID', 'Marketing Strategy 2024', 'marketing-strategy-2024.docx', 'strategy_document', 'application/docx', 156789, 'ready',
 'Marketing Strategy for 2024 focusing on digital transformation...', 
 'Comprehensive marketing strategy emphasizing digital channels and customer experience.',
 ARRAY['Digital-first approach', 'Customer experience focus', '40% budget increase']),
 
('YOUR-USER-ID', 'Product Roadmap', 'product-roadmap.xlsx', 'roadmap', 'application/xlsx', 98765, 'ready',
 'Product development roadmap for next 4 quarters...', 
 'Aggressive product roadmap with 3 major releases planned.',
 ARRAY['3 major releases', 'AI integration priority', 'Mobile-first development']);
*/

-- Sample conversations (uncomment and update user_id)
/*
INSERT INTO conversations (user_id, title, type, advisors, advisor_names, document_ids, message_count) VALUES
('YOUR-USER-ID', 'Q4 Financial Review', 'chat', 
 ARRAY['a1000000-0000-0000-0000-000000000002']::UUID[], 
 ARRAY['Marcus Johnson'], 
 ARRAY[]::UUID[], 
 5),
 
('YOUR-USER-ID', 'Strategic Planning Session', 'board_meeting', 
 ARRAY['a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003']::UUID[], 
 ARRAY['Sarah Chen', 'Marcus Johnson', 'Emily Rodriguez'], 
 ARRAY[]::UUID[], 
 12);
*/

-- Sample messages (uncomment and update conversation_id and user_id)
/*
INSERT INTO messages (conversation_id, user_id, advisor_id, role, content, advisor_name, tokens_used) VALUES
('CONVERSATION-ID', 'YOUR-USER-ID', NULL, 'user', 'Can you analyze our Q4 financial performance?', NULL, 15),
('CONVERSATION-ID', 'YOUR-USER-ID', 'a1000000-0000-0000-0000-000000000002', 'assistant', 
 'I''d be happy to analyze your Q4 financial performance. Based on the data available, I can see several key highlights...', 
 'Marcus Johnson', 125);
*/

-- Sample custom advisor (uncomment and update user_id)
/*
INSERT INTO advisors (user_id, name, role, type, expertise, personality, avatar_emoji, voice_profile) VALUES
('YOUR-USER-ID', 'Lisa Park', 'Head of Sales', 'custom',
 ARRAY['Sales Strategy', 'Team Leadership', 'Customer Relations', 'Revenue Growth'],
 '{"traits": ["driven", "personable", "results-oriented"], "communication_style": "motivational", "thinking_style": "goal-oriented"}',
 '💼',
 '{"model": "nova-2", "style": "energetic", "gender": "female", "speed": 1.1}');
*/

-- Sample usage logs (uncomment and update user_id)
/*
INSERT INTO usage_logs (user_id, type, resource_type, tokens_used, credits_used) VALUES
('YOUR-USER-ID', 'ai_conversation', 'conversation', 1500, 15),
('YOUR-USER-ID', 'document_processing', 'document', 0, 5),
('YOUR-USER-ID', 'advisor_creation', 'advisor', 0, 10);
*/

-- Sample advisor templates for marketplace
INSERT INTO advisor_templates (name, description, category, tags, base_advisor, price, is_featured, is_approved) VALUES
('Startup Fundraising Advisor', 
 'Expert advisor specialized in helping startups raise funding rounds',
 'Fundraising',
 ARRAY['startup', 'fundraising', 'venture capital', 'pitch deck'],
 '{"name": "Morgan Hayes", "role": "Fundraising Strategist", "expertise": ["Fundraising", "Pitch Decks", "Investor Relations", "Valuation"], "personality": {"traits": ["persuasive", "strategic", "well-connected"], "communication_style": "confident"}}',
 49.99,
 true,
 true),

('E-commerce Growth Specialist',
 'Dedicated advisor for scaling e-commerce businesses',
 'E-commerce',
 ARRAY['ecommerce', 'growth', 'conversion', 'marketing'],
 '{"name": "Jordan Liu", "role": "E-commerce Strategist", "expertise": ["E-commerce", "Conversion Optimization", "Digital Marketing", "Supply Chain"], "personality": {"traits": ["data-driven", "growth-focused", "practical"], "communication_style": "actionable"}}',
 39.99,
 true,
 true),

('HR Compliance Expert',
 'Ensures your company stays compliant with employment laws and regulations',
 'Human Resources',
 ARRAY['HR', 'compliance', 'employment law', 'policies'],
 '{"name": "Patricia Williams", "role": "HR Compliance Officer", "expertise": ["Employment Law", "HR Policies", "Compliance", "Risk Management"], "personality": {"traits": ["thorough", "cautious", "knowledgeable"], "communication_style": "precise"}}',
 59.99,
 false,
 true);

-- Development helper queries
-- Get all default advisors
SELECT id, name, role, expertise FROM advisors WHERE type = 'default' ORDER BY name;

-- Check subscription limits
SELECT * FROM subscription_limits ORDER BY 
  CASE tier 
    WHEN 'free' THEN 1 
    WHEN 'starter' THEN 2 
    WHEN 'professional' THEN 3 
    WHEN 'enterprise' THEN 4 
  END;

-- View user stats (once you have a user)
-- SELECT * FROM user_stats WHERE id = 'YOUR-USER-ID';