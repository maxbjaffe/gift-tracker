import Anthropic from '@anthropic-ai/sdk';
import type { Child } from '@/types/accountability';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ParseContext {
  children: Child[];
  recentMessages?: string[];
  currentDate: Date;
  userTimezone?: string;
}

export interface ParsedMessage {
  type: 'consequence' | 'commitment' | 'query' | 'response' | 'unknown';
  data: any;
  confidence: 'high' | 'medium' | 'low';
  needsClarification: boolean;
  clarificationQuestion?: string;
}

/**
 * Main parsing function using Claude API
 * Routes to specialized parsers based on message type
 */
export async function parseAccountabilityMessage(
  message: string,
  context: ParseContext
): Promise<ParsedMessage> {
  try {
    // First, determine the message type using Claude
    const messageType = await detectMessageType(message, context);

    // Route to specialized parser
    switch (messageType) {
      case 'consequence':
        const { parseConsequence } = await import('./parse-consequence');
        return parseConsequence(message, context);

      case 'commitment':
        const { parseCommitment } = await import('./parse-commitment');
        return parseCommitment(message, context);

      case 'query':
        const { parseQuery } = await import('./parse-query');
        return parseQuery(message, context);

      case 'response':
        // Response handling is simpler, doesn't need AI parsing
        return {
          type: 'response',
          data: { message },
          confidence: 'high',
          needsClarification: false,
        };

      default:
        return {
          type: 'unknown',
          data: {},
          confidence: 'low',
          needsClarification: true,
          clarificationQuestion: 'I didn\'t understand that. Are you:\n' +
            '1. Setting a consequence/restriction\n' +
            '2. Creating a commitment\n' +
            '3. Asking a question\n\n' +
            'Reply with the number or try rephrasing.',
        };
    }
  } catch (error) {
    console.error('Error parsing message with AI:', error);

    // Fallback to unknown type
    return {
      type: 'unknown',
      data: {},
      confidence: 'low',
      needsClarification: true,
      clarificationQuestion: 'Error processing message. Please try again or reply HELP for examples.',
    };
  }
}

/**
 * Detect message type using Claude API
 */
async function detectMessageType(
  message: string,
  context: ParseContext
): Promise<'consequence' | 'commitment' | 'query' | 'response' | 'unknown'> {
  const childrenNames = context.children.map(c => c.name).join(', ');

  const prompt = `You are a family accountability assistant. Analyze this SMS message and determine its type.

Available children: ${childrenNames}
Current date/time: ${context.currentDate.toISOString()}

Message: "${message}"

Determine if this is:
1. CONSEQUENCE - Parent setting a punishment/restriction (keywords: no, restrict, take away, ban, grounded)
2. COMMITMENT - Someone committing to do something (keywords: will, commit, promise, by, do)
3. QUERY - Asking for information (keywords: what, show, status, when, how)
4. RESPONSE - Responding to a previous notification (keywords: confirm, yes, no, done, missed, lift)
5. UNKNOWN - Cannot determine

Respond with ONLY one word: CONSEQUENCE, COMMITMENT, QUERY, RESPONSE, or UNKNOWN`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const result = response.content[0].type === 'text'
      ? response.content[0].text.trim().toUpperCase()
      : 'UNKNOWN';

    // Map result to type
    if (result.includes('CONSEQUENCE')) return 'consequence';
    if (result.includes('COMMITMENT')) return 'commitment';
    if (result.includes('QUERY')) return 'query';
    if (result.includes('RESPONSE')) return 'response';

    return 'unknown';
  } catch (error) {
    console.error('Error detecting message type:', error);
    return 'unknown';
  }
}

/**
 * Generic AI parsing function with structured output
 */
export async function parseWithAI<T>(
  message: string,
  systemPrompt: string,
  schema: string
): Promise<T | null> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\nMessage to parse: "${message}"\n\nExpected JSON schema: ${schema}\n\nRespond with ONLY valid JSON matching the schema.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

    // Extract JSON from response (Claude might add extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No valid JSON found in AI response:', text);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as T;
  } catch (error) {
    console.error('Error parsing with AI:', error);
    return null;
  }
}
