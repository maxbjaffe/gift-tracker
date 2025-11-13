-- =============================================================================
-- GIFT TRACKER - COMPLETE DATABASE SETUP FROM SCRATCH
-- =============================================================================
-- Run this in your Supabase SQL Editor to set up the entire database
-- This will create all tables and RLS policies
-- =============================================================================

-- =============================================================================
-- 1. CREATE TABLES
-- =============================================================================

-- RECIPIENTS TABLE
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  birthday DATE,
  age_range TEXT,
  gender TEXT,
  avatar_type TEXT CHECK (avatar_type IN ('preset', 'emoji', 'ai', 'photo', 'initials')),
  avatar_data TEXT,
  avatar_background TEXT,
  avatar_url TEXT,
  interests TEXT[],
  hobbies TEXT[],
  favorite_colors TEXT[],
  favorite_brands TEXT[],
  favorite_stores TEXT[],
  gift_preferences TEXT,
  gift_dos TEXT[],
  gift_donts TEXT[],
  restrictions TEXT[],
  clothing_sizes JSONB,
  wishlist_items JSONB,
  past_gifts_received JSONB,
  items_already_owned TEXT[],
  max_budget NUMERIC,
  max_purchased_budget NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIFTS TABLE
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  url TEXT,
  image_url TEXT,
  store TEXT,
  brand TEXT,
  current_price NUMERIC,
  original_price NUMERIC,
  price_history JSONB,
  price_last_checked TIMESTAMPTZ,
  status TEXT DEFAULT 'idea',
  priority TEXT,
  purchase_date DATE,
  occasion TEXT,
  occasion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIFT_RECIPIENTS TABLE (Junction table)
CREATE TABLE IF NOT EXISTS gift_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gift_id, recipient_id)
);

-- RECOMMENDATION_FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  recommendation_name TEXT NOT NULL,
  recommendation_description TEXT,
  feedback_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERSONALITY_SURVEYS TABLE
CREATE TABLE IF NOT EXISTS personality_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  survey_version TEXT NOT NULL DEFAULT 'v1',
  responses JSONB NOT NULL,
  profile_suggestions JSONB,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE INDEXES
-- =============================================================================

-- Recipients indexes
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_created_at ON recipients(created_at DESC);

-- Gifts indexes
CREATE INDEX IF NOT EXISTS idx_gifts_user_id ON gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts(created_at DESC);

-- Gift_recipients indexes
CREATE INDEX IF NOT EXISTS idx_gift_recipients_gift_id ON gift_recipients(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_recipients_recipient_id ON gift_recipients(recipient_id);

-- Recommendation_feedback indexes
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recipient_id ON recommendation_feedback(recipient_id);

-- Personality_surveys indexes
CREATE INDEX IF NOT EXISTS idx_personality_surveys_recipient_id ON personality_surveys(recipient_id);
CREATE INDEX IF NOT EXISTS idx_personality_surveys_user_id ON personality_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_surveys_created_at ON personality_surveys(created_at DESC);

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_surveys ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE RLS POLICIES - RECIPIENTS
-- =============================================================================

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

-- =============================================================================
-- 5. CREATE RLS POLICIES - GIFTS
-- =============================================================================

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

-- =============================================================================
-- 6. CREATE RLS POLICIES - GIFT_RECIPIENTS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view gift-recipient links for their gifts" ON gift_recipients;
DROP POLICY IF EXISTS "Users can create gift-recipient links for their gifts" ON gift_recipients;
DROP POLICY IF EXISTS "Users can delete gift-recipient links for their gifts" ON gift_recipients;

CREATE POLICY "Users can view gift-recipient links for their gifts"
ON gift_recipients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gifts
    WHERE gifts.id = gift_recipients.gift_id
    AND gifts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create gift-recipient links for their gifts"
ON gift_recipients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gifts
    WHERE gifts.id = gift_recipients.gift_id
    AND gifts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete gift-recipient links for their gifts"
ON gift_recipients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM gifts
    WHERE gifts.id = gift_recipients.gift_id
    AND gifts.user_id = auth.uid()
  )
);

-- =============================================================================
-- 7. CREATE RLS POLICIES - RECOMMENDATION_FEEDBACK
-- =============================================================================

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

-- =============================================================================
-- 8. CREATE RLS POLICIES - PERSONALITY_SURVEYS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own surveys" ON personality_surveys;
DROP POLICY IF EXISTS "Users can create surveys" ON personality_surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON personality_surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON personality_surveys;

CREATE POLICY "Users can view their own surveys"
ON personality_surveys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create surveys"
ON personality_surveys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
ON personality_surveys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys"
ON personality_surveys FOR DELETE
USING (auth.uid() = user_id);

-- =============================================================================
-- 9. VERIFICATION QUERIES
-- =============================================================================

-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('recipients', 'gifts', 'gift_recipients', 'recommendation_feedback', 'personality_surveys')
ORDER BY table_name;

-- Check all RLS policies
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

-- =============================================================================
-- SUCCESS! ✅
-- =============================================================================
-- All tables, indexes, and RLS policies have been created
-- Your database is ready for production deployment
-- =============================================================================
