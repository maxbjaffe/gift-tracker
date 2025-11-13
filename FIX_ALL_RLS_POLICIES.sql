-- Complete RLS setup for all tables in production
-- Run this in your Supabase SQL Editor

-- ============================================
-- RECIPIENTS TABLE
-- ============================================
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can create their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete their own recipients" ON recipients;

CREATE POLICY "Users can view their own recipients"
ON recipients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipients"
ON recipients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipients"
ON recipients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipients"
ON recipients FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- GIFTS TABLE
-- ============================================
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can create their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can update their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can delete their own gifts" ON gifts;

CREATE POLICY "Users can view their own gifts"
ON gifts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gifts"
ON gifts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gifts"
ON gifts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gifts"
ON gifts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- GIFT_RECIPIENTS TABLE (junction table)
-- ============================================
ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view gift-recipient links for their gifts" ON gift_recipients;
DROP POLICY IF EXISTS "Users can create gift-recipient links for their gifts" ON gift_recipients;
DROP POLICY IF EXISTS "Users can delete gift-recipient links for their gifts" ON gift_recipients;

-- Users can view links if they own the gift
CREATE POLICY "Users can view gift-recipient links for their gifts"
ON gift_recipients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gifts
    WHERE gifts.id = gift_recipients.gift_id
    AND gifts.user_id = auth.uid()
  )
);

-- Users can create links if they own the gift
CREATE POLICY "Users can create gift-recipient links for their gifts"
ON gift_recipients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gifts
    WHERE gifts.id = gift_recipients.gift_id
    AND gifts.user_id = auth.uid()
  )
);

-- Users can delete links if they own the gift
CREATE POLICY "Users can delete gift-recipient links for their gifts"
ON gift_recipients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM gifts
    WHERE gifts.id = gift_recipients.gift_id
    AND gifts.user_id = auth.uid()
  )
);

-- ============================================
-- RECOMMENDATION_FEEDBACK TABLE
-- ============================================
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own feedback" ON recommendation_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON recommendation_feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON recommendation_feedback;

CREATE POLICY "Users can view their own feedback"
ON recommendation_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipients
    WHERE recipients.id = recommendation_feedback.recipient_id
    AND recipients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own feedback"
ON recommendation_feedback FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipients
    WHERE recipients.id = recommendation_feedback.recipient_id
    AND recipients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own feedback"
ON recommendation_feedback FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM recipients
    WHERE recipients.id = recommendation_feedback.recipient_id
    AND recipients.user_id = auth.uid()
  )
);

-- ============================================
-- VERIFY ALL POLICIES
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
