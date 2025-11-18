// Family Accountability Platform - TypeScript Types

export type RestrictionType = 'device' | 'activity' | 'privilege' | 'location' | 'other';
export type ConsequenceStatus = 'active' | 'expired' | 'lifted' | 'extended' | 'pending_confirmation';
export type CommitmentStatus = 'active' | 'completed' | 'missed' | 'extended' | 'cancelled';
export type CommitmentCategory = 'homework' | 'chores' | 'responsibilities' | 'behavior' | 'other';
export type Severity = 'minor' | 'medium' | 'major';
export type ImprovementTrend = 'improving' | 'declining' | 'stable';
export type NotificationStatus = 'pending' | 'confirmed' | 'modified' | 'dismissed';
export type NotificationCategory = 'requires_action' | 'informational' | 'reminder';

export type NotificationType =
  | 'consequence_created'
  | 'consequence_modified'
  | 'consequence_lifted'
  | 'commitment_created'
  | 'commitment_due'
  | 'commitment_missed'
  | 'commitment_completed'
  | 'extension_requested'
  | 'verification_needed';

export interface Child {
  id: string;
  name: string;
  age: number | null;
  user_id: string;
  avatar_color: string; // Legacy field, kept for backward compatibility
  avatar_type?: string | null; // New: 'preset' or 'emoji'
  avatar_data?: string | null; // New: preset ID or emoji character
  avatar_background?: string | null; // New: background gradient for emojis
  created_at: string;
  updated_at: string;
}

export interface Consequence {
  id: string;
  child_id: string;
  restriction_type: RestrictionType;
  restriction_item: string;
  reason: string;
  duration_days: number | null;
  expires_at: string | null;
  status: ConsequenceStatus;

  // Who's involved
  created_by: string;
  confirmed_by: string | null;
  lifted_by: string | null;

  // Tracking
  created_at: string;
  confirmed_at: string | null;
  lifted_at: string | null;

  // Context
  related_commitment_id: string | null;
  notes: string | null;
  severity: Severity;

  // Populated relationships
  child?: Child;
}

export interface Commitment {
  id: string;
  child_id: string;
  commitment_text: string;
  due_date: string;
  status: CommitmentStatus;
  category: CommitmentCategory;

  // Who's involved
  committed_by: string;
  verified_by: string | null;
  requested_by: string | null;

  // Tracking
  created_at: string;
  completed_at: string | null;
  reminded_at: string | null;
  extension_requested_at: string | null;

  // Completion tracking
  completed_on_time: boolean | null;

  // Context
  related_consequence_id: string | null;
  extension_reason: string | null;
  notes: string | null;

  // Populated relationships
  child?: Child;
}

export interface CommitmentStats {
  id: string;
  child_id: string;
  month: string; // YYYY-MM-DD format (first day of month)

  // Totals
  total_commitments: number;
  completed_on_time: number;
  completed_late: number;
  missed: number;

  // Scores
  reliability_score: number | null;
  improvement_trend: ImprovementTrend | null;

  // Breakdown
  homework_count: number;
  chores_count: number;
  other_count: number;

  updated_at: string;

  // Populated relationships
  child?: Child;
}

export interface PartnerNotification {
  id: string;
  type: NotificationType;
  reference_id: string;
  reference_type: 'consequence' | 'commitment';
  partner_phone: string;
  partner_name: string | null;

  // Status
  status: NotificationStatus;

  // Message content
  message_text: string;
  response_text: string | null;

  // Timing
  sent_at: string;
  responded_at: string | null;

  // Metadata
  child_name: string | null;
  notification_category: NotificationCategory | null;

  created_at: string;
}

export interface PartnerSettings {
  id: string;
  user_id: string;
  partner_phone: string;
  partner_name: string | null;

  // Notification preferences
  notify_consequences: boolean;
  notify_commitments: boolean;
  notify_reminders: boolean;
  require_both_parents: boolean;
  quiet_hours_start: string | null; // HH:MM format
  quiet_hours_end: string | null; // HH:MM format

