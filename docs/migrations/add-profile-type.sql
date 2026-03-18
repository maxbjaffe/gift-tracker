-- Add profile_type column to recipients table
-- Allows recipients to be either people (NULL or 'person') or occasion profiles (e.g., 'teacher', 'coworker')
-- Run this in Supabase Dashboard SQL Editor

ALTER TABLE recipients ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_recipients_profile_type ON recipients(user_id, profile_type);
