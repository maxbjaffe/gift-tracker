-- Migration: Enhanced AI Recommendation Feedback System (Clean Version)
-- Date: November 26, 2024
-- Purpose: Track recommendation feedback and build learning system

-- ============================================================================
-- CLEAN UP ANY EXISTING OBJECTS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS recommendation_feedback_select_own ON recommendation_feedback;
DROP POLICY IF EXISTS recommendation_feedback_insert_own ON recommendation_feedback;
DROP POLICY IF EXISTS trending_gifts_select_all ON trending_gifts;
DROP POLICY IF EXISTS trending_gifts_insert_system ON trending_gifts;
DROP POLICY IF EXISTS trending_gifts_update_system ON trending_gifts;

-- Drop existing tables
DROP TABLE IF EXISTS recommendation_feedback CASCADE;
DROP TABLE IF EXISTS trending_gifts CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_trending_gifts_for_profile(TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_dismissed_recommendations(UUID);
DROP FUNCTION IF EXISTS get_successful_gifts_for_similar_recipients(TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS update_trending_gifts();

-- ============================================================================
-- RECOMMENDATION FEEDBACK TABLE
-- ============================================================================

CREATE TABLE recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  -- Recommendation Details
  recommendation_name TEXT NOT NULL,
  recommendation_description TEXT,
  recommendation_category TEXT,
  recommendation_price DECIMAL(10,2),
  recommendation_store TEXT,
  recommendation_brand TEXT,

  -- Feedback Type
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('added', 'dismissed', 'purchased', 'viewed')),

  -- Context at time of recommendation
  recipient_age_range TEXT,
  recipient_interests TEXT,
  recipient_relationship TEXT,
  occasion TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT
);

-- Indexes for performance
CREATE INDEX idx_recommendation_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_recipient ON recommendation_feedback(recipient_id);
CREATE INDEX idx_recommendation_feedback_type ON recommendation_feedback(feedback_type);
CREATE INDEX idx_recommendation_feedback_created ON recommendation_feedback(created_at DESC);
CREATE INDEX idx_recommendation_feedback_brand ON recommendation_feedback(recommendation_brand) WHERE recommendation_brand IS NOT NULL;
CREATE INDEX idx_recommendation_feedback_store ON recommendation_feedback(recommendation_store) WHERE recommendation_store IS NOT NULL;

-- ============================================================================
-- TRENDING GIFTS TRACKING
-- ============================================================================

CREATE TABLE trending_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Gift identification
  gift_name TEXT NOT NULL,
  gift_category TEXT,
  gift_brand TEXT,
  gift_store TEXT,
  normalized_name TEXT NOT NULL,

  -- Metrics
  add_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  avg_price DECIMAL(10,2),

  -- Demographics
  popular_with_age_ranges TEXT[],
  popular_for_relationships TEXT[],
  popular_occasions TEXT[],

  -- Time tracking
  last_added_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(normalized_name)
);

-- Indexes
CREATE INDEX idx_trending_gifts_add_count ON trending_gifts(add_count DESC);
CREATE INDEX idx_trending_gifts_purchase_count ON trending_gifts(purchase_count DESC);
CREATE INDEX idx_trending_gifts_category ON trending_gifts(gift_category) WHERE gift_category IS NOT NULL;
CREATE INDEX idx_trending_gifts_brand ON trending_gifts(gift_brand) WHERE gift_brand IS NOT NULL;
CREATE INDEX idx_trending_gifts_updated ON trending_gifts(updated_at DESC);

-- ============================================================================
-- FUNCTIONS FOR ANALYTICS
-- ============================================================================

