/**
 * Email System Types
 */

export type EmailProvider = 'gmail' | 'outlook' | 'other';

export type SyncStatus = 'success' | 'error' | 'in_progress';

export type EmailCategory =
  | 'school_notice'
  | 'homework'
  | 'event'
  | 'permission'
  | 'grade'
  | 'behavior'
  | 'sports'
  | 'transportation'
  | 'fundraising'
  | 'other';

export type EmailPriority = 'high' | 'medium' | 'low';

export type ActionType =
  | 'deadline'
  | 'rsvp'
  | 'permission_form'
  | 'payment'
  | 'task'
  | 'reminder'
  | 'other';

export type EventType =
  | 'assignment'
  | 'test'
  | 'school_event'
  | 'sports'
  | 'meeting'
  | 'holiday'
  | 'deadline'
  | 'other';

export type AssociationType =
  | 'creates_event'
  | 'updates_event'
  | 'reminds_about'
  | 'cancels_event'
  | 'related_to';

export type RelevanceType =
  | 'primary'
  | 'mentioned'
  | 'shared'
  | 'class_wide';

export type ClassificationField =
  | 'category'
  | 'priority'
  | 'action_required'
  | 'child_association'
  | 'event_association';

export interface EmailAccount {
  id: string;
  user_id: string;
  email_address: string;
  display_name?: string;
  provider: EmailProvider;

  // IMAP Configuration
  imap_host: string;
  imap_port: number;
  imap_username: string;
  imap_password_encrypted: string;
  use_ssl: boolean;

  // Settings
  is_active: boolean;
  sync_frequency_minutes: number;
  fetch_since_date: Date;
  last_sync_at?: Date;
  last_sync_status?: SyncStatus;
  last_sync_error?: string;

  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface EmailFilter {
  id: string;
  user_id: string;
  email_account_id?: string;

  name: string;
  description?: string;
  is_active: boolean;
  priority: number;

  conditions: Record<string, any>;
  actions: Record<string, any>;

  created_at: Date;
  updated_at: Date;
}

export interface SchoolEmail {
  id: string;
  user_id: string;
  email_account_id: string;

  // Email Identifiers
  message_id: string;
  thread_id?: string;
  in_reply_to?: string;

  // Email Headers
  from_address: string;
  from_name?: string;
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject: string;

  // Email Content
  body_text?: string;
  body_html?: string;
  snippet?: string;

  // AI Analysis
  ai_category?: EmailCategory;
  ai_summary?: string;
  ai_priority?: EmailPriority;
  ai_action_required?: boolean;
  ai_confidence_score?: number;
  ai_processed_at?: Date;

  // Manual Overrides
  manual_category?: string;
  manual_priority?: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;

  // Metadata
  received_at: Date;
  fetched_at: Date;
  created_at: Date;
  updated_at: Date;

  // Relations (optional)
  attachments?: EmailAttachment[];
  actions?: EmailAction[];
  event_associations?: EmailEventAssociation[];
  child_relevance?: EmailChildRelevance[];
}

export interface EmailAttachment {
  id: string;
  email_id: string;

  filename: string;
  content_type: string;
  size_bytes: number;

  storage_url?: string;
  inline_data?: string;

  is_inline: boolean;
  content_id?: string;

  created_at: Date;
}

export interface EmailAction {
  id: string;
  email_id: string;
  user_id: string;

  action_type: ActionType;
  action_text: string;
  due_date?: Date;
  is_completed: boolean;
  completed_at?: Date;

  priority: EmailPriority;
  notes?: string;

  created_at: Date;
  updated_at: Date;
}

export interface CalendarEvent {
  id: string;
  user_id: string;

  title: string;
  description?: string;
  event_type?: EventType;

  start_date: Date;
  end_date?: Date;
  all_day: boolean;

  location?: string;
  virtual_link?: string;

  source: 'email' | 'manual' | 'import';
  source_email_id?: string;

  is_cancelled: boolean;
  is_confirmed: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface EmailEventAssociation {
  id: string;
  email_id: string;
  event_id: string;
  user_id: string;

  association_type: AssociationType;

  ai_confidence?: number;
  ai_reasoning?: string;

  is_verified: boolean;
  is_rejected: boolean;
  user_feedback?: string;

  created_at: Date;
  updated_at: Date;

  // Relations (optional)
  email?: SchoolEmail;
  event?: CalendarEvent;
}

export interface EmailChildRelevance {
  id: string;
  email_id: string;
  child_id: string;
  user_id: string;

  relevance_type: RelevanceType;

  ai_confidence?: number;
  ai_reasoning?: string;
  extracted_child_name?: string;

  is_verified: boolean;
  is_rejected: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface EmailClassificationFeedback {
  id: string;
  email_id: string;
  user_id: string;

  field_name: ClassificationField;

  ai_value?: string;
  user_value: string;

  feedback_text?: string;
  email_subject?: string;
  email_from?: string;

  created_at: Date;
}

export interface MonthlySummary {
  id: string;
  user_id: string;
  child_id?: string;

  year: number;
  month: number;

  summary_text: string;
  summary_html?: string;

  total_emails: number;
  by_category: Record<string, number>;
  urgent_count: number;
  events_count: number;
  actions_count: number;

  key_highlights?: string[];
  upcoming_deadlines?: Array<{ date: Date; description: string }>;

  generated_at: Date;
  regenerated_count: number;
  last_regenerated_at?: Date;

  created_at: Date;
  updated_at: Date;
}

// API Request/Response Types
export interface CreateEmailAccountRequest {
  email_address: string;
  display_name?: string;
  provider: EmailProvider;
  imap_host: string;
  imap_port: number;
  imap_username: string;
  imap_password: string;
  use_ssl?: boolean;
  sync_frequency_minutes?: number;
}

export interface SyncEmailsResponse {
  success: boolean;
  emailsFetched: number;
  emailsSaved: number;
  error?: string;
}

export interface EmailDashboard {
  accounts: EmailAccount[];
  recentEmails: SchoolEmail[];
  unreadCount: number;
  categoryCounts: Record<EmailCategory, number>;
  urgentEmails: SchoolEmail[];
  upcomingActions: EmailAction[];
}
