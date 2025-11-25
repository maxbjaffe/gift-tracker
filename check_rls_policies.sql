-- Check all RLS policies for recipients, gifts, and related tables
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
  AND tablename IN ('recipients', 'gifts', 'gift_recipients', 'user_profiles', 'chat_conversations')
ORDER BY tablename, cmd, policyname;
