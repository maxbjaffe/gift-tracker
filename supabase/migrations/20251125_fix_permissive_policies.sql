-- Fix: Remove overly permissive RLS policies that allow all access
-- These "Allow all" policies were bypassing the proper user isolation

-- Drop the permissive policies on recipients
DROP POLICY IF EXISTS "Allow all for recipients" ON recipients;

-- Drop the permissive policies on gifts
DROP POLICY IF EXISTS "Allow all for gifts" ON gifts;

-- Drop the permissive policies on gift_recipients
DROP POLICY IF EXISTS "Allow all for gift_recipients" ON gift_recipients;

-- Verify the remaining policies are correct (these should stay)
-- Recipients: Users can only access their own
-- Gifts: Users can only access their own
-- Gift_recipients: Users can only access links for their own gifts

COMMENT ON TABLE recipients IS 'RLS enabled - users can only see their own recipients';
COMMENT ON TABLE gifts IS 'RLS enabled - users can only see their own gifts';
COMMENT ON TABLE gift_recipients IS 'RLS enabled - users can only see links for their own gifts';
