-- Fix: "infinite recursion detected in policy for relation gift_recipients"
--
-- Problem: Multiple overlapping RLS policies on gift_recipients create circular
-- evaluation. Some policies subquery into `gifts`, which can trigger policies
-- that reference back to `gift_recipients`.
--
-- Solution: Drop ALL policies, recreate with simple user_id checks only.
-- The `set_gift_recipient_user_id` trigger auto-populates user_id from the
-- parent gift, so we don't need subqueries.
--
-- Run this in Supabase Dashboard SQL Editor.

-- ============================================================================
-- Step 1: Drop ALL existing policies on gift_recipients (both naming styles)
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gift_recipients'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON gift_recipients', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- Step 2: Ensure user_id column exists on gift_recipients
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_recipients' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE gift_recipients ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Added user_id column to gift_recipients';
  END IF;
END $$;

-- Backfill any rows missing user_id
UPDATE gift_recipients gr
SET user_id = g.user_id
FROM gifts g
WHERE gr.gift_id = g.id
AND gr.user_id IS NULL;

-- ============================================================================
-- Step 3: Ensure trigger exists to auto-populate user_id on insert
-- ============================================================================

CREATE OR REPLACE FUNCTION set_gift_recipient_user_id()
RETURNS TRIGGER
SECURITY DEFINER  -- Bypass RLS so the trigger can read gifts table
AS $$
BEGIN
  SELECT user_id INTO NEW.user_id
  FROM gifts
  WHERE id = NEW.gift_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS set_gift_recipient_user_id_trigger ON gift_recipients;
CREATE TRIGGER set_gift_recipient_user_id_trigger
  BEFORE INSERT ON gift_recipients
  FOR EACH ROW
  EXECUTE FUNCTION set_gift_recipient_user_id();

-- ============================================================================
-- Step 4: Create clean policies using direct user_id (NO subqueries)
-- ============================================================================

ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_recipients_select"
  ON gift_recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gift_recipients_insert"
  ON gift_recipients FOR INSERT
  WITH CHECK (
    -- Allow insert if user_id matches OR is null (trigger will set it)
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "gift_recipients_update"
  ON gift_recipients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gift_recipients_delete"
  ON gift_recipients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Step 5: Verify — should show exactly 4 clean policies
-- ============================================================================

SELECT policyname, cmd, permissive
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'gift_recipients'
ORDER BY cmd;
