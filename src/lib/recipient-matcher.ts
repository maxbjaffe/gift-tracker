/**
 * Core Recipient Matching Engine
 *
 * Intelligent fuzzy matching system for recipient names with support for:
 * - Exact matching (name and nickname)
 * - Relationship matching (mom, dad, sister, etc.)
 * - Fuzzy matching with Levenshtein distance
 * - First name extraction and matching
 * - Nickname normalization
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  levenshteinDistance,
  areSimilar,
  getAdaptiveMaxDistance,
  getSimilarityPercentage,
} from './levenshtein';
import {
  getFormalName,
  isNickname,
  normalizeRelationship,
  isRelationshipTerm,
  NICKNAME_TO_FORMAL,
} from './nickname-mappings';
import type {
  Recipient,
  MatchResult,
  MatchConfidence,
  MatchMethod,
  CandidateScore,
  RecipientSuggestion,
  MatchDebugInfo,
} from '../types/recipient-matching';

/**
 * Normalize a recipient name for matching
 * - Lowercase
 * - Trim whitespace
 * - Remove special characters
 *
 * @param name - Name to normalize
 * @returns Normalized name
 */
export function normalizeRecipientName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
}

/**
 * Extract first name from full name
 *
 * @param fullName - Full name (e.g., "Sarah Johnson")
 * @returns First name (e.g., "Sarah")
 */
export function extractFirstName(fullName: string): string {
  const normalized = normalizeRecipientName(fullName);
  const parts = normalized.split(/\s+/);
  return parts[0] || normalized;
}

/**
 * Match recipient by relationship (mom, dad, sister, etc.)
 *
 * @param searchTerm - Relationship term to search for
 * @param recipients - List of recipients to search
 * @returns Matched recipient or null
 */
function matchByRelationship(searchTerm: string, recipients: Recipient[]): Recipient | null {
  const normalized = normalizeRelationship(searchTerm);

  if (!normalized) return null;

  // First, try exact match on relationship field
  for (const recipient of recipients) {
    if (recipient.relationship) {
      const recipientRel = normalizeRelationship(recipient.relationship);
      if (recipientRel === normalized) {
        return recipient;
      }
    }
  }

  // Second, try matching relationship term in name
  for (const recipient of recipients) {
    const recipientName = normalizeRecipientName(recipient.name);
    if (recipientName.includes(searchTerm.toLowerCase())) {
      return recipient;
    }
  }

  return null;
}

/**
 * Fuzzy match recipients by name using Levenshtein distance
 *
 * @param searchName - Name to search for
 * @param recipients - List of recipients to search
 * @returns Array of matching recipients with scores
 */