  created_at: string;
  updated_at: string;
}

export interface SMSContext {
  id: string;
  phone_number: string;
  user_id: string | null;

  // Context data
  last_message: string | null;
  last_intent: string | null;
  pending_clarification: string | null;
  context_data: Record<string, any> | null;

  // Timing
  created_at: string;
  updated_at: string;
  expires_at: string;
}

// Form data types for creating/updating
export interface CreateChildData {
  name: string;
  age?: number;
  avatar_color?: string; // Legacy
  avatar_type?: string | null; // New: 'preset' or 'emoji'
  avatar_data?: string | null; // New: preset ID or emoji character
  avatar_background?: string | null; // New: background gradient for emojis
}

export interface CreateConsequenceData {
  child_id: string;
  restriction_type: RestrictionType;
  restriction_item: string;
  reason: string;
  duration_days?: number;
  expires_at?: string;
  severity?: Severity;
  notes?: string;
}

export interface CreateCommitmentData {
  child_id: string;
  commitment_text: string;
  due_date: string;
  category?: CommitmentCategory;
  requested_by?: string;
  notes?: string;
}

export interface UpdateConsequenceStatusData {
  status: ConsequenceStatus;
  lifted_by?: string;
  confirmed_by?: string;
  notes?: string;
}

export interface UpdateCommitmentStatusData {
  status: CommitmentStatus;
  verified_by?: string;
  completed_on_time?: boolean;
  notes?: string;
}

// Dashboard summary types
export interface AccountabilityDashboard {
  children: Child[];
  activeConsequences: Consequence[];
  activeCommitments: Commitment[];
  recentStats: CommitmentStats[];
  pendingNotifications: PartnerNotification[];
}

export interface ChildSummary {
  child: Child;
  activeConsequences: Consequence[];
  activeCommitments: Commitment[];
  currentMonthStats: CommitmentStats | null;
  reliabilityTrend: 'up' | 'down' | 'stable';
}

// SMS Parsing types
export interface ParsedMessage {
  type: 'consequence' | 'commitment' | 'query' | 'response' | 'unknown';
  confidence: number;
  data: ParsedConsequence | ParsedCommitment | ParsedQuery | ParsedResponse | null;
  needs_clarification?: string;
  clarification_options?: string[];
}

export interface ParsedConsequence {
  child_name: string;
  restrictions: Array<{
    type: RestrictionType;
    item: string;
  }>;
  duration?: {
    days?: number;
    until?: string; // Natural language like "until Friday"
    manual_lift?: boolean; // "until further notice"
  };
  reasons: string[];
  severity: Severity;
}

export interface ParsedCommitment {
  child_name: string;
  commitments: Array<{
    text: string;
    category: CommitmentCategory;
    deadline: string; // ISO string
  }>;
  committed_by: 'parent' | 'child';
}

export interface ParsedQuery {
  query_type: 'consequences' | 'commitments' | 'status' | 'stats';
  child_name?: string; // or "all"
  timeframe?: 'today' | 'this_week' | 'this_month' | 'all';
  filters?: {
    status?: string[];
    category?: string[];
  };
}

export interface ParsedResponse {
  response_type: 'confirm' | 'deny' | 'modify' | 'discuss' | 'done' | 'missed' | 'late';
  notification_id?: string;
  modification_details?: string;
}

// Analytics types
export interface ReliabilityAnalytics {
  child_id: string;
  current_streak: number; // consecutive on-time completions
  longest_streak: number;
  reliability_by_category: {
    homework: number;
    chores: number;
    other: number;
  };
  monthly_trends: Array<{
    month: string;
    score: number;
  }>;
}

export interface ConsequencePatterns {
  child_id: string;
  most_common_reason: string;
  most_restricted_items: string[];
  average_duration: number;
  consequence_frequency: number; // per month
  related_to_missed_commitments: number; // percentage
}
