-- ============================================================================
-- SAFE EMAIL SYSTEM MIGRATION
-- This version drops existing objects before recreating them
-- Safe to run multiple times (idempotent)
-- ============================================================================

-- ============================================================================
-- PART 1: DROP EXISTING TRIGGERS (if they exist)
-- ============================================================================

DROP TRIGGER IF EXISTS update_email_accounts_updated_at ON email_accounts;
DROP TRIGGER IF EXISTS update_email_filters_updated_at ON email_filters;
DROP TRIGGER IF EXISTS update_school_emails_updated_at ON school_emails;
DROP TRIGGER IF EXISTS update_email_actions_updated_at ON email_actions;
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
DROP TRIGGER IF EXISTS update_email_event_associations_updated_at ON email_event_associations;
DROP TRIGGER IF EXISTS update_email_child_relevance_updated_at ON email_child_relevance;
DROP TRIGGER IF EXISTS update_monthly_summaries_updated_at ON monthly_summaries;

-- ============================================================================
-- PART 2: CREATE CORE EMAIL TABLES
-- ============================================================================

-- Email Accounts
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  display_name TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'other')),

  -- IMAP Configuration
  imap_host TEXT NOT NULL,
  imap_port INTEGER NOT NULL DEFAULT 993,
  imap_username TEXT NOT NULL,
  imap_password_encrypted TEXT NOT NULL,
  use_ssl BOOLEAN DEFAULT true,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 15,
  fetch_since_date TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'error', 'in_progress')),
  last_sync_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, email_address)
);

-- Email Filters
CREATE TABLE IF NOT EXISTS email_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,

  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Emails
CREATE TABLE IF NOT EXISTS school_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Email Identifiers
  message_id TEXT NOT NULL,
  thread_id TEXT,
  in_reply_to TEXT,

  -- Email Headers
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT NOT NULL,

  -- Email Content
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,

  -- AI Analysis Results
  ai_category TEXT CHECK (ai_category IN (
    'school_notice',
    'homework',
    'event',
    'permission',
    'grade',
    'behavior',
    'sports',
    'transportation',
    'fundraising',
    'other'
  )),
  ai_summary TEXT,
  ai_priority TEXT CHECK (ai_priority IN ('high', 'medium', 'low')),
  ai_action_required BOOLEAN DEFAULT false,
  ai_confidence_score DECIMAL(3,2),
  ai_processed_at TIMESTAMPTZ,

  -- Manual Overrides
  manual_category TEXT,
  manual_priority TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Metadata
  received_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email_account_id, message_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_school_emails_user_id ON school_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_school_emails_account_id ON school_emails(email_account_id);
CREATE INDEX IF NOT EXISTS idx_school_emails_received_at ON school_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_school_emails_category ON school_emails(ai_category);
CREATE INDEX IF NOT EXISTS idx_school_emails_thread_id ON school_emails(thread_id);

-- Email Attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,

  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,

  storage_url TEXT,
  inline_data TEXT,

  is_inline BOOLEAN DEFAULT false,
  content_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);

-- Email Actions
CREATE TABLE IF NOT EXISTS email_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  action_type TEXT NOT NULL CHECK (action_type IN (
    'deadline',
    'rsvp',
    'permission_form',
    'payment',
    'task',
    'reminder',
    'other'
  )),

  action_text TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_actions_email_id ON email_actions(email_id);
CREATE INDEX IF NOT EXISTS idx_email_actions_user_id ON email_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_actions_due_date ON email_actions(due_date);

-- ============================================================================
-- PART 3: CREATE ASSOCIATION TABLES
-- ============================================================================

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN (
    'assignment',
    'test',
    'school_event',
    'sports',
    'meeting',
    'holiday',
    'deadline',
    'other'
  )),

  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,

  location TEXT,
  virtual_link TEXT,

  source TEXT CHECK (source IN ('email', 'manual', 'import')) DEFAULT 'email',
  source_email_id UUID REFERENCES school_emails(id) ON DELETE SET NULL,

  is_cancelled BOOLEAN DEFAULT false,
  is_confirmed BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_source_email ON calendar_events(source_email_id);