function fuzzyMatchRecipients(
  searchName: string,
  recipients: Recipient[]
): CandidateScore[] {
  const normalizedSearch = normalizeRecipientName(searchName);
  const maxDistance = getAdaptiveMaxDistance(normalizedSearch);
  const candidates: CandidateScore[] = [];

  for (const recipient of recipients) {
    const recipientName = normalizeRecipientName(recipient.name);
    const recipientFirstName = extractFirstName(recipient.name);
    const recipientNickname = recipient.nickname
      ? normalizeRecipientName(recipient.nickname)
      : null;

    // Try full name match
    const fullNameDistance = levenshteinDistance(normalizedSearch, recipientName);
    if (fullNameDistance <= maxDistance) {
      const similarity = getSimilarityPercentage(normalizedSearch, recipientName);
      candidates.push({
        recipient,
        score: similarity,
        method: 'fuzzy_name',
        distance: fullNameDistance,
        similarity,
        reason: `Name similarity: ${similarity}%`,
      });
      continue;
    }

    // Try first name match
    const firstNameDistance = levenshteinDistance(normalizedSearch, recipientFirstName);
    if (firstNameDistance <= maxDistance) {
      const similarity = getSimilarityPercentage(normalizedSearch, recipientFirstName);
      candidates.push({
        recipient,
        score: similarity,
        method: 'fuzzy_first_name',
        distance: firstNameDistance,
        similarity,
        reason: `First name similarity: ${similarity}%`,
      });
      continue;
    }

    // Try nickname match
    if (recipientNickname) {
      const nicknameDistance = levenshteinDistance(normalizedSearch, recipientNickname);
      if (nicknameDistance <= maxDistance) {
        const similarity = getSimilarityPercentage(normalizedSearch, recipientNickname);
        candidates.push({
          recipient,
          score: similarity,
          method: 'fuzzy_nickname',
          distance: nicknameDistance,
          similarity,
          reason: `Nickname similarity: ${similarity}%`,
        });
      }
    }
  }

  // Sort by score (highest first)
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Determine confidence level based on score and method
 *
 * @param score - Match score (0-100)
 * @param method - Match method used
 * @returns Confidence level
 */
function determineConfidence(score: number, method: MatchMethod): MatchConfidence {
  if (method === 'exact_name' || method === 'exact_nickname' || method === 'relationship') {
    return 'exact';
  }

  if (score >= 95) return 'high';
  if (score >= 80) return 'medium';
  if (score >= 60) return 'low';
  return 'none';
}

/**
 * Check if user confirmation is needed based on confidence
 *
 * @param confidence - Match confidence level
 * @returns True if confirmation needed
 */
function shouldConfirmMatch(confidence: MatchConfidence): boolean {
  return confidence === 'medium' || confidence === 'low';
}

/**
 * Generate confirmation message for user
 *
 * @param recipient - Matched recipient
 * @param confidence - Match confidence
 * @returns Confirmation message
 */
function generateConfirmationMessage(
  recipient: Recipient,
  confidence: MatchConfidence
): string {
  if (confidence === 'medium') {
    return `Did you mean ${recipient.name}?`;
  }
  if (confidence === 'low') {
    return `Not sure if you meant ${recipient.name}. Is this correct?`;
  }
  return '';
}

/**
 * Convert candidate scores to recipient suggestions
 *
 * @param candidates - Scored candidates
 * @param limit - Maximum number of suggestions
 * @returns Array of recipient suggestions
 */
function candidatesToSuggestions(
  candidates: CandidateScore[],
  limit: number = 5
): RecipientSuggestion[] {
  return candidates.slice(0, limit).map((candidate) => ({
    recipient: candidate.recipient,
    similarity: candidate.similarity || candidate.score,
    distance: candidate.distance || 0,
    reason: candidate.reason,
  }));
}

/**
 * Main recipient matching function
 *
 * Attempts to match a search name/term against all recipients for a user.
 * Uses multiple strategies in order of priority:
 * 1. Exact name/nickname match
 * 2. Relationship match
 * 3. Fuzzy name/nickname match
 *
 * @param searchName - Name or relationship term to search for
 * @param userId - User ID to search within
 * @param supabase - Supabase client
 * @returns Match result with confidence and suggestions
 */
export async function findRecipientMatch(
  searchName: string,
  userId: string,
  supabase: SupabaseClient
): Promise<MatchResult> {
  const startTime = Date.now();

  // Validate input
  if (!searchName || searchName.trim().length === 0) {
    return {
      matched: null,
      confidence: 'none',
      shouldConfirm: false,
      matchMethod: 'none',
    };
  }

  // Fetch all recipients for user
  const { data: recipients, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching recipients:', error);
    throw new Error('Failed to fetch recipients');
  }

  if (!recipients || recipients.length === 0) {
    // No recipients exist - this is a new recipient
    return {
      matched: null,
      confidence: 'none',
      shouldConfirm: false,
      suggestions: [],
      matchMethod: 'none',
    };
  }

  const normalizedSearch = normalizeRecipientName(searchName);
  const isRelationship = isRelationshipTerm(normalizedSearch);
  const isNick = isNickname(normalizedSearch);

  // Priority 1: Exact match on name
  for (const recipient of recipients) {
    const recipientName = normalizeRecipientName(recipient.name);
    if (recipientName === normalizedSearch) {
      return {
        matched: recipient,
        confidence: 'exact',
        shouldConfirm: false,
        matchMethod: 'exact_name',
        debug: buildDebugInfo(
          searchName,
          normalizedSearch,
          isRelationship,
          isNick,
          recipients.length,
          Date.now() - startTime
        ),
      };
    }
  }

  // Priority 2: Exact match on nickname
  for (const recipient of recipients) {
    if (recipient.nickname) {
      const recipientNickname = normalizeRecipientName(recipient.nickname);
      if (recipientNickname === normalizedSearch) {
        return {
          matched: recipient,
          confidence: 'exact',
          shouldConfirm: false,
          matchMethod: 'exact_nickname',
          debug: buildDebugInfo(
            searchName,
            normalizedSearch,
            isRelationship,
            isNick,
            recipients.length,
            Date.now() - startTime
          ),
        };
      }
    }
  }

  // Priority 3: Relationship match
  if (isRelationship) {
    const relationshipMatch = matchByRelationship(searchName, recipients);
    if (relationshipMatch) {
      return {
        matched: relationshipMatch,
        confidence: 'exact',
        shouldConfirm: false,
        matchMethod: 'relationship',
        debug: buildDebugInfo(
          searchName,
          normalizedSearch,
          isRelationship,
          isNick,
          recipients.length,
          Date.now() - startTime
        ),
      };
    }
  }

  // Priority 4: Nickname expansion (e.g., "liz" → "elizabeth")
  if (isNick) {
    const formalName = getFormalName(normalizedSearch);
    for (const recipient of recipients) {
      const recipientFirstName = extractFirstName(recipient.name);
      if (recipientFirstName === formalName) {
        return {
          matched: recipient,
          confidence: 'high',
          shouldConfirm: true,
          confirmationMessage: generateConfirmationMessage(recipient, 'high'),
          matchMethod: 'fuzzy_nickname',
          debug: buildDebugInfo(
            searchName,
            normalizedSearch,
            isRelationship,
            isNick,
            recipients.length,
            Date.now() - startTime
          ),
        };
      }
    }
  }

  // Priority 5: Fuzzy match
  const fuzzyMatches = fuzzyMatchRecipients(searchName, recipients);

  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    const confidence = determineConfidence(bestMatch.score, bestMatch.method);

    if (confidence !== 'none') {
      return {
        matched: bestMatch.recipient,
        confidence,
        shouldConfirm: shouldConfirmMatch(confidence),
        confirmationMessage: generateConfirmationMessage(bestMatch.recipient, confidence),
        suggestions: candidatesToSuggestions(fuzzyMatches.slice(1)),
        matchMethod: bestMatch.method,
        debug: buildDebugInfo(
          searchName,
          normalizedSearch,
          isRelationship,
          isNick,
          recipients.length,
          Date.now() - startTime,
          fuzzyMatches
        ),
      };
    }
  }

  // No match found - suggest alternatives if any fuzzy matches exist
  return {
    matched: null,
    confidence: 'none',
    shouldConfirm: false,
    suggestions: candidatesToSuggestions(fuzzyMatches),
    matchMethod: 'none',
    debug: buildDebugInfo(
      searchName,
      normalizedSearch,
      isRelationship,
      isNick,
      recipients.length,
      Date.now() - startTime,
      fuzzyMatches
    ),
  };
}

