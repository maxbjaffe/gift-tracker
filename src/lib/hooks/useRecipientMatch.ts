/**
 * React Hook: useRecipientMatch
 *
 * Provides client-side access to recipient matching and suggestion APIs
 */

import { useState, useCallback } from 'react';
import type { MatchResponse, SuggestResponse } from '@/types/recipient-matching';

interface UseRecipientMatchReturn {
  /** Match a recipient by name/relationship */
  matchRecipient: (searchName: string) => Promise<MatchResponse | null>;

  /** Get recipient suggestions for autocomplete */
  suggestRecipients: (query: string, limit?: number) => Promise<SuggestResponse | null>;

  /** Whether a match operation is in progress */
  isMatching: boolean;

  /** Whether a suggest operation is in progress */
  isSuggesting: boolean;

  /** Last error from match operation */
  matchError: Error | null;

  /** Last error from suggest operation */
  suggestError: Error | null;
}

/**
 * Hook for recipient matching and suggestions
 *
 * @returns Functions and state for recipient matching
 *
 * @example
 * ```tsx
 * const { matchRecipient, suggestRecipients } = useRecipientMatch();
 *
 * // Match a recipient
 * const result = await matchRecipient('Sarah');
 * if (result.matched) {
 *   console.log('Found:', result.matched.name);
 * }
 *
 * // Get suggestions for autocomplete
 * const suggestions = await suggestRecipients('sar');
 * ```
 */
export function useRecipientMatch(): UseRecipientMatchReturn {
  const [isMatching, setIsMatching] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [matchError, setMatchError] = useState<Error | null>(null);
  const [suggestError, setSuggestError] = useState<Error | null>(null);

  /**
   * Match a recipient by name or relationship term
   */
  const matchRecipient = useCallback(async (searchName: string): Promise<MatchResponse | null> => {
    if (!searchName || searchName.trim().length === 0) {
      setMatchError(new Error('Search name cannot be empty'));
      return null;
    }

    setIsMatching(true);
    setMatchError(null);

    try {
      const response = await fetch('/api/recipients/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match recipient');
      }

      const data: MatchResponse = await response.json();
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      setMatchError(err);
      console.error('Error matching recipient:', err);
      return null;
    } finally {
      setIsMatching(false);
    }
  }, []);

  /**
   * Get recipient suggestions for autocomplete
   */
  const suggestRecipients = useCallback(
    async (query: string, limit: number = 10): Promise<SuggestResponse | null> => {
      if (!query || query.trim().length === 0) {
        return { suggestions: [], total: 0 };
      }

      setIsSuggesting(true);
      setSuggestError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString(),
        });

        const response = await fetch(`/api/recipients/suggest?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get suggestions');
        }

        const data: SuggestResponse = await response.json();
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error occurred');
        setSuggestError(err);
        console.error('Error getting suggestions:', err);
        return null;
      } finally {
        setIsSuggesting(false);
      }
    },
    []
  );

  return {
    matchRecipient,
    suggestRecipients,
    isMatching,
    isSuggesting,
    matchError,
    suggestError,
  };
}

/**
 * Helper hook for debounced suggestions (useful for search inputs)
 *
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns Debounced suggest function
 *
 * @example
 * ```tsx
 * const { debouncedSuggest } = useDebouncedRecipientSuggest();
 *
 * <input
 *   onChange={(e) => debouncedSuggest(e.target.value)}
 * />
 * ```
 */
export function useDebouncedRecipientSuggest(delay: number = 300) {
  const { suggestRecipients, isSuggesting, suggestError } = useRecipientMatch();
  const [suggestions, setSuggestions] = useState<SuggestResponse | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedSuggest = useCallback(
    (query: string, limit?: number) => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout
      const newTimeoutId = setTimeout(async () => {
        const result = await suggestRecipients(query, limit);
        setSuggestions(result);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [delay, suggestRecipients, timeoutId]
  );

  return {
    debouncedSuggest,
    suggestions,
    isSuggesting,
    suggestError,
  };
}