-- Email-Event Associations
CREATE TABLE IF NOT EXISTS email_event_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  association_type TEXT CHECK (association_type IN (
    'creates_event',
    'updates_event',
    'reminds_about',
    'cancels_event',
    'related_to'
  )) NOT NULL,

  ai_confidence DECIMAL(3,2),
  ai_reasoning TEXT,

  is_verified BOOLEAN DEFAULT false,
  is_rejected BOOLEAN DEFAULT false,
  user_feedback TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_email_event_assoc_email ON email_event_associations(email_id);
CREATE INDEX IF NOT EXISTS idx_email_event_assoc_event ON email_event_associations(event_id);
CREATE INDEX IF NOT EXISTS idx_email_event_assoc_user ON email_event_associations(user_id);

-- Email-Child Relevance
CREATE TABLE IF NOT EXISTS email_child_relevance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  relevance_type TEXT CHECK (relevance_type IN (
    'primary',
    'mentioned',
    'shared',
    'class_wide'
  )) NOT NULL DEFAULT 'primary',

  ai_confidence DECIMAL(3,2),
  ai_reasoning TEXT,
  extracted_child_name TEXT,

  is_verified BOOLEAN DEFAULT false,
  is_rejected BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_email_child_relevance_email ON email_child_relevance(email_id);
CREATE INDEX IF NOT EXISTS idx_email_child_relevance_child ON email_child_relevance(child_id);
CREATE INDEX IF NOT EXISTS idx_email_child_relevance_user ON email_child_relevance(user_id);

-- Email Classification Feedback
CREATE TABLE IF NOT EXISTS email_classification_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  field_name TEXT NOT NULL CHECK (field_name IN (
    'category',
    'priority',
    'action_required',
    'child_association',
    'event_association'
  )),

  ai_value TEXT,
  user_value TEXT NOT NULL,

  feedback_text TEXT,
  email_subject TEXT,
  email_from TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_feedback_email ON email_classification_feedback(email_id);
CREATE INDEX IF NOT EXISTS idx_email_feedback_user ON email_classification_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_email_feedback_field ON email_classification_feedback(field_name);