-- Function to get trending gifts for a specific demographic
CREATE OR REPLACE FUNCTION get_trending_gifts_for_profile(
  p_age_range TEXT DEFAULT NULL,
  p_relationship TEXT DEFAULT NULL,
  p_occasion TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  gift_name TEXT,
  gift_category TEXT,
  gift_brand TEXT,
  gift_store TEXT,
  add_count INTEGER,
  purchase_count INTEGER,
  avg_price DECIMAL(10,2),
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tg.gift_name,
    tg.gift_category,
    tg.gift_brand,
    tg.gift_store,
    tg.add_count,
    tg.purchase_count,
    tg.avg_price,
    -- Calculate relevance score
    (
      tg.add_count * 2 +
      tg.purchase_count * 5 +
      CASE WHEN p_age_range = ANY(tg.popular_with_age_ranges) THEN 10 ELSE 0 END +
      CASE WHEN p_relationship = ANY(tg.popular_for_relationships) THEN 10 ELSE 0 END +
      CASE WHEN p_occasion = ANY(tg.popular_occasions) THEN 10 ELSE 0 END
    ) AS relevance_score
  FROM trending_gifts tg
  WHERE
    tg.add_count >= 2
    AND tg.updated_at > NOW() - INTERVAL '90 days'
  ORDER BY relevance_score DESC, tg.add_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get dismissed recommendations for a recipient
CREATE OR REPLACE FUNCTION get_dismissed_recommendations(
  p_recipient_id UUID
)
RETURNS TABLE (
  recommendation_name TEXT,
  dismissed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rf.recommendation_name,
    rf.created_at
  FROM recommendation_feedback rf
  WHERE
    rf.recipient_id = p_recipient_id
    AND rf.feedback_type = 'dismissed'
    AND rf.created_at > NOW() - INTERVAL '30 days'
  ORDER BY rf.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get successful gifts for similar recipients
CREATE OR REPLACE FUNCTION get_successful_gifts_for_similar_recipients(
  p_age_range TEXT,
  p_interests TEXT,
  p_relationship TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  gift_name TEXT,
  gift_description TEXT,
  gift_category TEXT,
  gift_brand TEXT,
  gift_store TEXT,
  current_price DECIMAL(10,2),
  success_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.name AS gift_name,
    g.description AS gift_description,
    g.category AS gift_category,
    g.brand AS gift_brand,
    g.store AS gift_store,
    g.current_price,
    COUNT(*) AS success_count
  FROM gifts g
  INNER JOIN gift_recipients gr ON g.id = gr.gift_id
  INNER JOIN recipients r ON gr.recipient_id = r.id
  WHERE
    gr.status IN ('purchased', 'wrapped', 'given')
    AND (
      r.age_range = p_age_range
      OR r.relationship = p_relationship
      OR (p_interests IS NOT NULL AND p_interests != '' AND r.interests ILIKE '%' || p_interests || '%')
    )
    AND g.created_at > NOW() - INTERVAL '180 days'
  GROUP BY g.id, g.name, g.description, g.category, g.brand, g.store, g.current_price
  HAVING COUNT(*) >= 2
  ORDER BY success_count DESC, g.current_price ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update trending gifts
CREATE OR REPLACE FUNCTION update_trending_gifts()
RETURNS void AS $$
BEGIN
  INSERT INTO trending_gifts (
    gift_name,
    gift_category,
    gift_brand,
    gift_store,
    normalized_name,
    add_count,
    purchase_count,
    view_count,
    avg_price,
    popular_with_age_ranges,
    popular_for_relationships,
    popular_occasions,
    last_added_at,
    updated_at
  )
  SELECT
    rf.recommendation_name,
    rf.recommendation_category,
    rf.recommendation_brand,
    rf.recommendation_store,
    LOWER(TRIM(rf.recommendation_name)) AS normalized_name,
    COUNT(*) FILTER (WHERE rf.feedback_type = 'added') AS add_count,
    COUNT(*) FILTER (WHERE rf.feedback_type = 'purchased') AS purchase_count,
    COUNT(*) FILTER (WHERE rf.feedback_type = 'viewed') AS view_count,
    AVG(rf.recommendation_price) AS avg_price,
    ARRAY_AGG(DISTINCT rf.recipient_age_range) FILTER (WHERE rf.recipient_age_range IS NOT NULL) AS popular_with_age_ranges,
    ARRAY_AGG(DISTINCT rf.recipient_relationship) FILTER (WHERE rf.recipient_relationship IS NOT NULL) AS popular_for_relationships,
    ARRAY_AGG(DISTINCT rf.occasion) FILTER (WHERE rf.occasion IS NOT NULL) AS popular_occasions,
    MAX(rf.created_at) FILTER (WHERE rf.feedback_type = 'added') AS last_added_at,
    NOW() AS updated_at
  FROM recommendation_feedback rf
  WHERE rf.created_at > NOW() - INTERVAL '90 days'
  GROUP BY
    rf.recommendation_name,
    rf.recommendation_category,
    rf.recommendation_brand,
    rf.recommendation_store,
    LOWER(TRIM(rf.recommendation_name))
  HAVING COUNT(*) FILTER (WHERE rf.feedback_type IN ('added', 'purchased')) >= 2
  ON CONFLICT (normalized_name)
  DO UPDATE SET
    add_count = EXCLUDED.add_count,
    purchase_count = EXCLUDED.purchase_count,
    view_count = EXCLUDED.view_count,
    avg_price = EXCLUDED.avg_price,
    popular_with_age_ranges = EXCLUDED.popular_with_age_ranges,
    popular_for_relationships = EXCLUDED.popular_for_relationships,
    popular_occasions = EXCLUDED.popular_occasions,
    last_added_at = EXCLUDED.last_added_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_gifts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own feedback
CREATE POLICY recommendation_feedback_select_own
  ON recommendation_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own feedback
CREATE POLICY recommendation_feedback_insert_own
  ON recommendation_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Trending gifts are readable by all authenticated users
CREATE POLICY trending_gifts_select_all
  ON trending_gifts
  FOR SELECT
  TO authenticated
  USING (true);

-- Only system can update trending gifts (via function)
CREATE POLICY trending_gifts_insert_system
  ON trending_gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY trending_gifts_update_system
  ON trending_gifts
  FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT ON recommendation_feedback TO authenticated;
GRANT SELECT ON trending_gifts TO authenticated;
GRANT INSERT, UPDATE ON trending_gifts TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE recommendation_feedback IS 'Tracks user feedback on AI gift recommendations to improve future suggestions';
COMMENT ON TABLE trending_gifts IS 'Aggregates trending gift data across all users for personalized recommendations';
COMMENT ON FUNCTION get_trending_gifts_for_profile IS 'Returns trending gifts filtered by recipient demographics with relevance scoring';
COMMENT ON FUNCTION get_dismissed_recommendations IS 'Returns recently dismissed recommendations to avoid re-suggesting';
COMMENT ON FUNCTION get_successful_gifts_for_similar_recipients IS 'Finds gifts that worked well for similar recipients (collaborative filtering)';
COMMENT ON FUNCTION update_trending_gifts IS 'Recalculates trending gifts based on recommendation_feedback data';
