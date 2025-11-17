import { parseWithAI, type ParseContext, type ParsedMessage } from './parse-message';
import type { CommitmentCategory } from '@/types/accountability';

export interface ParsedCommitment {
  child: string;
  commitments: Array<{
    text: string;
    category: CommitmentCategory;
    deadline: string; // ISO date string
  }>;
  committedBy: 'parent' | 'child';
  notes?: string;
}

/**
 * Parse commitment message using Claude API
 */
export async function parseCommitment(
  message: string,
  context: ParseContext
): Promise<ParsedMessage> {
  const childrenNames = context.children.map(c => c.name).join(', ');
  const currentDateTime = context.currentDate.toISOString();

  const systemPrompt = `You are a family accountability assistant. Parse this message about a commitment/promise.

Available children: ${childrenNames}
Current date/time: ${currentDateTime}

Extract the following information:
1. Which child is committing
2. What they're committing to do (can be multiple commitments)
3. Deadline for each commitment (specific date/time)
4. Category for each commitment
5. Who is making the commitment (parent or child)

Categories:
- homework: school assignments, studying, reading
- chores: cleaning, dishes, laundry, trash, etc.
- responsibilities: practice, lessons, sports, taking care of pets
- behavior: being respectful, attitude improvement, following rules
- other: anything else

Parse relative deadlines (all relative to ${currentDateTime}):
- "tonight" → today at 8pm
- "by 7pm" → today at 7pm (or tomorrow if already past)
- "tomorrow morning" → tomorrow at 9am
- "tomorrow afternoon" → tomorrow at 5pm
- "Friday" → next Friday at 5pm
- "by tomorrow" → tomorrow at 8pm

Return deadline as ISO 8601 datetime string.`;

  const schema = `{
  "child": "string (exact match from available children)",
  "commitments": [
    {
      "text": "string (what they're committing to do)",
      "category": "homework | chores | responsibilities | behavior | other",
      "deadline": "ISO 8601 date string"
    }
  ],
  "committedBy": "parent | child",
  "notes": "string or null (any additional context)",
  "needsClarification": boolean,
  "clarificationQuestion": "string or null (what needs clarification)"
}`;

  const parsed = await parseWithAI<ParsedCommitment & {
    needsClarification: boolean;
    clarificationQuestion?: string;
  }>(message, systemPrompt, schema);

  if (!parsed) {
    return {
      type: 'commitment',
      data: {},
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: 'Could not parse commitment. Please include:\n' +
        '• Child name\n' +
        '• What to do\n' +
        '• Deadline\n\n' +
        'Example: "Kid A will finish homework by 7pm"',
    };
  }

  // Validate child name
  const childMatch = context.children.find(
    c => c.name.toLowerCase() === parsed.child?.toLowerCase()
  );

  if (!childMatch) {
    return {
      type: 'commitment',
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
      type: 'commitment',
      data: parsed,
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: parsed.clarificationQuestion || 'Please provide more details.',
    };
  }

  // Validate deadlines
  for (const commitment of parsed.commitments) {
    const deadline = new Date(commitment.deadline);
    if (isNaN(deadline.getTime())) {
      return {
        type: 'commitment',
        data: parsed,
        confidence: 'low',
        needsClarification: true,
        clarificationQuestion: `Invalid deadline "${commitment.deadline}". Please specify when this should be done.`,
      };
    }

    // Check if deadline is in the past
    if (deadline < context.currentDate) {
      return {
        type: 'commitment',
        data: parsed,
        confidence: 'low',
        needsClarification: true,
        clarificationQuestion: `Deadline is in the past. Did you mean tomorrow?`,
      };
    }
  }

  return {
    type: 'commitment',
    data: {
      ...parsed,
      child: childMatch.name, // Use exact name from database
    },
    confidence: 'high',
    needsClarification: false,
  };
}

/**
 * Example test cases for AI parser
 */
export const exampleCommitments = [
  {
    input: 'Kid A will finish homework by 7pm today',
    expected: {
      child: 'Kid A',
      commitments: [{
        text: 'Finish homework',
        category: 'homework',
        deadline: '2025-11-16T19:00:00Z',
      }],
      committedBy: 'parent',
    },
  },
  {
    input: 'I\'ll clean my room and do laundry by tomorrow afternoon - Kid B',
    expected: {
      child: 'Kid B',
      commitments: [
        {
          text: 'Clean room',
          category: 'chores',
          deadline: '2025-11-17T17:00:00Z',
        },
        {
          text: 'Do laundry',
          category: 'chores',
          deadline: '2025-11-17T17:00:00Z',
        },
      ],
      committedBy: 'child',
    },
  },
  {
    input: 'Kid C commits to practice piano by 6pm and take out trash tonight',
    expected: {
      child: 'Kid C',
      commitments: [
        {
          text: 'Practice piano',
          category: 'responsibilities',
          deadline: '2025-11-16T18:00:00Z',
        },
        {
          text: 'Take out trash',
          category: 'chores',
          deadline: '2025-11-16T20:00:00Z',
        },
      ],
      committedBy: 'parent',
    },
  },
];
