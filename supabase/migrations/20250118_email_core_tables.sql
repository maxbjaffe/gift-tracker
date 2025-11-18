-- Email Core Tables Migration
-- Part 1: Core email infrastructure (accounts, filters, messages, attachments, actions)

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

-- Add updated_at trigger for tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON email_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_filters_updated_at BEFORE UPDATE ON email_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_emails_updated_at BEFORE UPDATE ON school_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_actions_updated_at BEFORE UPDATE ON email_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
