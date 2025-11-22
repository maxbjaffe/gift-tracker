/**
 * TypeScript Types for Recipient Matching System
 */

/**
 * Confidence level for recipient matching
 * - exact: Perfect match (100% confidence)
 * - high: Very likely match (90-99% confidence)
 * - medium: Probable match, needs confirmation (70-89% confidence)
 * - low: Possible match, user should verify (50-69% confidence)
 * - none: No match found (< 50% confidence)
 */
export type MatchConfidence = 'exact' | 'high' | 'medium' | 'low' | 'none';

/**
 * Recipient from database
 */
export interface Recipient {
  id: string;
  user_id: string;
  name: string;
  nickname?: string | null;
  relationship?: string | null;
  birthday?: string | null;
  age_range?: string | null;
  gender?: string | null;
  avatar_url?: string | null;
  interests?: string[] | null;
  hobbies?: string[] | null;
  favorite_colors?: string[] | null;
  favorite_brands?: string[] | null;
  favorite_stores?: string[] | null;
  gift_preferences?: string | null;
  gift_dos?: string[] | null;
  gift_donts?: string[] | null;
  restrictions?: string[] | null;
  clothing_sizes?: Record<string, any> | null;
  wishlist_items?: Record<string, any> | null;
  past_gifts_received?: Record<string, any>[] | null;
  items_already_owned?: string[] | null;
  max_budget?: number | null;
  max_purchased_budget?: number | null;
  notes?: string | null;
  metadata?: {
    created_from?: 'sms' | 'web' | 'contacts';
    first_mentioned?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Result of recipient matching operation
 */
export interface MatchResult {
  /** The matched recipient, or null if no match */
  matched: Recipient | null;

  /** Confidence level of the match */
  confidence: MatchConfidence;

  /** Alternative recipient suggestions */
  suggestions?: RecipientSuggestion[];

  /** Whether user confirmation is required */
  shouldConfirm: boolean;

  /** Message to show user for confirmation */
  confirmationMessage?: string;

  /** Matching method used */
  matchMethod?: MatchMethod;

  /** Debug information (only in development) */
  debug?: MatchDebugInfo;
}

/**
 * Suggested recipient alternative
 */
export interface RecipientSuggestion {
  /** Recipient data */
  recipient: Recipient;

  /** Similarity score (0-100) */
  similarity: number;

  /** Edit distance from search term */
  distance: number;

  /** Reason for suggestion */
  reason: string;
}

/**
 * Method used to match recipient
 */
export type MatchMethod =
  | 'exact_name'
  | 'exact_nickname'
  | 'relationship'
  | 'fuzzy_name'
  | 'fuzzy_nickname'
  | 'fuzzy_first_name'
  | 'none';

/**
 * Debug information for matching (development only)
 */
export interface MatchDebugInfo {
  /** Original search term */
  searchTerm: string;

  /** Normalized search term */
  normalizedTerm: string;

  /** Whether search term is a relationship */
  isRelationship: boolean;

  /** Whether search term is a known nickname */
  isNickname: boolean;

  /** Number of recipients checked */
  recipientsChecked: number;

  /** Execution time in milliseconds */
  executionTime: number;

  /** All candidates considered */
  candidates?: Array<{
    recipient: Recipient;
    score: number;
    method: string;
  }>;
}

/**
 * Request body for match API endpoint
 */
export interface MatchRequest {
  /** Name or relationship to search for */
  searchName: string;

  /** User ID (optional if authenticated) */
  userId?: string;
}

/**
 * Response from match API endpoint
 */
export interface MatchResponse extends MatchResult {}

/**
 * Request parameters for suggest API endpoint
 */
export interface SuggestRequest {
  /** Search query */
  q: string;

  /** User ID (optional if authenticated) */
  userId?: string;

  /** Maximum number of suggestions to return */
  limit?: number;
}

/**
 * Response from suggest API endpoint
 */
export interface SuggestResponse {
  /** Array of suggested recipients */
  suggestions: RecipientSuggestion[];

  /** Total number of matches */
  total: number;
}

/**
 * Internal scoring result for candidate matching
 */
export interface CandidateScore {
  recipient: Recipient;
  score: number;
  method: MatchMethod;
  distance?: number;
  similarity?: number;
  reason: string;
}
