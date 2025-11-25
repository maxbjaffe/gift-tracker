-- Diagnostic Query to Check RLS Status and Data
-- Run this in Supabase SQL Editor to see what's wrong

-- ============================================================================
-- CHECK 1: Are RLS policies enabled on tables?
-- ============================================================================
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('recipients', 'gifts', 'gift_recipients', 'recipient_budgets')
ORDER BY tablename;

-- ============================================================================
-- CHECK 2: What policies exist?
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('recipients', 'gifts', 'gift_recipients', 'recipient_budgets')
ORDER BY tablename, policyname;

-- ============================================================================
-- CHECK 3: Do recipients have user_id set?
-- ============================================================================
SELECT
  COUNT(*) as total_recipients,
  COUNT(user_id) as recipients_with_user_id,
  COUNT(*) - COUNT(user_id) as recipients_without_user_id
FROM recipients;

-- ============================================================================
-- CHECK 4: Do gifts have user_id set?
-- ============================================================================
SELECT
  COUNT(*) as total_gifts,
  COUNT(user_id) as gifts_with_user_id,
  COUNT(*) - COUNT(user_id) as gifts_without_user_id
FROM gifts;

-- ============================================================================
-- CHECK 5: Sample of recipients with user_id
-- ============================================================================
SELECT
  id,
  name,
  user_id,
  (SELECT email FROM auth.users WHERE id = recipients.user_id) as user_email
FROM recipients
LIMIT 10;

-- ============================================================================
-- CHECK 6: Sample of gifts with user_id
-- ============================================================================
SELECT
  id,
  name,
  user_id,
  (SELECT email FROM auth.users WHERE id = gifts.user_id) as user_email
FROM gifts
LIMIT 10;

-- ============================================================================
-- CHECK 7: Check both user accounts exist
-- ============================================================================
SELECT
  id,
  email,
  created_at
FROM auth.users
WHERE email IN ('maxbjaffe@gmail.com', 'max.jaffe@thetradedesk.com')
ORDER BY email;
