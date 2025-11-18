-- Email Association Tables Migration
-- Part 2: Associations, calendar events, summaries, and feedback

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

-- Add updated_at triggers
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_event_associations_updated_at BEFORE UPDATE ON email_event_associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_child_relevance_updated_at BEFORE UPDATE ON email_child_relevance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_summaries_updated_at BEFORE UPDATE ON monthly_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
