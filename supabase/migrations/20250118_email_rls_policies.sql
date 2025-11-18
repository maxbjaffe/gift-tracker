-- Email System Row Level Security Policies
-- Ensures users can only access their own email data

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
