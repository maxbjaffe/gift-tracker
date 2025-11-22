/**
 * Levenshtein Distance Algorithm
 *
 * Calculates the minimum number of single-character edits (insertions, deletions, or substitutions)
 * required to change one string into another.
 *
 * Used for fuzzy matching recipient names to handle typos and variations.
 */

/**
 * Calculate Levenshtein distance between two strings using dynamic programming
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns Number of edits needed (0 = identical)
 *
 * @example
 * levenshteinDistance('sarah', 'sara') // 1 (one deletion)
 * levenshteinDistance('john', 'jhon') // 2 (swap two chars)
 * levenshteinDistance('test', 'test') // 0 (identical)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  // Normalize strings: trim and convert to lowercase
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();

  // Handle empty strings
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  // Create matrix for dynamic programming
  // matrix[i][j] represents the distance between first i chars of s1 and first j chars of s2
  const matrix: number[][] = [];

  // Initialize first column (converting empty string to s1)
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row (converting empty string to s2)
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      // If characters match, no operation needed
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Take minimum of three operations:
        // 1. Substitute (diagonal): matrix[i-1][j-1] + 1
        // 2. Insert (left): matrix[i][j-1] + 1
        // 3. Delete (up): matrix[i-1][j] + 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        );
      }
    }
  }

  // Return bottom-right cell (distance between complete strings)
  return matrix[s1.length][s2.length];
}

/**
 * Check if two strings are similar within a given threshold
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @param maxDistance - Maximum acceptable edit distance (default: 2)
 * @returns True if strings are within distance threshold
 *
 * @example
 * areSimilar('sarah', 'sara') // true (distance 1)
 * areSimilar('sarah', 'sarha') // true (distance 2)
 * areSimilar('sarah', 'srah') // false (distance 3)
 */
export function areSimilar(
  str1: string,
  str2: string,
  maxDistance: number = 2
): boolean {
  const distance = levenshteinDistance(str1, str2);
  return distance <= maxDistance;
}

/**
 * Get adaptive max distance based on string length
 * Shorter strings require exact or near-exact matches
 * Longer strings can tolerate more variation
 *
 * @param str - String to evaluate
 * @returns Recommended max distance threshold
 *
 * @example
 * getAdaptiveMaxDistance('Jo') // 0 (2 chars - must be exact)
 * getAdaptiveMaxDistance('John') // 1 (4 chars - allow 1 typo)
 * getAdaptiveMaxDistance('Elizabeth') // 2 (9 chars - allow 2 typos)
 */
export function getAdaptiveMaxDistance(str: string): number {
  const len = str.trim().length;

  if (len <= 3) return 0;      // Very short names: exact match only
  if (len <= 5) return 1;      // Short names: allow 1 typo
  return 2;                     // Longer names: allow 2 typos
}

/**
 * Find best matches from a list of candidates
 *
 * @param target - String to match against
 * @param candidates - List of candidate strings
 * @param maxDistance - Maximum distance threshold (default: 2)
 * @returns Array of candidates sorted by similarity (best first)
 *
 * @example
 * const candidates = ['Sarah', 'Sara', 'John', 'Sally'];
 * findBestMatches('sarah', candidates) // ['Sarah', 'Sara', 'Sally']
 */
export function findBestMatches(
  target: string,
  candidates: string[],
  maxDistance: number = 2
): Array<{ value: string; distance: number }> {
  // Calculate distance for each candidate
  const matches = candidates
    .map((candidate) => ({
      value: candidate,
      distance: levenshteinDistance(target, candidate),
    }))
    .filter((match) => match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return matches;
}

/**
 * Calculate similarity percentage between two strings
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity percentage (0-100)
 *
 * @example
 * getSimilarityPercentage('sarah', 'sarah') // 100
 * getSimilarityPercentage('sarah', 'sara') // 80
 */
export function getSimilarityPercentage(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  if (maxLength === 0) return 100;

  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.round(similarity);
}
