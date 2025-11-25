-- Fix: Ensure maxbjaffe@gmail.com has admin profile
-- Run this if admin access isn't working

-- First, check current status
SELECT
  id,
  email,
  (SELECT is_admin FROM user_profiles WHERE user_profiles.id = auth.users.id) as is_admin
FROM auth.users
WHERE email = 'maxbjaffe@gmail.com';

-- Force insert/update admin profile
INSERT INTO user_profiles (id, email, is_admin, created_at)
SELECT
  id,
  email,
  true as is_admin,
  created_at
FROM auth.users
WHERE email = 'maxbjaffe@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  email = EXCLUDED.email;

-- Verify it worked
SELECT
  id,
  email,
  is_admin,
  created_at
FROM user_profiles
WHERE email = 'maxbjaffe@gmail.com';
