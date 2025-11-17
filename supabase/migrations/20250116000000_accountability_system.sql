-- Family Accountability Platform Migration
-- Adds consequences and commitments tracking

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_color text DEFAULT '#3B82F6',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Consequences (punishments/restrictions)
CREATE TABLE IF NOT EXISTS consequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  restriction_type text NOT NULL CHECK (restriction_type IN ('device', 'activity', 'privilege', 'location', 'other')),
  restriction_item text NOT NULL,
  reason text NOT NULL,
  duration_days integer,
  expires_at timestamp with time zone,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'lifted', 'extended', 'pending_confirmation')),

  -- Who's involved
  created_by uuid NOT NULL REFERENCES auth.users(id),
  confirmed_by uuid REFERENCES auth.users(id),
  lifted_by uuid REFERENCES auth.users(id),

  -- Tracking
  created_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  lifted_at timestamp with time zone,

  -- Context
  related_commitment_id uuid, -- FK added later to avoid circular dependency
  notes text,

  -- Metadata
  severity text DEFAULT 'medium' CHECK (severity IN ('minor', 'medium', 'major'))
);

-- Commitments (promises/tasks/responsibilities)
CREATE TABLE IF NOT EXISTS commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  commitment_text text NOT NULL,
  due_date timestamp with time zone NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed', 'extended', 'cancelled')),
  category text DEFAULT 'other' CHECK (category IN ('homework', 'chores', 'responsibilities', 'behavior', 'other')),

  -- Who's involved
  committed_by uuid NOT NULL REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  requested_by uuid REFERENCES auth.users(id),

  -- Tracking
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  reminded_at timestamp with time zone,
  extension_requested_at timestamp with time zone,

  -- Completion tracking
  completed_on_time boolean,

  -- Context
  related_consequence_id uuid, -- FK added later to avoid circular dependency
  extension_reason text,
  notes text
);

-- Commitment reliability stats (updated monthly)
CREATE TABLE IF NOT EXISTS commitment_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  month date NOT NULL,

  -- Totals
  total_commitments integer DEFAULT 0,
  completed_on_time integer DEFAULT 0,
  completed_late integer DEFAULT 0,
  missed integer DEFAULT 0,

  -- Scores
  reliability_score decimal(5,2),
  improvement_trend text CHECK (improvement_trend IN ('improving', 'declining', 'stable')),

  -- Breakdown
  homework_count integer DEFAULT 0,
  chores_count integer DEFAULT 0,
  other_count integer DEFAULT 0,

  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(child_id, month)
);

-- Partner notifications (shared by both systems)
CREATE TABLE IF NOT EXISTS partner_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN (
    'consequence_created',
    'consequence_modified',
    'consequence_lifted',
    'commitment_created',
    'commitment_due',
    'commitment_missed',
    'commitment_completed',
    'extension_requested',
    'verification_needed'
  )),
  reference_id uuid NOT NULL,
  reference_type text NOT NULL CHECK (reference_type IN ('consequence', 'commitment')),
  partner_phone text NOT NULL,
  partner_name text,

  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'modified', 'dismissed')),

  -- Message content
  message_text text NOT NULL,
  response_text text,

  -- Timing
  sent_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,

  -- Metadata
  child_name text,
  notification_category text CHECK (notification_category IN ('requires_action', 'informational', 'reminder')),

  created_at timestamp with time zone DEFAULT now()
);

-- Partner settings
CREATE TABLE IF NOT EXISTS partner_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_phone text NOT NULL,
  partner_name text,

  -- Notification preferences
  notify_consequences boolean DEFAULT true,
  notify_commitments boolean DEFAULT true,
  notify_reminders boolean DEFAULT true,
  require_both_parents boolean DEFAULT false,
  quiet_hours_start time,
  quiet_hours_end time,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- SMS conversation context (for multi-turn conversations)
