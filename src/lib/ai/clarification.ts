import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClarificationContext {
  originalMessage: string;
  partialData?: any;
  availableChildren: string[];
  currentDate: Date;
}

/**
 * Generate a clarifying question using Claude API
 * Helps resolve ambiguous messages
 */
export async function generateClarificationQuestion(
  context: ClarificationContext
): Promise<string> {
  const prompt = `You are a family accountability assistant. The user sent an ambiguous message that needs clarification.

Original message: "${context.originalMessage}"
Available children: ${context.availableChildren.join(', ')}

What information is missing or unclear? Generate a helpful, concise clarifying question.

Respond with ONLY the clarifying question (no preamble).

Examples:
- If child name is missing: "Which child? Reply: 1=Kid A, 2=Kid B, 3=Kid C"
- If duration is missing: "How long should this restriction last? (Reply with days or date)"
- If deadline is missing: "When should this be done by? (Tonight, tomorrow, specific time?)"
- If commitment text is unclear: "What exactly should they commit to doing?"`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const question = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : 'Please provide more details.';

    return question;
  } catch (error) {
    console.error('Error generating clarification:', error);
    return 'Could you provide more details? I need:\n' +
      '• Child name\n' +
      '• What action to take\n' +
      '• Duration or deadline';
  }
}

/**
 * Handle user response to clarification question
 * Attempts to merge clarification with original message
 */
export async function handleClarificationResponse(
  originalMessage: string,
  clarificationResponse: string,
  context: ClarificationContext
): Promise<string> {
  // Simple merge: combine original message with clarification
  // In a more advanced version, this could use AI to intelligently merge
  const merged = `${originalMessage} ${clarificationResponse}`;
  return merged;
}

/**
 * Suggest examples when user is stuck
 */
export function getHelpfulExamples(messageType: 'consequence' | 'commitment' | 'query' | 'general'): string {
  switch (messageType) {
    case 'consequence':
      return 'Consequence examples:\n' +
        '• "No iPad 3 days Kid A homework"\n' +
        '• "Kid B grounded until Friday attitude"\n' +
        '• "All screens Kid C until room is clean"';

    case 'commitment':
      return 'Commitment examples:\n' +
        '• "Kid A will finish homework by 7pm"\n' +
        '• "I\'ll clean my room tonight - Kid B"\n' +
        '• "Kid C commits to practice piano by 6pm"';

    case 'query':
      return 'Query examples:\n' +
        '• "status"\n' +
        '• "What\'s Kid A restricted from?"\n' +
        '• "Show Kid B\'s commitments"\n' +
        '• "Help"';

    case 'general':
    default:
      return 'SMS Command Examples:\n\n' +
        'CONSEQUENCES:\n' +
        '• "No iPad 3 days Kid A"\n' +
        '• "Restrict TV Kid B until Friday"\n\n' +
        'COMMITMENTS:\n' +
        '• "Kid A will finish homework by 7pm"\n' +
        '• "I\'ll clean my room tonight - Kid B"\n\n' +
        'QUERIES:\n' +
        '• "status"\n' +
        '• "What\'s Kid A restricted from?"\n\n' +
        'Reply HELP for more info.';
  }
}
