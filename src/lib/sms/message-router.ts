export type MessageIntent = 'consequence' | 'commitment' | 'query' | 'response' | 'unknown';

export interface RouterResult {
  intent: MessageIntent;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

// Keywords that indicate different message types
const CONSEQUENCE_KEYWORDS = [
  'no',
  'restrict',
  'take away',
  'remove',
  'ban',
  'grounded',
  'ground',
  'lose',
  'lost',
  'consequence',
  'punishment',
  'punish',
];

const COMMITMENT_KEYWORDS = [
  'will',
  'commit',
  'promise',
  'by',
  'do',
  'finish',
  'complete',
  'get done',
  'gonna',
  'going to',
];

const QUERY_KEYWORDS = [
  'what',
  'show',
  'status',
  'check',
  'list',
  'tell me',
  'display',
  'view',
  'see',
  'how',
  'when',
];

const RESPONSE_KEYWORDS = [
  'confirm',
  'approved',
  'approve',
  'yes',
  'ok',
  'okay',
  'deny',
  'no',
  'reject',
  'modify',
  'change',
  'discuss',
  'talk',
  'done',
  'missed',
  'late',
  'lift',
  'extend',
];

/**
 * Detect message intent using keyword-based classification
 * Falls back to AI parsing if uncertain
 */
export function detectMessageIntent(message: string): RouterResult {
  const normalized = message.toLowerCase().trim();

  // Check for response keywords first (CONFIRM, DONE, etc.)
  if (containsKeywords(normalized, RESPONSE_KEYWORDS)) {
    return {
      intent: 'response',
      confidence: 'high',
      message: normalized,
    };
  }

  // Check for query keywords (what, show, status, etc.)
  if (containsKeywords(normalized, QUERY_KEYWORDS)) {
    return {
      intent: 'query',
      confidence: 'high',
      message: normalized,
    };
  }

  // Check for consequence keywords (no, restrict, etc.)
  const hasConsequenceKeywords = containsKeywords(normalized, CONSEQUENCE_KEYWORDS);
  const hasCommitmentKeywords = containsKeywords(normalized, COMMITMENT_KEYWORDS);

  if (hasConsequenceKeywords && !hasCommitmentKeywords) {
    return {
      intent: 'consequence',
      confidence: 'high',
      message: normalized,
    };
  }

  if (hasCommitmentKeywords && !hasConsequenceKeywords) {
    return {
      intent: 'commitment',
      confidence: 'high',
      message: normalized,
    };
  }

  // Both or neither - check for specific patterns
  if (hasConsequenceKeywords && hasCommitmentKeywords) {
    // Likely a consequence if it mentions "no" or "restrict"
    if (normalized.includes('no ') || normalized.includes('restrict')) {
      return {
        intent: 'consequence',
        confidence: 'medium',
        message: normalized,
      };
    }

    // Likely a commitment if it has "will" or future tense
    if (normalized.includes('will') || normalized.includes('by')) {
      return {
        intent: 'commitment',
        confidence: 'medium',
        message: normalized,
      };
    }
  }

  // If message contains child name and action words, likely consequence
  if (containsChildReference(normalized) && containsActionWord(normalized)) {
    return {
      intent: 'consequence',
      confidence: 'low',
      message: normalized,
    };
  }

  // Unknown - will need AI parsing or clarification
  return {
    intent: 'unknown',
    confidence: 'low',
    message: normalized,
  };
}

/**
 * Check if message contains any of the keywords
 */
function containsKeywords(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => {
    // Check for whole word matches (avoid false positives)
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(message);
  });
}

/**
 * Check if message contains a child reference
 */
function containsChildReference(message: string): boolean {
  const childPatterns = [
    /\bkid [a-z]\b/i,
    /\bson\b/i,
    /\bdaughter\b/i,
    /\bchild\b/i,
    /\b[a-z]+ (he|she|they)\b/i, // Name followed by pronoun
  ];

  return childPatterns.some((pattern) => pattern.test(message));
}

/**
 * Check if message contains action words
 */
function containsActionWord(message: string): boolean {
  const actionWords = [
    'needs to',
    'has to',
    'must',
    'should',
    'supposed to',
    'going to',
    'gonna',
  ];

  return actionWords.some((word) => message.includes(word));
}

/**
 * Extract child name from message
 * Returns null if no child name found
 */
export function extractChildName(message: string): string | null {
  // Look for "Kid A", "Kid B", "Kid C" pattern
  const kidPattern = /\bkid ([a-z])\b/i;
  const match = message.match(kidPattern);

  if (match) {
    return `Kid ${match[1].toUpperCase()}`;
  }

  return null;
}

/**
 * Route message to appropriate handler based on intent
 */
export async function routeMessage(
  intent: MessageIntent,
  message: string,
  fromNumber: string
): Promise<string> {
  switch (intent) {
    case 'consequence':
      const { handleConsequenceMessage } = await import('./consequence-handler');
      return handleConsequenceMessage(message, fromNumber);

    case 'commitment':
      const { handleCommitmentMessage } = await import('./commitment-handler');
      return handleCommitmentMessage(message, fromNumber);

    case 'query':
      const { handleQueryMessage } = await import('./query-handler');
      return handleQueryMessage(message, fromNumber);

    case 'response':
      const { handleResponseMessage } = await import('./response-handler');
      return handleResponseMessage(message, fromNumber);

    case 'unknown':
      return "I didn't understand that message. Reply HELP for command examples or try:\n\n" +
        "• 'No iPad 3 days Kid A' (consequence)\n" +
        "• 'Kid A will finish homework by 7pm' (commitment)\n" +
        "• 'What's Kid A restricted from?' (query)";

    default:
      return 'Error processing message. Please try again.';
  }
}
