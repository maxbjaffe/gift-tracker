-- Complete Multi-Tenancy Migration for GiftStash
-- This migration ensures all GiftStash tables have user_id and proper RLS policies
-- Safe to run multiple times (uses IF NOT EXISTS and ADD COLUMN IF NOT EXISTS)

-- ============================================================================
-- STEP 1: Add user_id columns to all GiftStash tables (if not already present)
-- ============================================================================

-- Recipients table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recipients' AND column_name='user_id') THEN
    ALTER TABLE recipients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_recipients_user_id ON recipients(user_id);
  END IF;
END $$;

-- Gifts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gifts' AND column_name='user_id') THEN
    ALTER TABLE gifts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_gifts_user_id ON gifts(user_id);
  END IF;
END $$;

-- Gift Recipients junction table
-- This table links gifts to recipients, inherits user_id from the gift
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gift_recipients' AND column_name='user_id') THEN
    ALTER TABLE gift_recipients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_gift_recipients_user_id ON gift_recipients(user_id);
  END IF;
END $$;

-- Chat Conversations table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_conversations' AND column_name='user_id') THEN
    -- user_id already exists in this table, just ensure index
    CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
  END IF;
END $$;

-- Chat Messages table (inherits user_id from conversation)
-- No direct user_id needed, accessed via conversation

-- Personality Quiz Responses table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personality_quiz_responses' AND column_name='user_id') THEN
    ALTER TABLE personality_quiz_responses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_personality_quiz_user_id ON personality_quiz_responses(user_id);
  END IF;
END $$;

-- Occasion Reminders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='occasion_reminders' AND column_name='user_id') THEN
    -- user_id already exists in this table, just ensure index
    CREATE INDEX IF NOT EXISTS idx_occasion_reminders_user_id ON occasion_reminders(user_id);
  END IF;
END $$;

-- Note: recipient_budgets already has user_id and RLS from 20251124_recipient_budgets.sql

-- ============================================================================
-- STEP 2: Enable Row Level Security on all tables
-- ============================================================================

ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasion_reminders ENABLE ROW LEVEL SECURITY;
-- recipient_budgets RLS already enabled in its migration

-- ============================================================================
-- STEP 3: Drop existing policies (in case they exist from add_user_id_to_tables.sql)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete their own recipients" ON recipients;

DROP POLICY IF EXISTS "Users can view their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can insert their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can update their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can delete their own gifts" ON gifts;

DROP POLICY IF EXISTS "chat_conversations_select" ON chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_insert" ON chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_update" ON chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_delete" ON chat_conversations;

DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete" ON chat_messages;

DROP POLICY IF EXISTS "personality_quiz_select" ON personality_quiz_responses;
DROP POLICY IF EXISTS "personality_quiz_insert" ON personality_quiz_responses;
DROP POLICY IF EXISTS "personality_quiz_update" ON personality_quiz_responses;
DROP POLICY IF EXISTS "personality_quiz_delete" ON personality_quiz_responses;

DROP POLICY IF EXISTS "occasion_reminders_select" ON occasion_reminders;
DROP POLICY IF EXISTS "occasion_reminders_insert" ON occasion_reminders;
DROP POLICY IF EXISTS "occasion_reminders_update" ON occasion_reminders;
DROP POLICY IF EXISTS "occasion_reminders_delete" ON occasion_reminders;

-- ============================================================================
-- STEP 4: Create comprehensive RLS policies for all tables
-- ============================================================================

-- RECIPIENTS TABLE POLICIES
CREATE POLICY "Users can view their own recipients"
  ON recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipients"
  ON recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipients"
  ON recipients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipients"
  ON recipients FOR DELETE
  USING (auth.uid() = user_id);

-- GIFTS TABLE POLICIES
CREATE POLICY "Users can view their own gifts"
  ON gifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gifts"
  ON gifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gifts"
  ON gifts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gifts"
  ON gifts FOR DELETE
  USING (auth.uid() = user_id);

-- GIFT_RECIPIENTS TABLE POLICIES
-- Users can only link their own gifts to recipients
CREATE POLICY "Users can view their own gift-recipient links"
  ON gift_recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gift-recipient links"
  ON gift_recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gift-recipient links"
  ON gift_recipients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gift-recipient links"
  ON gift_recipients FOR DELETE
  USING (auth.uid() = user_id);

-- CHAT CONVERSATIONS POLICIES
CREATE POLICY "Users can view their own chat conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat conversations"
  ON chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- CHAT MESSAGES POLICIES
-- Messages are accessed via conversations, so we check the conversation's user_id
CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their conversations"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- PERSONALITY QUIZ RESPONSES POLICIES
CREATE POLICY "Users can view their own quiz responses"
  ON personality_quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz responses"
  ON personality_quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz responses"
  ON personality_quiz_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz responses"
  ON personality_quiz_responses FOR DELETE
  USING (auth.uid() = user_id);

-- OCCASION REMINDERS POLICIES
CREATE POLICY "Users can view their own occasion reminders"
  ON occasion_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own occasion reminders"
  ON occasion_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own occasion reminders"
  ON occasion_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own occasion reminders"
  ON occasion_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Create triggers to auto-populate user_id in gift_recipients
-- ============================================================================

-- When a gift_recipient link is created, automatically set user_id from the gift
CREATE OR REPLACE FUNCTION set_gift_recipient_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the user_id from the gift
  SELECT user_id INTO NEW.user_id
  FROM gifts
  WHERE id = NEW.gift_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_gift_recipient_user_id ON gift_recipients;

CREATE TRIGGER trigger_set_gift_recipient_user_id
  BEFORE INSERT ON gift_recipients
  FOR EACH ROW
  EXECUTE FUNCTION set_gift_recipient_user_id();

-- ============================================================================
-- STEP 6: Create trigger to sync user_id in personality_quiz_responses
-- ============================================================================

-- When a quiz response is created, auto-set user_id from the recipient
CREATE OR REPLACE FUNCTION set_quiz_response_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the user_id from the recipient
  SELECT user_id INTO NEW.user_id
  FROM recipients
  WHERE id = NEW.recipient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_quiz_response_user_id ON personality_quiz_responses;

CREATE TRIGGER trigger_set_quiz_response_user_id
  BEFORE INSERT ON personality_quiz_responses
  FOR EACH ROW
  WHEN (NEW.user_id IS NULL)
  EXECUTE FUNCTION set_quiz_response_user_id();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN recipients.user_id IS 'Owner of this recipient profile';
COMMENT ON COLUMN gifts.user_id IS 'Owner of this gift idea';
COMMENT ON COLUMN gift_recipients.user_id IS 'Inherited from gift.user_id automatically via trigger';
COMMENT ON COLUMN personality_quiz_responses.user_id IS 'Inherited from recipient.user_id automatically via trigger';
COMMENT ON COLUMN chat_conversations.user_id IS 'Owner of this chat conversation';
COMMENT ON COLUMN occasion_reminders.user_id IS 'Owner of this reminder';
