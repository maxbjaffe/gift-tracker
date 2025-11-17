import { parseWithAI, type ParseContext, type ParsedMessage } from './parse-message';
import type { RestrictionType, Severity } from '@/types/accountability';

export interface ParsedConsequence {
  child: string;
  restrictions: Array<{
    type: RestrictionType;
    item: string;
  }>;
  duration?: {
    days?: number;
    until?: string; // Date string or description
  };
  reasons: string[];
  severity: Severity;
  notes?: string;
}

/**
 * Parse consequence message using Claude API
 */
export async function parseConsequence(
  message: string,
  context: ParseContext
): Promise<ParsedMessage> {
  const childrenNames = context.children.map(c => c.name).join(', ');

  const systemPrompt = `You are a family accountability assistant. Parse this message about a consequence/punishment.

Available children: ${childrenNames}
Current date/time: ${context.currentDate.toISOString()}

Extract the following information:
1. Which child (must match one of the available names exactly)
2. What is restricted (devices, activities, privileges, location, other)
3. Duration (in days or specific end date/time)
4. Reason for the consequence
5. Severity (minor: 1-2 days, medium: 3-6 days, major: 7+ days or serious issue)

Restriction types:
- device: iPad, phone, TV, computer, screens, etc.
- activity: games, sports, playdates, etc.
- privilege: staying up late, treats, allowance, etc.
- location: going out, friends house, etc.
- other: anything else

Parse relative dates:
- "until Friday" → calculate date for next Friday
- "for a week" → 7 days
- "3 days" → 3 days from now
- "until tomorrow" → tomorrow's date`;

  const schema = `{
  "child": "string (exact match from available children)",
  "restrictions": [
    {
      "type": "device | activity | privilege | location | other",
      "item": "string (specific item like iPad, TV, etc.)"
    }
  ],
  "duration": {
    "days": number or null,
    "until": "ISO date string or null"
  },
  "reasons": ["string array of reasons"],
  "severity": "minor | medium | major",
  "notes": "string or null (any additional context)",
  "needsClarification": boolean,
  "clarificationQuestion": "string or null (what needs clarification)"
}`;

  const parsed = await parseWithAI<ParsedConsequence & {
    needsClarification: boolean;
    clarificationQuestion?: string;
  }>(message, systemPrompt, schema);

  if (!parsed) {
    return {
      type: 'consequence',
      data: {},
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: 'Could not parse consequence. Please include:\n' +
        '• Child name\n' +
        '• What to restrict\n' +
        '• Duration\n\n' +
        'Example: "No iPad 3 days Kid A homework"',
    };
  }

  // Validate child name
  const childMatch = context.children.find(
    c => c.name.toLowerCase() === parsed.child?.toLowerCase()
  );

  if (!childMatch) {
    return {
      type: 'consequence',
      data: parsed,
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: `Child "${parsed.child}" not found. Available children:\n` +
        context.children.map((c, i) => `${i + 1}. ${c.name}`).join('\n') +
        '\n\nReply with the number or correct name.',
    };
  }

  // Check if AI indicated clarification needed
  if (parsed.needsClarification) {
    return {
      type: 'consequence',
      data: parsed,
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: parsed.clarificationQuestion || 'Please provide more details.',
    };
  }

  // Calculate duration if needed
  if (parsed.duration?.until && !parsed.duration?.days) {
    const untilDate = parseUntilDate(parsed.duration.until, context.currentDate);
    if (untilDate) {
      const days = Math.ceil(
        (untilDate.getTime() - context.currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      parsed.duration.days = days;
    }
  }

  return {
    type: 'consequence',
    data: {
      ...parsed,
      child: childMatch.name, // Use exact name from database
    },
    confidence: 'high',
    needsClarification: false,
  };
}

/**
 * Parse "until [date/day]" expressions
 */
function parseUntilDate(until: string, currentDate: Date): Date | null {
  const normalized = until.toLowerCase().trim();

  // Handle day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (normalized.includes(days[i])) {
      const result = new Date(currentDate);
      const currentDay = result.getDay();
      const targetDay = i;

      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }

      result.setDate(result.getDate() + daysToAdd);
      result.setHours(20, 0, 0, 0); // Default to 8pm
      return result;
    }
  }

  // Try to parse as ISO date
  try {
    const date = new Date(until);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    // Not a valid date
  }

  return null;
}

/**
 * Example test cases for AI parser
 */
export const exampleConsequences = [
  {
    input: 'No iPad 3 days Kid A homework',
    expected: {
      child: 'Kid A',
      restrictions: [{ type: 'device', item: 'iPad' }],
      duration: { days: 3 },
      reasons: ['homework'],
      severity: 'medium',
    },
  },
  {
    input: 'Kid B grounded until Friday, lied about chores',
    expected: {
      child: 'Kid B',
      restrictions: [{ type: 'privilege', item: 'going out' }],
      duration: { until: 'next Friday' },
      reasons: ['lied about chores'],
      severity: 'major',
    },
  },
  {
    input: 'No iPad and TV for Kid C, 5 days, he was disrespectful and didn\'t do homework',
    expected: {
      child: 'Kid C',
      restrictions: [
        { type: 'device', item: 'iPad' },
        { type: 'device', item: 'TV' },
      ],
      duration: { days: 5 },
      reasons: ['disrespectful', 'didn\'t do homework'],
      severity: 'medium',
    },
  },
];
