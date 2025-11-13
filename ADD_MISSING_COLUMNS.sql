-- =============================================================================
-- ADD MISSING USER_ID COLUMNS TO EXISTING TABLES
-- =============================================================================
-- This script safely adds user_id columns to tables that are missing them
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Add user_id to recipients table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'recipients'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE recipients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        COMMENT ON COLUMN recipients.user_id IS 'User who owns this recipient profile';
    END IF;
END $$;

-- Add user_id to gifts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gifts'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE gifts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        COMMENT ON COLUMN gifts.user_id IS 'User who owns this gift';
    END IF;
END $$;

-- Add user_id to personality_surveys table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'personality_surveys'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE personality_surveys ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        COMMENT ON COLUMN personality_surveys.user_id IS 'User who created this survey';
    END IF;
END $$;

-- Verify the columns were added
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('recipients', 'gifts', 'personality_surveys')
AND column_name = 'user_id'
ORDER BY table_name;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
-- If you see 3 rows above (recipients, gifts, personality_surveys with user_id),
-- the columns were added successfully!
-- Now run the FIX_ALL_RLS_POLICIES.sql script to enable RLS
-- =============================================================================
