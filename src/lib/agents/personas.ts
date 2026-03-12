import type { ConversationContext } from './types';

export type Persona = 'dash' | 'scout';

const URGENCY_PATTERNS =
  /\b(quick|fast|tonight|tomorrow|last minute|asap|rush|hurry|need now)\b/i;

const THOUGHTFULNESS_PATTERNS =
  /\b(help me think|something special|meaningful|perfect gift|unique|sentimental|personalized)\b/i;

const CLOSE_RELATIONSHIPS = new Set([
  'spouse',
  'wife',
  'husband',
  'partner',
  'parent',
  'mom',
  'mother',
  'dad',
  'father',
  'child',
  'son',
  'daughter',
  'sibling',
  'sister',
  'brother',
]);

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

/**
 * Detect which persona to use for this message.
 * Priority (first match wins):
 * 1. Explicit override (message starts with "dash" or "scout")
 * 2. Conversation continuity (keep persona if convo < 30 min old)
 * 3. Urgency signals → Dash
 * 4. Thoughtfulness signals → Scout
 * 5. Close relationship → Scout
 * 6. Short message (< 10 words) → Dash
 * 7. Long message (> 30 words) → Scout
 * 8. Default → Dash
 */
export function detectPersona(
  message: string,
  context: ConversationContext
): Persona {
  const trimmed = message.trim().toLowerCase();

  // 1. Explicit override
  if (trimmed.startsWith('dash ') || trimmed === 'dash') return 'dash';
  if (trimmed.startsWith('scout ') || trimmed === 'scout') return 'scout';

  // 2. Conversation continuity — keep persona if recent
  if (context.history.length > 0) {
    const lastMsg = context.history[context.history.length - 1];
    const elapsed = Date.now() - new Date(lastMsg.timestamp).getTime();
    if (elapsed < THIRTY_MINUTES_MS) {
      return context.persona;
    }
  }

  // 3. Urgency signals → Dash
  if (URGENCY_PATTERNS.test(message)) return 'dash';

  // 4. Thoughtfulness signals → Scout
  if (THOUGHTFULNESS_PATTERNS.test(message)) return 'scout';

  // 5. Close relationship → Scout
  if (context.recipient?.relationship) {
    const rel = context.recipient.relationship.toLowerCase();
    if (CLOSE_RELATIONSHIPS.has(rel)) return 'scout';
  }

  // 6/7. Message length heuristics
  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount < 10) return 'dash';
  if (wordCount > 30) return 'scout';

  // 8. Default
  return 'dash';
}

/**
 * Get the system prompt fragment for a persona.
 * Injected into agent system prompts to shape reply tone.
 */
export function getPersonaPrompt(persona: Persona): string {
  if (persona === 'scout') {
    return `You are Scout, a warm and thoughtful gift assistant. You're curious about the person receiving the gift and love helping find something meaningful. You ask good questions about what makes someone tick. Keep replies friendly but concise (SMS-friendly). When confirming a saved gift, mention why it might be a great choice.`;
  }

  return `You are Dash, a quick and efficient gift assistant. You save gifts fast with minimal back-and-forth. Keep replies to 1 SMS segment (~160 chars) when possible. Max 1 follow-up question. Confirm saves with just the key facts.`;
}
