-- Fix RLS policies for recipients table
-- Run this in your Supabase SQL Editor

-- Enable RLS on recipients table (if not already enabled)
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can create their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete their own recipients" ON recipients;

-- Create RLS policies for recipients table
-- Policy 1: Allow users to view their own recipients
CREATE POLICY "Users can view their own recipients"
ON recipients FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Allow users to insert their own recipients
CREATE POLICY "Users can create their own recipients"
ON recipients FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to update their own recipients
CREATE POLICY "Users can update their own recipients"
ON recipients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow users to delete their own recipients
CREATE POLICY "Users can delete their own recipients"
ON recipients FOR DELETE
USING (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'recipients'
ORDER BY policyname;