-- Monthly Summaries
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,

  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  summary_text TEXT NOT NULL,
  summary_html TEXT,

  total_emails INTEGER DEFAULT 0,
  by_category JSONB DEFAULT '{}',
  urgent_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,

  key_highlights TEXT[],
  upcoming_deadlines JSONB DEFAULT '[]',

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  regenerated_count INTEGER DEFAULT 0,
  last_regenerated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, child_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user ON monthly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_child ON monthly_summaries(child_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_period ON monthly_summaries(year, month);

-- ============================================================================
-- PART 4: CREATE TRIGGERS
-- ============================================================================

-- Create function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create all triggers
CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON email_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_filters_updated_at BEFORE UPDATE ON email_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_emails_updated_at BEFORE UPDATE ON school_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_actions_updated_at BEFORE UPDATE ON email_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_event_associations_updated_at BEFORE UPDATE ON email_event_associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_child_relevance_updated_at BEFORE UPDATE ON email_child_relevance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_summaries_updated_at BEFORE UPDATE ON monthly_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_event_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_child_relevance ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_classification_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: DROP EXISTING POLICIES (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can create their own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can update their own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "Users can delete their own email accounts" ON email_accounts;

DROP POLICY IF EXISTS "Users can view their own email filters" ON email_filters;
DROP POLICY IF EXISTS "Users can create their own email filters" ON email_filters;
DROP POLICY IF EXISTS "Users can update their own email filters" ON email_filters;
DROP POLICY IF EXISTS "Users can delete their own email filters" ON email_filters;

DROP POLICY IF EXISTS "Users can view their own emails" ON school_emails;
DROP POLICY IF EXISTS "System can insert emails for users" ON school_emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON school_emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON school_emails;

DROP POLICY IF EXISTS "Users can view attachments from their emails" ON email_attachments;
DROP POLICY IF EXISTS "System can insert attachments for user emails" ON email_attachments;
DROP POLICY IF EXISTS "Users can delete attachments from their emails" ON email_attachments;

DROP POLICY IF EXISTS "Users can view their own email actions" ON email_actions;
DROP POLICY IF EXISTS "Users can create email actions" ON email_actions;
DROP POLICY IF EXISTS "Users can update their own email actions" ON email_actions;
DROP POLICY IF EXISTS "Users can delete their own email actions" ON email_actions;

DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;

DROP POLICY IF EXISTS "Users can view their own email-event associations" ON email_event_associations;
DROP POLICY IF EXISTS "Users can create email-event associations" ON email_event_associations;
DROP POLICY IF EXISTS "Users can update their own email-event associations" ON email_event_associations;
DROP POLICY IF EXISTS "Users can delete their own email-event associations" ON email_event_associations;

DROP POLICY IF EXISTS "Users can view email-child relevance for their data" ON email_child_relevance;
DROP POLICY IF EXISTS "Users can create email-child relevance" ON email_child_relevance;
DROP POLICY IF EXISTS "Users can update their own email-child relevance" ON email_child_relevance;
DROP POLICY IF EXISTS "Users can delete their own email-child relevance" ON email_child_relevance;

DROP POLICY IF EXISTS "Users can view their own classification feedback" ON email_classification_feedback;
DROP POLICY IF EXISTS "Users can create classification feedback" ON email_classification_feedback;
DROP POLICY IF EXISTS "Users can update their own classification feedback" ON email_classification_feedback;
DROP POLICY IF EXISTS "Users can delete their own classification feedback" ON email_classification_feedback;

DROP POLICY IF EXISTS "Users can view their own monthly summaries" ON monthly_summaries;
DROP POLICY IF EXISTS "System can create monthly summaries for users" ON monthly_summaries;
DROP POLICY IF EXISTS "Users can update their own monthly summaries" ON monthly_summaries;
DROP POLICY IF EXISTS "Users can delete their own monthly summaries" ON monthly_summaries;

-- ============================================================================
-- PART 7: CREATE RLS POLICIES
-- ============================================================================

-- Email Accounts
CREATE POLICY "Users can view their own email accounts"
  ON email_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email accounts"
  ON email_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email accounts"
  ON email_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email accounts"
  ON email_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Email Filters
CREATE POLICY "Users can view their own email filters"
  ON email_filters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email filters"
  ON email_filters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email filters"
  ON email_filters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email filters"
  ON email_filters FOR DELETE
  USING (auth.uid() = user_id);

-- School Emails
CREATE POLICY "Users can view their own emails"
  ON school_emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert emails for users"
  ON school_emails FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_accounts
      WHERE email_accounts.id = email_account_id
      AND email_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own emails"
  ON school_emails FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
  ON school_emails FOR DELETE
  USING (auth.uid() = user_id);

-- Email Attachments
CREATE POLICY "Users can view attachments from their emails"
  ON email_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_emails
      WHERE school_emails.id = email_attachments.email_id
      AND school_emails.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert attachments for user emails"
  ON email_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_emails
      WHERE school_emails.id = email_id
      AND school_emails.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments from their emails"
  ON email_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM school_emails
      WHERE school_emails.id = email_attachments.email_id
      AND school_emails.user_id = auth.uid()
    )
  );

-- Email Actions
CREATE POLICY "Users can view their own email actions"
  ON email_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create email actions"
  ON email_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email actions"
  ON email_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email actions"
  ON email_actions FOR DELETE
  USING (auth.uid() = user_id);

-- Calendar Events
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- Email-Event Associations
CREATE POLICY "Users can view their own email-event associations"
  ON email_event_associations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create email-event associations"
  ON email_event_associations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email-event associations"
  ON email_event_associations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email-event associations"
  ON email_event_associations FOR DELETE
  USING (auth.uid() = user_id);

-- Email-Child Relevance
CREATE POLICY "Users can view email-child relevance for their data"
  ON email_child_relevance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create email-child relevance"
  ON email_child_relevance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email-child relevance"
  ON email_child_relevance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email-child relevance"
  ON email_child_relevance FOR DELETE
  USING (auth.uid() = user_id);

-- Email Classification Feedback
CREATE POLICY "Users can view their own classification feedback"
  ON email_classification_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create classification feedback"
  ON email_classification_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classification feedback"
  ON email_classification_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classification feedback"
  ON email_classification_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Monthly Summaries
CREATE POLICY "Users can view their own monthly summaries"
  ON monthly_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create monthly summaries for users"
  ON monthly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly summaries"
  ON monthly_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly summaries"
  ON monthly_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
