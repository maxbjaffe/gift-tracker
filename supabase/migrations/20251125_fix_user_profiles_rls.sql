-- Fix user_profiles RLS policies to avoid circular dependency
-- The issue: "Admins can view all profiles" policy was checking user_profiles
-- within a user_profiles policy, causing a 500 error

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;

-- Create simpler, non-circular policies
-- Users can always view their own profile
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- For now, only allow updates through RPC functions
-- (The admin_delete_user function already handles admin checks internally)

-- Verify the fix
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_profiles'
ORDER BY policyname;
