-- Migration: Add personality surveys table
-- Date: 2025-11-13
-- Description: Stores personality survey responses for recipients to help build better profiles

-- Create personality_surveys table
CREATE TABLE IF NOT EXISTS personality_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  survey_version TEXT NOT NULL DEFAULT 'v1',
  responses JSONB NOT NULL,
  profile_suggestions JSONB,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_personality_surveys_recipient_id ON personality_surveys(recipient_id);
CREATE INDEX IF NOT EXISTS idx_personality_surveys_user_id ON personality_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_surveys_created_at ON personality_surveys(created_at DESC);

-- Add RLS policies
ALTER TABLE personality_surveys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own surveys
CREATE POLICY "Users can view their own surveys"
  ON personality_surveys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create surveys for their recipients
CREATE POLICY "Users can create surveys"
  ON personality_surveys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own surveys
CREATE POLICY "Users can update their own surveys"
  ON personality_surveys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own surveys
CREATE POLICY "Users can delete their own surveys"
  ON personality_surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE personality_surveys IS 'Stores personality survey responses for recipients to help build comprehensive gift-giving profiles';
COMMENT ON COLUMN personality_surveys.responses IS 'JSON object containing all survey question responses';
COMMENT ON COLUMN personality_surveys.profile_suggestions IS 'AI-generated suggestions for profile updates based on survey responses';
COMMENT ON COLUMN personality_surveys.applied IS 'Whether the profile suggestions have been applied to the recipient profile';
