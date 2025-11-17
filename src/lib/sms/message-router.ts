import { detectShortcut, handleShortcut } from './shortcuts';
import { detectBulkOperation } from './bulk-operations';
import { getSMSContext, saveSMSContext, hasPendingClarification, mergeClarificationResponse } from './context-manager';

export type MessageIntent = 'consequence' | 'commitment' | 'query' | 'response' | 'unknown' | 'shortcut' | 'bulk';

export interface RouterResult {
  intent: MessageIntent;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  isBulk?: boolean;
  bulkTargets?: 'all' | 'multiple' | 'single';
  childNames?: string[];
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

  // 1. Check for shortcuts first (STATUS, HELP, CLEAR ALL, etc.)
  const shortcut = detectShortcut(message);
  if (shortcut) {
    return {
      intent: 'shortcut',
      confidence: 'high',
      message: normalized,
    };
  }

  // 2. Check for bulk operations (all kids, everyone, Emma and Jake)
  const bulkDetection = detectBulkOperation(message);
  if (bulkDetection.isBulk) {
    return {
      intent: 'bulk',
      confidence: 'high',
      message: normalized,
      isBulk: true,
      bulkTargets: bulkDetection.targets,
      childNames: bulkDetection.childNames,
    };
  }

  // 3. Check for response keywords (CONFIRM, DONE, etc.)
  if (containsKeywords(normalized, RESPONSE_KEYWORDS)) {
    return {
      intent: 'response',
      confidence: 'high',
      message: normalized,
    };
  }

  // 4. Check for query keywords (what, show, status, etc.)
  if (containsKeywords(normalized, QUERY_KEYWORDS)) {
    return {
      intent: 'query',
      confidence: 'high',
      message: normalized,
    };
  }

  // 5. Check for consequence keywords (no, restrict, etc.)
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
 * Now with context management, shortcuts, and bulk operations support
 */
export async function routeMessage(
  intent: MessageIntent,
  message: string,
  fromNumber: string,
  userId?: string
): Promise<string> {
  // Load SMS context for this phone number
  const context = await getSMSContext(fromNumber);

  // If user has pending clarification, merge response with context
  if (context && hasPendingClarification(context)) {
    const mergedData = mergeClarificationResponse(context, message);
    // Save updated context
    await saveSMSContext(
      fromNumber,
      context.userId,
      message,
      context.lastIntent,
      mergedData,
      null // Clear pending clarification
    );
    // Re-route the original intent with merged data
    // TODO: Pass mergedData to handlers
  }

  switch (intent) {
    case 'shortcut':
      // Handle shortcut commands (STATUS, HELP, CLEAR ALL, etc.)
      if (!userId) {
        return 'Please authenticate first by logging in through the app.';
      }
      const shortcutCommand = detectShortcut(message);
      if (shortcutCommand) {
        const response = await handleShortcut(shortcutCommand, userId, fromNumber);
        await saveSMSContext(fromNumber, userId, message, 'shortcut', {}, null);
        return response;
      }
      return 'Shortcut command not recognized.';

    case 'bulk':
      // Handle bulk operations (all kids, Emma and Jake, etc.)
      if (!userId) {
        return 'Please authenticate first by logging in through the app.';
      }
      const { handleBulkMessage } = await import('./bulk-handler');
      const bulkDetection = detectBulkOperation(message);
      const bulkResponse = await handleBulkMessage(
        message,
        fromNumber,
        userId,
        bulkDetection.targets,
        bulkDetection.childNames
      );
      await saveSMSContext(fromNumber, userId, message, 'bulk', {
        lastChildMentioned: bulkDetection.childNames?.[0],
      }, null);
      return bulkResponse;

    case 'consequence':
      const { handleConsequenceMessage } = await import('./consequence-handler');
      const consequenceResponse = await handleConsequenceMessage(message, fromNumber);
      if (userId) {
        await saveSMSContext(fromNumber, userId, message, 'consequence', {}, null);
      }
      return consequenceResponse;

    case 'commitment':
      const { handleCommitmentMessage } = await import('./commitment-handler');
      const commitmentResponse = await handleCommitmentMessage(message, fromNumber);
      if (userId) {
        await saveSMSContext(fromNumber, userId, message, 'commitment', {}, null);
      }
      return commitmentResponse;

    case 'query':
      const { handleQueryMessage } = await import('./query-handler');
      const queryResponse = await handleQueryMessage(message, fromNumber);
      if (userId) {
        await saveSMSContext(fromNumber, userId, message, 'query', {}, null);
      }
      return queryResponse;

    case 'response':
      const { handleResponseMessage } = await import('./response-handler');
      const responseMessage = await handleResponseMessage(message, fromNumber);
      if (userId) {
        await saveSMSContext(fromNumber, userId, message, 'response', {}, null);
      }
      return responseMessage;

    case 'unknown':
      return "I didn't understand that message. Reply HELP for command examples or try:\n\n" +
        "• 'No iPad 3 days Emma' (consequence)\n" +
        "• 'Emma will finish homework by 7pm' (commitment)\n" +
        "• STATUS - see all restrictions\n" +
        "• HELP - see all commands";

    default:
      return 'Error processing message. Please try again.';
  }
}
