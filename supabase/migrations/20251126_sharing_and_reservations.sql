-- Add sharing and reservation features to GiftStash
-- This migration adds:
-- 1. Public sharing for recipient gift lists (no login required)
-- 2. Item reservation system (claim/unclaim gifts to prevent duplicates)

-- ============================================================================
-- PART 1: Add sharing fields to recipients table
-- ============================================================================

-- Add share_token for public URLs
ALTER TABLE recipients
ADD COLUMN share_token UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN share_privacy TEXT DEFAULT 'private' CHECK (share_privacy IN ('private', 'link-only', 'public')),
ADD COLUMN share_enabled BOOLEAN DEFAULT false,
ADD COLUMN share_expires_at TIMESTAMPTZ,
ADD COLUMN share_view_count INTEGER DEFAULT 0;

-- Create index for fast lookups by share_token
CREATE INDEX idx_recipients_share_token ON recipients(share_token) WHERE share_enabled = true;

-- Add comments for documentation
COMMENT ON COLUMN recipients.share_token IS 'Unique token for shareable public URL (e.g., /share/abc-123)';
COMMENT ON COLUMN recipients.share_privacy IS 'Privacy level: private (not shared), link-only (anyone with link), public (discoverable)';
COMMENT ON COLUMN recipients.share_enabled IS 'Whether sharing is currently enabled for this recipient';
COMMENT ON COLUMN recipients.share_expires_at IS 'Optional expiration date for shared links';
COMMENT ON COLUMN recipients.share_view_count IS 'Number of times the shared list has been viewed';

-- ============================================================================
-- PART 2: Add reservation fields to gift_recipients table
-- ============================================================================

-- Add reservation/claim fields
ALTER TABLE gift_recipients
ADD COLUMN claimed_by_name TEXT,
ADD COLUMN claimed_by_email TEXT,
ADD COLUMN claimed_at TIMESTAMPTZ,
ADD COLUMN claim_expires_at TIMESTAMPTZ,
ADD COLUMN claim_notes TEXT;

-- Create index for finding claimed items
CREATE INDEX idx_gift_recipients_claimed ON gift_recipients(claimed_by_name, claimed_at) WHERE claimed_by_name IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN gift_recipients.claimed_by_name IS 'Anonymous name of person who claimed this gift (e.g., "Sister", "Friend")';
COMMENT ON COLUMN gift_recipients.claimed_by_email IS 'Optional email for claim confirmation (not shown to recipient)';
COMMENT ON COLUMN gift_recipients.claimed_at IS 'When the item was claimed';
COMMENT ON COLUMN gift_recipients.claim_expires_at IS 'Optional expiration for claim (auto-unclaim after date)';
COMMENT ON COLUMN gift_recipients.claim_notes IS 'Private notes from claimer (not shown to recipient)';

-- ============================================================================
-- PART 3: Create share_views table to track anonymous views
-- ============================================================================

CREATE TABLE share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  -- Anonymized visitor tracking
  visitor_fingerprint TEXT, -- Hash of IP + User-Agent for basic deduplication
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,

  -- Geo info (optional, for analytics)
  country_code TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_share_views_recipient ON share_views(recipient_id);
CREATE INDEX idx_share_views_date ON share_views(viewed_at);

-- Add comments
COMMENT ON TABLE share_views IS 'Anonymous analytics for shared gift list views';
COMMENT ON COLUMN share_views.visitor_fingerprint IS 'Hash of visitor info for basic deduplication (not for tracking individuals)';

-- ============================================================================
-- PART 4: RLS Policies for public sharing
-- ============================================================================

-- Allow public read access to shared recipients (no auth required)
CREATE POLICY "Public read access to shared recipients"
  ON recipients FOR SELECT
  USING (
    share_enabled = true
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );

-- Allow public read access to gifts associated with shared recipients
-- We need to join through gift_recipients to find gifts for a shared recipient
CREATE POLICY "Public read access to gifts for shared recipients"
  ON gifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM gift_recipients gr
      JOIN recipients r ON r.id = gr.recipient_id
      WHERE gr.gift_id = gifts.id
        AND r.share_enabled = true
        AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())
    )
  );

-- Allow public read access to gift_recipients for shared lists
CREATE POLICY "Public read access to gift_recipients for shared lists"
  ON gift_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM recipients r
      WHERE r.id = gift_recipients.recipient_id
        AND r.share_enabled = true
        AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())
    )
  );

-- ============================================================================
-- PART 5: RLS Policies for reservations (claims)
-- ============================================================================

-- Allow anonymous users to claim items on shared lists
CREATE POLICY "Anonymous users can claim items on shared lists"
  ON gift_recipients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM recipients r
      WHERE r.id = gift_recipients.recipient_id
        AND r.share_enabled = true
        AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())
    )
  );

-- ============================================================================
-- PART 6: Functions for claim management
-- ============================================================================

