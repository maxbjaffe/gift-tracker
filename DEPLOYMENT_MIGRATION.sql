-- =============================================================================
-- GIFT TRACKER - COMPLETE DATABASE SETUP FOR DEPLOYMENT
-- =============================================================================
-- Run this ONCE in your Supabase SQL Editor before deploying
-- This ensures your production database has all required updates
-- =============================================================================

-- 1. FIX AVATAR CONSTRAINT (Critical - App will break without this)
-- -----------------------------------------------------------------------------
ALTER TABLE recipients
DROP CONSTRAINT IF EXISTS recipients_avatar_type_check;

ALTER TABLE recipients
ADD CONSTRAINT recipients_avatar_type_check
CHECK (avatar_type IN ('preset', 'emoji', 'ai', 'photo', 'initials'));

-- 2. ADD MAX_PURCHASED_BUDGET COLUMN (If not already exists)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'recipients'
        AND column_name = 'max_purchased_budget'
    ) THEN
        ALTER TABLE recipients ADD COLUMN max_purchased_budget NUMERIC;
        COMMENT ON COLUMN recipients.max_purchased_budget IS 'Maximum budget already spent on purchased gifts for this recipient';
    END IF;
END $$;

-- 3. CREATE PERSONALITY SURVEYS TABLE (If not already exists)
-- -----------------------------------------------------------------------------
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

-- Add indexes for personality_surveys
CREATE INDEX IF NOT EXISTS idx_personality_surveys_recipient_id ON personality_surveys(recipient_id);
CREATE INDEX IF NOT EXISTS idx_personality_surveys_user_id ON personality_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_surveys_created_at ON personality_surveys(created_at DESC);

-- Enable RLS for personality_surveys
ALTER TABLE personality_surveys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own surveys" ON personality_surveys;
DROP POLICY IF EXISTS "Users can create surveys" ON personality_surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON personality_surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON personality_surveys;

-- Create RLS policies for personality_surveys
CREATE POLICY "Users can view their own surveys"
  ON personality_surveys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create surveys"
  ON personality_surveys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON personality_surveys
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys"
  ON personality_surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE personality_surveys IS 'Stores personality survey responses for recipients to help build comprehensive gift-giving profiles';
COMMENT ON COLUMN personality_surveys.responses IS 'JSON object containing all survey question responses';
COMMENT ON COLUMN personality_surveys.profile_suggestions IS 'AI-generated suggestions for profile updates based on survey responses';
COMMENT ON COLUMN personality_surveys.applied IS 'Whether the profile suggestions have been applied to the recipient profile';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these after the migration to verify everything worked:

-- Check avatar constraint
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'recipients'
AND con.conname = 'recipients_avatar_type_check';

-- Check if max_purchased_budget exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'recipients'
AND column_name = 'max_purchased_budget';

-- Check if personality_surveys table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'personality_surveys';

-- Check personality_surveys RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'personality_surveys';

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
-- If all queries above return results, your database is ready! ✅
-- You can now proceed with Vercel deployment.
-- =============================================================================
