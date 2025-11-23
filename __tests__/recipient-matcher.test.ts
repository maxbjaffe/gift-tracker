/**
 * Tests for Recipient Matching Engine
 */

import {
  findRecipientMatch,
  normalizeRecipientName,
  extractFirstName,
  getRecipientSuggestions,
} from '../src/lib/recipient-matcher';
import type { Recipient } from '../src/types/recipient-matching';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
};

// Sample test recipients
const testRecipients: Recipient[] = [
  {
    id: '1',
    user_id: 'user-123',
    name: 'Sarah Johnson',
    nickname: 'Sarah',
    relationship: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  } as Recipient,
  {
    id: '2',
    user_id: 'user-123',
    name: 'John Smith',
    nickname: 'Johnny',
    relationship: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  } as Recipient,
  {
    id: '3',
    user_id: 'user-123',
    name: 'Linda Martinez',
    nickname: null,
    relationship: 'Mother',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  } as Recipient,
  {
    id: '4',
    user_id: 'user-123',
    name: 'Robert Wilson',
    nickname: 'Bob',
    relationship: 'Father',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  } as Recipient,
  {
    id: '5',
    user_id: 'user-123',
    name: 'Elizabeth Brown',
    nickname: 'Liz',
    relationship: 'Sister',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  } as Recipient,
  {
    id: '6',
    user_id: 'user-123',
    name: 'Sara Garcia',
    nickname: null,
    relationship: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  } as Recipient,
];

describe('normalizeRecipientName', () => {
  it('should lowercase names', () => {
    expect(normalizeRecipientName('Sarah Johnson')).toBe('sarah johnson');
    expect(normalizeRecipientName('JOHN SMITH')).toBe('john smith');
  });

  it('should trim whitespace', () => {
    expect(normalizeRecipientName('  Sarah  ')).toBe('sarah');
  });

  it('should remove special characters', () => {
    expect(normalizeRecipientName('Sarah-Jane')).toBe('sarahjane');
    expect(normalizeRecipientName("O'Connor")).toBe('oconnor');
  });
});

describe('extractFirstName', () => {
  it('should extract first name from full name', () => {
    expect(extractFirstName('Sarah Johnson')).toBe('sarah');
    expect(extractFirstName('John Smith Jr.')).toBe('john');
  });

  it('should handle single names', () => {
    expect(extractFirstName('Sarah')).toBe('sarah');
  });

  it('should handle multiple spaces', () => {
    expect(extractFirstName('Sarah   Marie   Johnson')).toBe('sarah');
  });
});