-- Function to claim an item
CREATE OR REPLACE FUNCTION claim_gift_item(
  p_gift_recipient_id UUID,
  p_claimed_by_name TEXT,
  p_claimed_by_email TEXT DEFAULT NULL,
  p_claim_notes TEXT DEFAULT NULL,
  p_claim_duration_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_recipient_id UUID;
  v_share_enabled BOOLEAN;
BEGIN
  -- Check if the gift is on a shared list
  SELECT gr.recipient_id, r.share_enabled
  INTO v_recipient_id, v_share_enabled
  FROM gift_recipients gr
  JOIN recipients r ON r.id = gr.recipient_id
  WHERE gr.id = p_gift_recipient_id;

  -- Validate sharing is enabled
  IF NOT v_share_enabled THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This gift list is not shared'
    );
  END IF;

  -- Check if already claimed
  IF EXISTS (
    SELECT 1 FROM gift_recipients
    WHERE id = p_gift_recipient_id AND claimed_by_name IS NOT NULL
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This item is already claimed'
    );
  END IF;

  -- Claim the item
  UPDATE gift_recipients
  SET
    claimed_by_name = p_claimed_by_name,
    claimed_by_email = p_claimed_by_email,
    claimed_at = NOW(),
    claim_expires_at = NOW() + (p_claim_duration_days || ' days')::INTERVAL,
    claim_notes = p_claim_notes
  WHERE id = p_gift_recipient_id;

  RETURN json_build_object(
    'success', true,
    'claimed_at', NOW(),
    'expires_at', NOW() + (p_claim_duration_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unclaim an item
CREATE OR REPLACE FUNCTION unclaim_gift_item(
  p_gift_recipient_id UUID,
  p_claimer_email TEXT
)
RETURNS JSON AS $$
DECLARE
  v_current_email TEXT;
BEGIN
  -- Get current claim email
  SELECT claimed_by_email INTO v_current_email
  FROM gift_recipients
  WHERE id = p_gift_recipient_id;

  -- Verify claimer (if email was provided)
  IF v_current_email IS NOT NULL AND v_current_email != p_claimer_email THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only the person who claimed this item can unclaim it'
    );
  END IF;

  -- Unclaim the item
  UPDATE gift_recipients
  SET
    claimed_by_name = NULL,
    claimed_by_email = NULL,
    claimed_at = NULL,
    claim_expires_at = NULL,
    claim_notes = NULL
  WHERE id = p_gift_recipient_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Item unclaimed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire old claims (can be run via cron)
CREATE OR REPLACE FUNCTION expire_old_claims()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE gift_recipients
  SET
    claimed_by_name = NULL,
    claimed_by_email = NULL,
    claimed_at = NULL,
    claim_expires_at = NULL,
    claim_notes = NULL
  WHERE claim_expires_at IS NOT NULL
    AND claim_expires_at < NOW()
    AND claimed_by_name IS NOT NULL;

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: Function to track share views
-- ============================================================================

CREATE OR REPLACE FUNCTION track_share_view(
  p_recipient_id UUID,
  p_visitor_fingerprint TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert view record
  INSERT INTO share_views (
    recipient_id,
    visitor_fingerprint,
    referrer,
    user_agent
  ) VALUES (
    p_recipient_id,
    p_visitor_fingerprint,
    p_referrer,
    p_user_agent
  );

  -- Increment recipient view count
  UPDATE recipients
  SET share_view_count = share_view_count + 1
  WHERE id = p_recipient_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 8: RLS for share_views (allow inserts from anyone)
-- ============================================================================

ALTER TABLE share_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert view tracking
CREATE POLICY "Anyone can track share views"
  ON share_views FOR INSERT
  WITH CHECK (true);

-- Only owner can read their share views
CREATE POLICY "Users can view analytics for their shared lists"
  ON share_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipients r
      WHERE r.id = share_views.recipient_id
        AND r.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 9: Helper function to generate shareable URL
-- ============================================================================

CREATE OR REPLACE FUNCTION enable_sharing_for_recipient(
  p_recipient_id UUID,
  p_privacy TEXT DEFAULT 'link-only',
  p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_share_token UUID;
  v_user_id UUID;
BEGIN
  -- Verify ownership
  SELECT user_id INTO v_user_id
  FROM recipients
  WHERE id = p_recipient_id;

  IF v_user_id != auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You do not have permission to share this recipient'
    );
  END IF;

  -- Get or create share token
  SELECT share_token INTO v_share_token
  FROM recipients
  WHERE id = p_recipient_id;

  IF v_share_token IS NULL THEN
    v_share_token := gen_random_uuid();
  END IF;

  -- Update sharing settings
  UPDATE recipients
  SET
    share_token = v_share_token,
    share_privacy = p_privacy,
    share_enabled = true,
    share_expires_at = CASE
      WHEN p_expires_in_days IS NOT NULL
      THEN NOW() + (p_expires_in_days || ' days')::INTERVAL
      ELSE NULL
    END
  WHERE id = p_recipient_id;

  RETURN json_build_object(
    'success', true,
    'share_token', v_share_token,
    'share_url', '/share/' || v_share_token,
    'expires_at', CASE
      WHEN p_expires_in_days IS NOT NULL
      THEN NOW() + (p_expires_in_days || ' days')::INTERVAL
      ELSE NULL
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION enable_sharing_for_recipient IS 'Enable public sharing for a recipient gift list and return shareable URL';
