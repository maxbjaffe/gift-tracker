/**
 * Tests for Levenshtein Distance Algorithm
 */

import {
  levenshteinDistance,
  areSimilar,
  getAdaptiveMaxDistance,
  getSimilarityPercentage,
  findBestMatches,
} from '../src/lib/levenshtein';

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('sarah', 'sarah')).toBe(0);
    expect(levenshteinDistance('test', 'test')).toBe(0);
  });

  it('should handle case insensitivity', () => {
    expect(levenshteinDistance('Sarah', 'sarah')).toBe(0);
    expect(levenshteinDistance('JOHN', 'john')).toBe(0);
  });

  it('should handle whitespace trimming', () => {
    expect(levenshteinDistance('  sarah  ', 'sarah')).toBe(0);
    expect(levenshteinDistance('sarah', '  sarah  ')).toBe(0);
  });

  it('should return correct distance for 1-character difference', () => {
    expect(levenshteinDistance('sarah', 'sara')).toBe(1); // deletion
    expect(levenshteinDistance('sara', 'sarah')).toBe(1); // insertion
  });

  it('should return correct distance for 2-character differences', () => {
    expect(levenshteinDistance('sarah', 'sarha')).toBe(2); // transposition
    expect(levenshteinDistance('sarah', 'sahra')).toBe(2);
  });

  it('should reject matches beyond distance threshold', () => {
    expect(levenshteinDistance('sarah', 'srah')).toBe(2); // still within 2
    expect(levenshteinDistance('sarah', 'srh')).toBeGreaterThan(2); // beyond threshold
  });

  it('should handle empty strings', () => {
    expect(levenshteinDistance('', 'sarah')).toBe(5);
    expect(levenshteinDistance('sarah', '')).toBe(5);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should handle typo cases from requirements', () => {
    // From requirements: "Sara" should match "Sarah" (distance=1)
    expect(levenshteinDistance('sara', 'sarah')).toBe(1);

    // From requirements: "Sarha" should match "Sarah" (distance=2)
    expect(levenshteinDistance('sarha', 'sarah')).toBe(2);

    // From requirements: "Sahra" should match "Sarah" (distance=2)
    expect(levenshteinDistance('sahra', 'sarah')).toBe(2);

    // From requirements: "Srah" should NOT match "Sarah" (distance=3)
    expect(levenshteinDistance('srah', 'sarah')).toBeGreaterThan(2);
  });

  it('should handle common name typos', () => {
    expect(levenshteinDistance('jhon', 'john')).toBe(2); // transposition
    expect(levenshteinDistance('elizabth', 'elizabeth')).toBe(1); // missing 'e'
  });
});

describe('areSimilar', () => {
  it('should return true for exact matches', () => {
    expect(areSimilar('sarah', 'sarah')).toBe(true);
  });

  it('should return true within default threshold (2)', () => {
    expect(areSimilar('sarah', 'sara')).toBe(true); // distance 1
    expect(areSimilar('sarah', 'sarha')).toBe(true); // distance 2
  });

  it('should return false beyond default threshold', () => {
    expect(areSimilar('sarah', 'srah')).toBe(true); // distance 2 - still within
    expect(areSimilar('sarah', 'srh')).toBe(false); // distance 3 - beyond
  });

  it('should respect custom thresholds', () => {
    expect(areSimilar('sarah', 'sara', 1)).toBe(true); // within 1
    expect(areSimilar('sarah', 'sarha', 1)).toBe(false); // beyond 1
    expect(areSimilar('sarah', 'srah', 3)).toBe(true); // within 3
  });
});

describe('getAdaptiveMaxDistance', () => {
  it('should return 0 for very short names (≤3 chars)', () => {
    expect(getAdaptiveMaxDistance('Jo')).toBe(0);
    expect(getAdaptiveMaxDistance('Sam')).toBe(0);
  });

  it('should return 1 for short names (4-5 chars)', () => {
    expect(getAdaptiveMaxDistance('John')).toBe(1);
    expect(getAdaptiveMaxDistance('Sarah')).toBe(1);
  });

  it('should return 2 for longer names (>5 chars)', () => {
    expect(getAdaptiveMaxDistance('Elizabeth')).toBe(2);
    expect(getAdaptiveMaxDistance('Christopher')).toBe(2);
  });

  it('should handle whitespace trimming', () => {
    expect(getAdaptiveMaxDistance('  Jo  ')).toBe(0);
    expect(getAdaptiveMaxDistance('  John  ')).toBe(1);
  });
});

describe('getSimilarityPercentage', () => {
  it('should return 100% for identical strings', () => {
    expect(getSimilarityPercentage('sarah', 'sarah')).toBe(100);
  });

  it('should return 80% for sarah vs sara', () => {
    // Sarah has 5 chars, distance is 1
    // (5 - 1) / 5 = 0.8 = 80%
    expect(getSimilarityPercentage('sarah', 'sara')).toBe(80);
  });

  it('should return lower percentage for greater differences', () => {
    const similarity1 = getSimilarityPercentage('sarah', 'sara'); // distance 1
    const similarity2 = getSimilarityPercentage('sarah', 'sarha'); // distance 2
    expect(similarity1).toBeGreaterThan(similarity2);
  });

  it('should return 0% for completely different strings', () => {
    expect(getSimilarityPercentage('abc', 'xyz')).toBe(0);
  });

  it('should handle empty strings', () => {
    expect(getSimilarityPercentage('', '')).toBe(100);
  });
});

describe('findBestMatches', () => {
  it('should return matches sorted by distance', () => {
    const candidates = ['Sarah Johnson', 'Sara Martinez', 'Sally Smith', 'John Doe'];
    const matches = findBestMatches('sarah', candidates);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].value).toBe('Sarah Johnson'); // exact match
    expect(matches[0].distance).toBe(0);
  });

  it('should filter out matches beyond threshold', () => {
    const candidates = ['Sarah', 'Sara', 'Sally', 'Completely Different Name'];
    const matches = findBestMatches('sarah', candidates, 2);

    const matchedNames = matches.map((m) => m.value);
    expect(matchedNames).toContain('Sarah');
    expect(matchedNames).toContain('Sara');
    expect(matchedNames).not.toContain('Completely Different Name');
  });

  it('should handle empty candidate list', () => {
    const matches = findBestMatches('sarah', []);
    expect(matches).toEqual([]);
  });

  it('should sort by best match first', () => {
    const candidates = ['Sally', 'Sara', 'Sarah'];
    const matches = findBestMatches('sarah', candidates);

    expect(matches[0].value).toBe('Sarah'); // distance 0
    expect(matches[1].value).toBe('Sara'); // distance 1
    expect(matches[2].value).toBe('Sally'); // distance 2
  });
});