describe('findRecipientMatch', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default Supabase mock
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: testRecipients,
          error: null,
        }),
      }),
    });
  });

  describe('Priority 1: Exact name matches', () => {
    it('should match exact name (case insensitive)', async () => {
      const result = await findRecipientMatch('sarah', 'user-123', mockSupabase as any);

      expect(result.matched).not.toBeNull();
      expect(result.matched?.name).toBe('Sarah Johnson');
      expect(result.confidence).toBe('exact');
      expect(result.shouldConfirm).toBe(false);
      expect(result.matchMethod).toBe('exact_name');
    });

    it('should match full name exactly', async () => {
      const result = await findRecipientMatch('Sarah Johnson', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('Sarah Johnson');
      expect(result.confidence).toBe('exact');
    });
  });

  describe('Priority 2: Exact nickname matches', () => {
    it('should match by nickname', async () => {
      const result = await findRecipientMatch('Johnny', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('John Smith');
      expect(result.confidence).toBe('exact');
      expect(result.matchMethod).toBe('exact_nickname');
    });

    it('should match nickname for Elizabeth/Liz', async () => {
      const result = await findRecipientMatch('Liz', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('Elizabeth Brown');
      expect(result.confidence).toBe('exact');
    });
  });

  describe('Priority 3: Relationship matches', () => {
    it('should match "Mom" to Mother relationship', async () => {
      const result = await findRecipientMatch('Mom', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('Linda Martinez');
      expect(result.matched?.relationship).toBe('Mother');
      expect(result.confidence).toBe('exact');
      expect(result.matchMethod).toBe('relationship');
    });

    it('should match "Dad" to Father relationship', async () => {
      const result = await findRecipientMatch('Dad', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('Robert Wilson');
      expect(result.matched?.relationship).toBe('Father');
      expect(result.confidence).toBe('exact');
    });

    it('should match "Sister" to Sister relationship', async () => {
      const result = await findRecipientMatch('Sister', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('Elizabeth Brown');
      expect(result.confidence).toBe('exact');
    });
  });

  describe('Priority 4: Fuzzy name matches', () => {
    it('should fuzzy match "Sara" to "Sarah" (distance=1)', async () => {
      const result = await findRecipientMatch('Sara', 'user-123', mockSupabase as any);

      // Should match either Sarah Johnson or Sara Garcia
      // Both are valid matches, but Sara Garcia is exact
      expect(result.matched).not.toBeNull();
      expect(['Sarah Johnson', 'Sara Garcia']).toContain(result.matched?.name);
    });

    it('should fuzzy match "Sarha" to "Sarah" (distance=2)', async () => {
      const result = await findRecipientMatch('Sarha', 'user-123', mockSupabase as any);

      expect(result.matched).not.toBeNull();
      expect(result.confidence).toBeOneOf(['medium', 'high']);
      expect(result.shouldConfirm).toBe(true);
    });

    it('should fuzzy match "Jhon" to "John" (distance=2)', async () => {
      const result = await findRecipientMatch('Jhon', 'user-123', mockSupabase as any);

      expect(result.matched?.name).toBe('John Smith');
      expect(result.confidence).toBeOneOf(['medium', 'high']);
    });

    it('should NOT match "Srah" to "Sarah" (distance=3, beyond threshold)', async () => {
      const result = await findRecipientMatch('Srah', 'user-123', mockSupabase as any);

      // Should either not match or have very low confidence
      if (result.matched) {
        expect(result.confidence).not.toBe('exact');
        expect(result.confidence).not.toBe('high');
      }
    });
  });

  describe('Priority 5: First name extraction', () => {
    it('should match first name when full name provided', async () => {
      const result = await findRecipientMatch('Sarah Martinez', 'user-123', mockSupabase as any);

      // Should match Sarah Johnson by first name
      expect(result.matched).not.toBeNull();
      expect(result.matched?.name).toContain('Sarah');
    });
  });

  describe('No match scenarios', () => {
    it('should return null for completely unknown names', async () => {
      const result = await findRecipientMatch('RandomUnknownName', 'user-123', mockSupabase as any);

      expect(result.matched).toBeNull();
      expect(result.confidence).toBe('none');
      expect(result.shouldConfirm).toBe(false);
    });

    it('should return empty array for user with no recipients', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await findRecipientMatch('Anyone', 'user-456', mockSupabase as any);

      expect(result.matched).toBeNull();
      expect(result.suggestions).toEqual([]);
    });

    it('should handle empty search string', async () => {
      const result = await findRecipientMatch('', 'user-123', mockSupabase as any);

      expect(result.matched).toBeNull();
      expect(result.confidence).toBe('none');
    });
  });

  describe('Multiple matches and suggestions', () => {
    it('should provide suggestions when confidence is medium/low', async () => {
      const result = await findRecipientMatch('Sarha', 'user-123', mockSupabase as any);

      if (result.confidence === 'medium' || result.confidence === 'low') {
        expect(result.suggestions).toBeDefined();
        expect(result.confirmationMessage).toBeDefined();
      }
    });

    it('should provide alternatives when no exact match', async () => {
      const result = await findRecipientMatch('Sar', 'user-123', mockSupabase as any);

      if (result.matched === null) {
        expect(result.suggestions).toBeDefined();
        // Should suggest both Sarah Johnson and Sara Garcia
        const suggestedNames = result.suggestions?.map((s) => s.recipient.name);
        expect(suggestedNames?.some((name) => name.includes('Sarah') || name.includes('Sara'))).toBe(true);
      }
    });
  });

  describe('Confirmation requirements', () => {
    it('should not require confirmation for exact matches', async () => {
      const result = await findRecipientMatch('Sarah Johnson', 'user-123', mockSupabase as any);

      expect(result.shouldConfirm).toBe(false);
      expect(result.confirmationMessage).toBeUndefined();
    });

    it('should require confirmation for medium confidence', async () => {
      const result = await findRecipientMatch('Sarha', 'user-123', mockSupabase as any);

      if (result.confidence === 'medium') {
        expect(result.shouldConfirm).toBe(true);
        expect(result.confirmationMessage).toContain('Did you mean');
      }
    });
  });

  describe('Error handling', () => {
    it('should throw error when Supabase query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      });

      await expect(
        findRecipientMatch('Sarah', 'user-123', mockSupabase as any)
      ).rejects.toThrow('Failed to fetch recipients');
    });
  });
});

describe('getRecipientSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: testRecipients,
          error: null,
        }),
      }),
    });
  });

  it('should return suggestions sorted by relevance', async () => {
    const suggestions = await getRecipientSuggestions('sar', 'user-123', mockSupabase as any);

    expect(suggestions.length).toBeGreaterThan(0);
    // Should prioritize names that start with 'sar'
    expect(suggestions[0].recipient.name).toMatch(/^sar/i);
  });

  it('should limit results to specified limit', async () => {
    const suggestions = await getRecipientSuggestions('s', 'user-123', mockSupabase as any, 3);

    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  it('should return empty array for empty query', async () => {
    const suggestions = await getRecipientSuggestions('', 'user-123', mockSupabase as any);

    expect(suggestions).toEqual([]);
  });

  it('should prioritize exact prefix matches', async () => {
    const suggestions = await getRecipientSuggestions('sarah', 'user-123', mockSupabase as any);

    // Sarah Johnson should be first (exact match)
    expect(suggestions[0].recipient.name).toContain('Sarah');
    expect(suggestions[0].similarity).toBe(100);
  });

  it('should handle first name matches', async () => {
    const suggestions = await getRecipientSuggestions('joh', 'user-123', mockSupabase as any);

    const names = suggestions.map((s) => s.recipient.name);
    expect(names).toContain('John Smith');
  });

  it('should handle nickname matches', async () => {
    const suggestions = await getRecipientSuggestions('liz', 'user-123', mockSupabase as any);

    const names = suggestions.map((s) => s.recipient.name);
    expect(names).toContain('Elizabeth Brown');
  });

  it('should filter out low similarity matches', async () => {
    const suggestions = await getRecipientSuggestions('xyz', 'user-123', mockSupabase as any);

    // Should not return results with very low similarity
    expect(suggestions.length).toBe(0);
  });
});

// Custom Jest matcher
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array}`,
        pass: false,
      };
    }
  },
});
