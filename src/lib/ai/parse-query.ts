import { parseWithAI, type ParseContext, type ParsedMessage } from './parse-message';

export type QueryType =
  | 'status' // Overall status or child-specific status
  | 'restrictions' // Active restrictions
  | 'commitments' // Active commitments
  | 'history' // Historical data
  | 'stats' // Reliability/analytics
  | 'help'; // Help/examples

export interface ParsedQuery {
  queryType: QueryType;
  child?: string; // Specific child or null for all
  timeframe?: 'today' | 'this_week' | 'this_month' | 'all';
  filters?: {
    status?: string[];
    category?: string[];
  };
}

/**
 * Parse query message using Claude API
 */
export async function parseQuery(
  message: string,
  context: ParseContext
): Promise<ParsedMessage> {
  const childrenNames = context.children.map(c => c.name).join(', ');

  const systemPrompt = `You are a family accountability assistant. Parse this query/question.

Available children: ${childrenNames}
Current date/time: ${context.currentDate.toISOString()}

Extract the following information:
1. What type of query is this?
   - status: General or child-specific status
   - restrictions: What's restricted
   - commitments: What commitments are active
   - history: Past events/patterns
   - stats: Reliability scores, trends
   - help: User needs help/examples

2. Which child (if specific child mentioned)
3. Timeframe (today, this week, this month, or all time)
4. Any filters (active/completed/missed, categories, etc.)

Common patterns:
- "status" → overall status
- "what's Kid A restricted from?" → restrictions query for Kid A
- "show commitments" → commitments query for all children
- "Kid B's homework" → commitments query for Kid B, homework category
- "this week" → timeframe filter`;

  const schema = `{
  "queryType": "status | restrictions | commitments | history | stats | help",
  "child": "string (exact child name) or null",
  "timeframe": "today | this_week | this_month | all" or null,
  "filters": {
    "status": ["active", "completed", "missed"] or null,
    "category": ["homework", "chores"] or null
  } or null,
  "needsClarification": boolean,
  "clarificationQuestion": "string or null"
}`;

  const parsed = await parseWithAI<ParsedQuery & {
    needsClarification: boolean;
    clarificationQuestion?: string;
  }>(message, systemPrompt, schema);

  if (!parsed) {
    return {
      type: 'query',
      data: {},
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: 'What would you like to know?\n' +
        '• Status\n' +
        '• Restrictions\n' +
        '• Commitments\n' +
        '• Help\n\n' +
        'Reply with your choice or rephrase your question.',
    };
  }

  // Validate child name if provided
  if (parsed.child) {
    const childMatch = context.children.find(
      c => c.name.toLowerCase() === parsed.child?.toLowerCase()
    );

    if (!childMatch) {
      return {
        type: 'query',
        data: parsed,
        confidence: 'low',
        needsClarification: true,
        clarificationQuestion: `Child "${parsed.child}" not found. Available children:\n` +
          context.children.map((c, i) => `${i + 1}. ${c.name}`).join('\n') +
          '\n\nReply with number or correct name.',
      };
    }

    parsed.child = childMatch.name; // Use exact name
  }

  // Check if AI indicated clarification needed
  if (parsed.needsClarification) {
    return {
      type: 'query',
      data: parsed,
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: parsed.clarificationQuestion || 'Please provide more details.',
    };
  }

  return {
    type: 'query',
    data: parsed,
    confidence: 'high',
    needsClarification: false,
  };
}

/**
 * Example test cases for AI parser
 */
export const exampleQueries = [
  {
    input: 'status',
    expected: {
      queryType: 'status',
      child: null,
      timeframe: 'all',
    },
  },
  {
    input: 'what\'s Kid A restricted from?',
    expected: {
      queryType: 'restrictions',
      child: 'Kid A',
      timeframe: 'all',
    },
  },
  {
    input: 'show Kid B\'s commitments this week',
    expected: {
      queryType: 'commitments',
      child: 'Kid B',
      timeframe: 'this_week',
    },
  },
  {
    input: 'help',
    expected: {
      queryType: 'help',
      child: null,
    },
  },
  {
    input: 'Kid C reliability',
    expected: {
      queryType: 'stats',
      child: 'Kid C',
      timeframe: 'this_month',
    },
  },
];