CREATE TABLE IF NOT EXISTS sms_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Context data
  last_message text,
  last_intent text,
  pending_clarification text,
  context_data jsonb,

  -- Timing
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '30 minutes'),

  UNIQUE(phone_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_consequences_child_status ON consequences(child_id, status);
CREATE INDEX IF NOT EXISTS idx_consequences_expires_at ON consequences(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_consequences_created_by ON consequences(created_by);
CREATE INDEX IF NOT EXISTS idx_commitments_child_status ON commitments(child_id, status);
CREATE INDEX IF NOT EXISTS idx_commitments_due_date ON commitments(due_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_commitments_committed_by ON commitments(committed_by);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_status ON partner_notifications(status, type);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_reference ON partner_notifications(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_commitment_stats_child_month ON commitment_stats(child_id, month);
CREATE INDEX IF NOT EXISTS idx_sms_context_phone ON sms_context(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_context_expires ON sms_context(expires_at);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for consequences
CREATE POLICY "Users can view consequences for their children"
  ON consequences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = consequences.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create consequences for their children"
  ON consequences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update consequences for their children"
  ON consequences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = consequences.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for commitments
CREATE POLICY "Users can view commitments for their children"
  ON commitments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = commitments.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create commitments for their children"
  ON commitments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.user_id = auth.uid()
    )
    AND committed_by = auth.uid()
  );

CREATE POLICY "Users can update commitments for their children"
  ON commitments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = commitments.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for commitment_stats
CREATE POLICY "Users can view stats for their children"
  ON commitment_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = commitment_stats.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stats for their children"
  ON commitment_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stats for their children"
  ON commitment_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = commitment_stats.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for partner_notifications
CREATE POLICY "Users can view their partner notifications"
  ON partner_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partner_settings
      WHERE partner_settings.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert partner notifications"
  ON partner_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their partner notifications"
  ON partner_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM partner_settings
      WHERE partner_settings.user_id = auth.uid()
    )
  );

-- RLS Policies for partner_settings
CREATE POLICY "Users can view their own partner settings"
  ON partner_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partner settings"
  ON partner_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner settings"
  ON partner_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sms_context
CREATE POLICY "System can manage sms_context"
  ON sms_context FOR ALL
  USING (true);

-- Functions for automatic expiration
CREATE OR REPLACE FUNCTION expire_consequences()
RETURNS void AS $$
BEGIN
  UPDATE consequences
  SET status = 'expired'
  WHERE status = 'active'
  AND expires_at IS NOT NULL
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_missed_commitments()
RETURNS void AS $$
BEGIN
  UPDATE commitments
  SET status = 'missed'
  WHERE status = 'active'
  AND due_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reliability score
CREATE OR REPLACE FUNCTION calculate_reliability_score(p_child_id uuid, p_month date)
RETURNS decimal AS $$
DECLARE
  v_total integer;
  v_on_time integer;
  v_score decimal;
BEGIN
  SELECT
    COUNT(*),
    SUM(CASE WHEN completed_on_time = true THEN 1 ELSE 0 END)
  INTO v_total, v_on_time
  FROM commitments
  WHERE child_id = p_child_id
  AND date_trunc('month', created_at) = date_trunc('month', p_month)
  AND status IN ('completed', 'missed');

  IF v_total > 0 THEN
    v_score := (v_on_time::decimal / v_total::decimal) * 100;
  ELSE
    v_score := NULL;
  END IF;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Add circular foreign key constraints (after both tables exist)
ALTER TABLE consequences
  ADD CONSTRAINT fk_consequences_related_commitment
  FOREIGN KEY (related_commitment_id) REFERENCES commitments(id);

ALTER TABLE commitments
  ADD CONSTRAINT fk_commitments_related_consequence
  FOREIGN KEY (related_consequence_id) REFERENCES consequences(id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_settings_updated_at BEFORE UPDATE ON partner_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitment_stats_updated_at BEFORE UPDATE ON commitment_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_context_updated_at BEFORE UPDATE ON sms_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
