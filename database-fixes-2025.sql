-- ============================================================================
-- GIFTSTASH DATABASE FIXES - 2025
-- Critical fixes for data consistency and performance
-- ============================================================================

-- Fix 1: Add default value and NOT NULL constraint to gift_recipients.status
-- This ensures every assignment has a clear status (no more null confusion)
ALTER TABLE gift_recipients
  ALTER COLUMN status SET DEFAULT 'idea',
  ALTER COLUMN status SET NOT NULL;

-- Backfill any null statuses to 'idea'
UPDATE gift_recipients SET status = 'idea' WHERE status IS NULL;

-- Fix 2: Add occasion and occasion_date to gift_recipients for per-recipient tracking
-- (These might already exist from previous migrations, using IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'gift_recipients' AND column_name = 'occasion') THEN
    ALTER TABLE gift_recipients ADD COLUMN occasion TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'gift_recipients' AND column_name = 'occasion_date') THEN
    ALTER TABLE gift_recipients ADD COLUMN occasion_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'gift_recipients' AND column_name = 'purchased_date') THEN
    ALTER TABLE gift_recipients ADD COLUMN purchased_date TIMESTAMPTZ;
  END IF;
END $$;

-- Fix 3: Create trigger to auto-set purchased_date when status changes to 'purchased'
CREATE OR REPLACE FUNCTION set_gift_recipient_purchased_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing TO purchased/wrapped/given, set purchased_date
  IF NEW.status IN ('purchased', 'wrapped', 'given')
     AND (OLD.status IS NULL OR OLD.status NOT IN ('purchased', 'wrapped', 'given')) THEN
    NEW.purchased_date = NOW();
  END IF;

  -- If status is changing FROM purchased back to idea, clear purchased_date
  IF NEW.status = 'idea'
     AND OLD.status IN ('purchased', 'wrapped', 'given') THEN
    NEW.purchased_date = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS gift_recipient_purchased_date_trigger ON gift_recipients;

-- Create the trigger
CREATE TRIGGER gift_recipient_purchased_date_trigger
  BEFORE UPDATE ON gift_recipients
  FOR EACH ROW
  EXECUTE FUNCTION set_gift_recipient_purchased_date();

-- Fix 4: Add index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_gift_recipients_recipient_id
  ON gift_recipients(recipient_id);

CREATE INDEX IF NOT EXISTS idx_gift_recipients_status
  ON gift_recipients(status);

CREATE INDEX IF NOT EXISTS idx_gifts_user_id
  ON gifts(user_id);

-- Fix 5: Create RPC function for transactional bulk status updates
CREATE OR REPLACE FUNCTION bulk_update_gift_recipient_status(
  assignment_ids UUID[],
  new_status TEXT,
  requesting_user_id UUID
)
RETURNS TABLE(success BOOLEAN, updated_count INTEGER, error_message TEXT) AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Validate status
  IF new_status NOT IN ('idea', 'purchased', 'wrapped', 'given') THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid status value'::TEXT;
    RETURN;
  END IF;

  -- Update all assignments in a single atomic transaction
  -- Only update if the user owns the associated gift (security check)
  UPDATE gift_recipients gr
  SET status = new_status,
      updated_at = NOW()
  FROM gifts g
  WHERE gr.id = ANY(assignment_ids)
    AND gr.gift_id = g.id
    AND g.user_id = requesting_user_id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Return success
  RETURN QUERY SELECT TRUE, v_updated_count, NULL::TEXT;

EXCEPTION WHEN OTHERS THEN
  -- Rollback happens automatically
  RETURN QUERY SELECT FALSE, 0, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 6: Create function to get gift status with proper hierarchy
CREATE OR REPLACE FUNCTION get_gift_status_for_recipient(
  p_gift_id UUID,
  p_recipient_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Try to get status from gift_recipients first
  SELECT status INTO v_status
  FROM gift_recipients
  WHERE gift_id = p_gift_id
    AND recipient_id = p_recipient_id;

  -- If found, return it
  IF FOUND THEN
    RETURN v_status;
  END IF;

  -- Otherwise, return the gift's default status
  SELECT status INTO v_status
  FROM gifts
  WHERE id = p_gift_id;

  RETURN COALESCE(v_status, 'idea');
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix 7: Add validation check constraint for status values
ALTER TABLE gift_recipients
  DROP CONSTRAINT IF EXISTS gift_recipients_status_check;

ALTER TABLE gift_recipients
  ADD CONSTRAINT gift_recipients_status_check
  CHECK (status IN ('idea', 'purchased', 'wrapped', 'given'));

ALTER TABLE gifts
  DROP CONSTRAINT IF EXISTS gifts_status_check;

ALTER TABLE gifts
  ADD CONSTRAINT gifts_status_check
  CHECK (status IN ('idea', 'purchased', 'wrapped', 'given'));

-- Fix 8: Add updated_at trigger for gift_recipients
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'gift_recipients' AND column_name = 'updated_at') THEN
    ALTER TABLE gift_recipients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

DROP TRIGGER IF EXISTS gift_recipients_updated_at_trigger ON gift_recipients;

CREATE TRIGGER gift_recipients_updated_at_trigger
  BEFORE UPDATE ON gift_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check the fixes worked)
-- ============================================================================

-- Check 1: Verify no null statuses remain
-- SELECT COUNT(*) FROM gift_recipients WHERE status IS NULL;
-- Expected: 0

-- Check 2: Verify indexes were created
-- SELECT indexname FROM pg_indexes WHERE tablename = 'gift_recipients';

-- Check 3: Verify constraints
-- SELECT conname FROM pg_constraint WHERE conrelid = 'gift_recipients'::regclass;

-- Check 4: Test the bulk update function
-- SELECT * FROM bulk_update_gift_recipient_status(
--   ARRAY['some-uuid']::UUID[],
--   'purchased',
--   'user-uuid'::UUID
-- );

COMMIT;
