-- Migration: SMS Tracking and Gift Source Attribution
-- Adds SMS message logging and source tracking for gifts

-- Create SMS messages table to log all incoming SMS
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  parsed_data JSONB, -- Store extracted gift info
  created_gift_id UUID REFERENCES gifts(id) ON DELETE SET NULL,
  processing_status TEXT DEFAULT 'received', -- received, processed, error
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add source tracking columns to gifts table
ALTER TABLE gifts
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_metadata JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_sms_messages_user_id ON sms_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gifts_source ON gifts(source);

-- Add comment for documentation
COMMENT ON TABLE sms_messages IS 'Logs all incoming SMS messages for gift tracking';
COMMENT ON COLUMN gifts.source IS 'How the gift was added: manual, sms, browser_extension, ai_recommendation';
COMMENT ON COLUMN gifts.source_metadata IS 'Additional data about the source (original SMS, URL, etc)';

-- Enable Row Level Security
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sms_messages
CREATE POLICY "Users can view own SMS messages"
  ON sms_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMS messages"
  ON sms_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SMS messages"
  ON sms_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sms_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_sms_messages_updated_at
  BEFORE UPDATE ON sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_messages_updated_at();
