-- Clean up duplicate RLS policies that may be conflicting
-- Keep only the ones we need

-- ============================================================================
-- RECIPIENTS TABLE - Remove duplicates, keep only one set
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete their own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can create their own recipients" ON recipients;

-- Create clean, simple policies
CREATE POLICY "recipients_select_own"
  ON recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "recipients_insert_own"
  ON recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipients_update_own"
  ON recipients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipients_delete_own"
  ON recipients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- GIFTS TABLE - Remove duplicates, keep only one set
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can insert their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can update their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can delete their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can create their own gifts" ON gifts;

-- Create clean, simple policies
CREATE POLICY "gifts_select_own"
  ON gifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gifts_insert_own"
  ON gifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gifts_update_own"
  ON gifts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gifts_delete_own"
  ON gifts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- GIFT_RECIPIENTS TABLE - Simplify to just check user_id
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own gift-recipient links" ON gift_recipients;
DROP POLICY IF EXISTS "Users can insert their own gift-recipient links" ON gift_recipients;
DROP POLICY IF EXISTS "Users can update their own gift-recipient links" ON gift_recipients;
DROP POLICY IF EXISTS "Users can delete their own gift-recipient links" ON gift_recipients;
DROP POLICY IF EXISTS "Users can view gift-recipient links for their gifts" ON gift_recipients;
DROP POLICY IF EXISTS "Users can create gift-recipient links for their gifts" ON gift_recipients;
DROP POLICY IF EXISTS "Users can delete gift-recipient links for their gifts" ON gift_recipients;

-- Create clean, simple policies (user_id is auto-populated by trigger)
CREATE POLICY "gift_recipients_select_own"
  ON gift_recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gift_recipients_insert_own"
  ON gift_recipients FOR INSERT
  WITH CHECK (
    -- Either user_id matches (will be set by trigger)
    -- OR the gift belongs to the user (trigger will set user_id)
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_recipients.gift_id
      AND gifts.user_id = auth.uid()
    )
  );

CREATE POLICY "gift_recipients_update_own"
  ON gift_recipients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gift_recipients_delete_own"
  ON gift_recipients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List remaining policies (should be clean and simple)
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('recipients', 'gifts', 'gift_recipients')
ORDER BY tablename, cmd, policyname;
