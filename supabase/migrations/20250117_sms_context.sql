-- Migration: SMS Conversation Context
-- Adds conversation state management for multi-turn SMS interactions

-- Create sms_context table to store conversation state
CREATE TABLE IF NOT EXISTS sms_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT NOT NULL,
  last_intent TEXT NOT NULL,
  pending_clarification TEXT,
  context_data JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sms_context_phone_number ON sms_context(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_context_user_id ON sms_context(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_context_expires_at ON sms_context(expires_at);

-- Add comment for documentation
COMMENT ON TABLE sms_context IS 'Stores conversation state for multi-turn SMS interactions (30 min expiry)';
COMMENT ON COLUMN sms_context.context_data IS 'JSON data containing partial consequences, commitments, last child mentioned, etc.';
COMMENT ON COLUMN sms_context.pending_clarification IS 'Question sent to user awaiting response';
COMMENT ON COLUMN sms_context.expires_at IS 'Conversation expires after 30 minutes of inactivity';

-- Enable Row Level Security
ALTER TABLE sms_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sms_context
CREATE POLICY "Users can view own SMS context"
  ON sms_context
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all SMS context"
  ON sms_context
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sms_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS update_sms_context_updated_at ON sms_context;
CREATE TRIGGER update_sms_context_updated_at
  BEFORE UPDATE ON sms_context
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_context_updated_at();
