-- ============================================================================
-- COMPLETE EMAIL SYSTEM MIGRATION
-- Combined migration for email management system
-- ============================================================================
-- This migration creates all tables, indexes, triggers, and RLS policies
-- for the email management module in one go.
-- ============================================================================

-- ============================================================================
-- PART 1: CORE EMAIL TABLES
-- ============================================================================

-- Email Accounts
-- Stores user email account configurations for monitoring
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
-- Custom rules for filtering and categorizing incoming emails
CREATE TABLE IF NOT EXISTS email_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority filters run first

  -- Filter Conditions (JSON for flexibility)
  -- Example: {"from_contains": "school.edu", "subject_contains": "homework"}
  conditions JSONB NOT NULL DEFAULT '{}',

  -- Actions (JSON for flexibility)
  -- Example: {"category": "school", "auto_associate": true, "mark_as_important": true}
  actions JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Emails
-- Stores fetched and processed email messages
CREATE TABLE IF NOT EXISTS school_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Email Identifiers
  message_id TEXT NOT NULL, -- IMAP message ID
  thread_id TEXT, -- For grouping related emails
  in_reply_to TEXT, -- For threading

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
  snippet TEXT, -- First ~200 chars for previews

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
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_school_emails_user_id ON school_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_school_emails_account_id ON school_emails(email_account_id);
CREATE INDEX IF NOT EXISTS idx_school_emails_received_at ON school_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_school_emails_category ON school_emails(ai_category);
CREATE INDEX IF NOT EXISTS idx_school_emails_thread_id ON school_emails(thread_id);

-- Email Attachments
-- Stores metadata about email attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,

  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,

  -- Storage (either inline or reference to object storage)
  storage_url TEXT, -- URL to file in Supabase Storage or S3
  inline_data TEXT, -- Base64 encoded data for small files

  -- Metadata
  is_inline BOOLEAN DEFAULT false,
  content_id TEXT, -- For inline images

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);

-- Email Actions
-- Extracted action items from emails (deadlines, tasks, etc.)
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

  -- Priority and notes
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_actions_email_id ON email_actions(email_id);
CREATE INDEX IF NOT EXISTS idx_email_actions_user_id ON email_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_actions_due_date ON email_actions(due_date);

-- ============================================================================
-- PART 2: ASSOCIATION TABLES
-- ============================================================================

-- Calendar Events
-- Stores school calendar events (from emails or manual entry)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Details
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

  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,

  -- Location
  location TEXT,
  virtual_link TEXT,

  -- Source tracking
  source TEXT CHECK (source IN ('email', 'manual', 'import')) DEFAULT 'email',
  source_email_id UUID REFERENCES school_emails(id) ON DELETE SET NULL,

  -- Status
  is_cancelled BOOLEAN DEFAULT false,
  is_confirmed BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_source_email ON calendar_events(source_email_id);

-- Email-Event Associations
-- Links emails to calendar events with AI confidence scores
CREATE TABLE IF NOT EXISTS email_event_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Association metadata
  association_type TEXT CHECK (association_type IN (
    'creates_event',      -- Email announces new event
    'updates_event',      -- Email modifies existing event
    'reminds_about',      -- Email is reminder for event
    'cancels_event',      -- Email cancels event
    'related_to'          -- Email generally relates to event
  )) NOT NULL,

  -- AI Analysis
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  ai_reasoning TEXT,

  -- User feedback
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
-- Links emails to specific children (for families with multiple kids)
CREATE TABLE IF NOT EXISTS email_child_relevance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Relevance metadata
  relevance_type TEXT CHECK (relevance_type IN (
    'primary',      -- Email is primarily about this child
    'mentioned',    -- Child is mentioned in email
    'shared',       -- Email applies to multiple children
    'class_wide'    -- Email is for entire class/grade
  )) NOT NULL DEFAULT 'primary',

  -- AI Analysis
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  ai_reasoning TEXT,
  extracted_child_name TEXT, -- Name as it appeared in email

  -- User feedback
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
-- Stores user corrections to AI classifications for learning
CREATE TABLE IF NOT EXISTS email_classification_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES school_emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was corrected
  field_name TEXT NOT NULL CHECK (field_name IN (
    'category',
    'priority',
    'action_required',
    'child_association',
    'event_association'
  )),

  -- Original vs corrected values
  ai_value TEXT,
  user_value TEXT NOT NULL,

  -- Context
  feedback_text TEXT,
  email_subject TEXT, -- Denormalized for ML training
  email_from TEXT,    -- Denormalized for ML training

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_feedback_email ON email_classification_feedback(email_id);
CREATE INDEX IF NOT EXISTS idx_email_feedback_user ON email_classification_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_email_feedback_field ON email_classification_feedback(field_name);

-- Monthly Summaries
-- Pre-generated AI summaries of email activity
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- NULL means all children

  -- Time period
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  -- Summary content
  summary_text TEXT NOT NULL,
  summary_html TEXT,

  -- Statistics
  total_emails INTEGER DEFAULT 0,
  by_category JSONB DEFAULT '{}', -- {"homework": 5, "events": 3, ...}
  urgent_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,

  -- Key highlights (AI-extracted)
  key_highlights TEXT[], -- Array of important points
  upcoming_deadlines JSONB DEFAULT '[]', -- Array of {date, description}

  -- Generation metadata
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
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Create function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
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
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all email tables
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
-- EMAIL ACCOUNTS POLICIES
-- ============================================================================

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

-- ============================================================================
-- EMAIL FILTERS POLICIES
-- ============================================================================

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

-- ============================================================================
-- SCHOOL EMAILS POLICIES
-- ============================================================================

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

-- ============================================================================
-- EMAIL ATTACHMENTS POLICIES
-- ============================================================================

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

-- ============================================================================
-- EMAIL ACTIONS POLICIES
-- ============================================================================

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

-- ============================================================================
-- CALENDAR EVENTS POLICIES
-- ============================================================================

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

-- ============================================================================
-- EMAIL-EVENT ASSOCIATIONS POLICIES
-- ============================================================================

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

-- ============================================================================
-- EMAIL-CHILD RELEVANCE POLICIES
-- ============================================================================

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

-- ============================================================================
-- EMAIL CLASSIFICATION FEEDBACK POLICIES
-- ============================================================================

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

-- ============================================================================
-- MONTHLY SUMMARIES POLICIES
-- ============================================================================

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
-- MIGRATION COMPLETE
-- ============================================================================
-- Email system tables, indexes, triggers, and RLS policies are now in place!
