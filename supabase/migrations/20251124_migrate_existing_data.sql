-- Migrate Existing Data to maxbjaffe@gmail.com
-- This assigns all existing GiftStash data to the original owner

-- ============================================================================
-- STEP 1: Get the user ID for maxbjaffe@gmail.com
-- ============================================================================

DO $$
DECLARE
  max_user_id UUID;
BEGIN
  -- Find the user ID for maxbjaffe@gmail.com
  SELECT id INTO max_user_id
  FROM auth.users
  WHERE email = 'maxbjaffe@gmail.com'
  LIMIT 1;

  IF max_user_id IS NULL THEN
    RAISE NOTICE 'User maxbjaffe@gmail.com not found. Please ensure the user exists before running this migration.';
    RAISE EXCEPTION 'User maxbjaffe@gmail.com not found';
  ELSE
    RAISE NOTICE 'Found user maxbjaffe@gmail.com with ID: %', max_user_id;
  END IF;

  -- ============================================================================
  -- STEP 2: Update all recipients to belong to maxbjaffe@gmail.com
  -- ============================================================================

  UPDATE recipients
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % recipients', (SELECT COUNT(*) FROM recipients WHERE user_id = max_user_id);

  -- ============================================================================
  -- STEP 3: Update all gifts to belong to maxbjaffe@gmail.com
  -- ============================================================================

  UPDATE gifts
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % gifts', (SELECT COUNT(*) FROM gifts WHERE user_id = max_user_id);

  -- ============================================================================
  -- STEP 4: Update all gift_recipients links
  -- The trigger will auto-populate user_id from gifts, but let's update existing ones
  -- ============================================================================

  UPDATE gift_recipients gr
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % gift_recipients links', (SELECT COUNT(*) FROM gift_recipients WHERE user_id = max_user_id);

  -- ============================================================================
  -- STEP 5: Update chat conversations
  -- ============================================================================

  UPDATE chat_conversations
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % chat conversations', (SELECT COUNT(*) FROM chat_conversations WHERE user_id = max_user_id);

  -- ============================================================================
  -- STEP 6: Update personality quiz responses
  -- ============================================================================

  UPDATE personality_quiz_responses
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % personality quiz responses', (SELECT COUNT(*) FROM personality_quiz_responses WHERE user_id = max_user_id);

  -- ============================================================================
  -- STEP 7: Update occasion reminders
  -- ============================================================================

  UPDATE occasion_reminders
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % occasion reminders', (SELECT COUNT(*) FROM occasion_reminders WHERE user_id = max_user_id);

  -- ============================================================================
  -- STEP 8: Update recipient budgets (if any null user_ids exist)
  -- ============================================================================

  UPDATE recipient_budgets
  SET user_id = max_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Updated % recipient budgets', (SELECT COUNT(*) FROM recipient_budgets WHERE user_id = max_user_id);

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Data migration complete!';
  RAISE NOTICE 'All existing data now belongs to maxbjaffe@gmail.com';
  RAISE NOTICE '============================================';

END $$;