/**
 * Build debug information object
 *
 * @param searchTerm - Original search term
 * @param normalizedTerm - Normalized search term
 * @param isRelationship - Whether term is a relationship
 * @param isNickname - Whether term is a known nickname
 * @param recipientsChecked - Number of recipients checked
 * @param executionTime - Execution time in ms
 * @param candidates - Optional candidate scores
 * @returns Debug information
 */
function buildDebugInfo(
  searchTerm: string,
  normalizedTerm: string,
  isRelationship: boolean,
  isNickname: boolean,
  recipientsChecked: number,
  executionTime: number,
  candidates?: CandidateScore[]
): MatchDebugInfo {
  const debug: MatchDebugInfo = {
    searchTerm,
    normalizedTerm,
    isRelationship,
    isNickname,
    recipientsChecked,
    executionTime,
  };

  if (candidates && candidates.length > 0) {
    debug.candidates = candidates.map((c) => ({
      recipient: c.recipient,
      score: c.score,
      method: c.method,
    }));
  }

  return debug;
}

/**
 * Get recipient suggestions based on search query
 * Used for autocomplete/typeahead functionality
 *
 * @param query - Search query
 * @param userId - User ID
 * @param supabase - Supabase client
 * @param limit - Maximum number of suggestions (default: 10)
 * @returns Array of recipient suggestions
 */
export async function getRecipientSuggestions(
  query: string,
  userId: string,
  supabase: SupabaseClient,
  limit: number = 10
): Promise<RecipientSuggestion[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Fetch all recipients
  const { data: recipients, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('user_id', userId);

  if (error || !recipients) {
    console.error('Error fetching recipients:', error);
    return [];
  }

  const normalizedQuery = normalizeRecipientName(query);

  // Score all recipients
  const scored: CandidateScore[] = [];

  for (const recipient of recipients) {
    const recipientName = normalizeRecipientName(recipient.name);
    const recipientFirstName = extractFirstName(recipient.name);

    // Check if name starts with query (highest priority)
    if (recipientName.startsWith(normalizedQuery)) {
      scored.push({
        recipient,
        score: 100,
        method: 'exact_name',
        reason: 'Name starts with query',
      });
      continue;
    }

    // Check if first name starts with query
    if (recipientFirstName.startsWith(normalizedQuery)) {
      scored.push({
        recipient,
        score: 95,
        method: 'fuzzy_first_name',
        reason: 'First name starts with query',
      });
      continue;
    }

    // Check if nickname starts with query
    if (recipient.nickname) {
      const recipientNickname = normalizeRecipientName(recipient.nickname);
      if (recipientNickname.startsWith(normalizedQuery)) {
        scored.push({
          recipient,
          score: 90,
          method: 'fuzzy_nickname',
          reason: 'Nickname starts with query',
        });
        continue;
      }
    }

    // Fuzzy match
    const similarity = getSimilarityPercentage(normalizedQuery, recipientName);
    if (similarity >= 60) {
      scored.push({
        recipient,
        score: similarity,
        method: 'fuzzy_name',
        similarity,
        reason: `${similarity}% similar`,
      });
    }
  }

  // Sort by score and convert to suggestions
  return candidatesToSuggestions(scored.sort((a, b) => b.score - a.score), limit);
}
