-- Database Schema Updates for New Features
-- Gift Tracker Enhancement: Chat, Calendar, Personality, Avatars

-- 1. Update recipients table with avatar and personality fields
-- Note: Run the migration in supabase/migrations/update_avatar_type_constraint.sql to update existing constraints
ALTER TABLE recipients
ADD COLUMN IF NOT EXISTS avatar_type TEXT CHECK (avatar_type IN ('preset', 'emoji', 'ai', 'photo', 'initials')),
ADD COLUMN IF NOT EXISTS avatar_data TEXT,
ADD COLUMN IF NOT EXISTS avatar_background TEXT,
ADD COLUMN IF NOT EXISTS personality_type TEXT,
ADD COLUMN IF NOT EXISTS personality_description TEXT;

-- 2. Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create personality_quiz_responses table
CREATE TABLE IF NOT EXISTS personality_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  quiz_data JSONB NOT NULL,
  personality_type TEXT NOT NULL,
  personality_description TEXT,
  score_breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create occasion_reminders table
CREATE TABLE IF NOT EXISTS occasion_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  occasion_name TEXT NOT NULL,
  occasion_date DATE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('two_weeks', 'one_week', 'three_days', 'one_day')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_recipient ON chat_conversations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_personality_quiz_recipient ON personality_quiz_responses(recipient_id);
CREATE INDEX IF NOT EXISTS idx_occasion_reminders_recipient ON occasion_reminders(recipient_id);
CREATE INDEX IF NOT EXISTS idx_occasion_reminders_date ON occasion_reminders(occasion_date);

-- Enable Row Level Security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasion_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
-- For development, these are permissive. Tighten for production.

-- Chat conversations policies
CREATE POLICY chat_conversations_select ON chat_conversations FOR SELECT USING (true);
CREATE POLICY chat_conversations_insert ON chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY chat_conversations_update ON chat_conversations FOR UPDATE USING (true);
CREATE POLICY chat_conversations_delete ON chat_conversations FOR DELETE USING (true);

-- Chat messages policies
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT USING (true);
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY chat_messages_update ON chat_messages FOR UPDATE USING (true);
CREATE POLICY chat_messages_delete ON chat_messages FOR DELETE USING (true);

-- Personality quiz policies
CREATE POLICY personality_quiz_select ON personality_quiz_responses FOR SELECT USING (true);
CREATE POLICY personality_quiz_insert ON personality_quiz_responses FOR INSERT WITH CHECK (true);
CREATE POLICY personality_quiz_update ON personality_quiz_responses FOR UPDATE USING (true);
CREATE POLICY personality_quiz_delete ON personality_quiz_responses FOR DELETE USING (true);

-- Occasion reminders policies
CREATE POLICY occasion_reminders_select ON occasion_reminders FOR SELECT USING (true);
CREATE POLICY occasion_reminders_insert ON occasion_reminders FOR INSERT WITH CHECK (true);
CREATE POLICY occasion_reminders_update ON occasion_reminders FOR UPDATE USING (true);
CREATE POLICY occasion_reminders_delete ON occasion_reminders FOR DELETE USING (true);
