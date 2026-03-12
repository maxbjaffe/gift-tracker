import { callClaude } from '../claude';
import { ConversationManager } from './conversation-manager';
import { CaptureAgent } from './capture-agent';
import { detectPersona } from './personas';
import { BaseAgent } from './base-agent';
import type { Intent, IntentType, AgentResponse, ConversationContext } from './types';

// Keyword patterns for fast-path intent detection
const INTENT_PATTERNS: [IntentType, RegExp][] = [
  ['capture', /\b(would love|great for|gift idea|picked up|get her|get him|buy|found|saw)\b/i],
  ['lookup', /\b(what do i have|saved for|show me|list)\b/i],
  ['suggest', /\b(help me find|suggest|recommend|ideas for)\b/i],
  ['budget', /\b(how much|spent|budget|spending)\b/i],
  ['occasion', /\b(when is|birthday|anniversary|coming up)\b/i],
  ['inventory', /\b(on hand|in stock|stash|closet|party gifts)\b/i],
  ['enrich', /\b(find links|where to buy|price check)\b/i],
  ['status', /\b(mark as|purchased|bought|given|wrapped)\b/i],
];

export class GiftStashOrchestrator {
  private agents: BaseAgent[];

  constructor() {
    this.agents = [new CaptureAgent()];
    // Future: LookupAgent, SuggestAgent, BudgetAgent, etc.
  }

  async handleSMS(
    message: string,
    images: { url: string; base64: string; mediaType: string }[],
    user: { id: string; phone: string }
  ): Promise<AgentResponse> {
    // 1. Load or create conversation context
    const context = await ConversationManager.getOrCreate(user.id, user.phone);

    // Attach images if present
    if (images.length > 0) {
      context.images = images;
    }

    // 2. Detect persona
    const persona = detectPersona(message, context);
    context.persona = persona;

    // 3. Classify intent
    const intent = await this.classifyIntent(message, context);

    // 4. Route to appropriate agent
    const agent = this.findAgent(intent, context);
    if (!agent) {
      // No agent can handle — default to capture
      const captureIntent: Intent = { type: 'capture', confidence: 0.5, source: 'keyword' };
      const fallbackAgent = this.agents[0];
      const response = await fallbackAgent.execute(message, context, captureIntent);

      // Persist conversation (fire-and-forget)
      this.persistConversation(context, message, response, captureIntent);

      return response;
    }

    // 5. Execute agent
    const response = await agent.execute(message, context, intent);

    // 6. Persist conversation (fire-and-forget)
    this.persistConversation(context, message, response, intent);

    return response;
  }

  private async classifyIntent(
    message: string,
    context: ConversationContext
  ): Promise<Intent> {
    // Check if prior turn set a follow-up intent
    const followUp = context.metadata.followUp as IntentType | undefined;
    if (followUp) {
      return { type: followUp, confidence: 0.9, source: 'keyword' };
    }

    // Keyword fast-path
    for (const [type, pattern] of INTENT_PATTERNS) {
      if (pattern.test(message)) {
        return { type, confidence: 0.85, source: 'keyword' };
      }
    }

    // Haiku fallback for ambiguous messages
    try {
      const response = await callClaude(
        `Classify this SMS message into one intent type.
Message: "${message}"

Intent types: capture (saving a gift idea), lookup (checking saved gifts), suggest (wanting recommendations), budget (spending questions), occasion (date/event questions), inventory (gift inventory), enrich (find links/prices), status (update gift status).

Respond with ONLY the intent type word, nothing else.`,
        {
          model: 'haiku',
          maxTokens: 20,
          temperature: 0,
          caller: 'Orchestrator.classifyIntent',
        }
      );

      const cleaned = response.trim().toLowerCase() as IntentType;
      const validIntents: IntentType[] = [
        'capture', 'lookup', 'suggest', 'budget',
        'occasion', 'inventory', 'enrich', 'status',
      ];

      if (validIntents.includes(cleaned)) {
        return { type: cleaned, confidence: 0.7, source: 'ai' };
      }
    } catch {
      // AI classification failed — fall through to default
    }

    // Default to capture
    return { type: 'capture', confidence: 0.5, source: 'keyword' };
  }

  private findAgent(intent: Intent, context: ConversationContext): BaseAgent | null {
    for (const agent of this.agents) {
      if (agent.canHandle(intent, context)) {
        return agent;
      }
    }
    return null;
  }

  private persistConversation(
    context: ConversationContext,
    userMessage: string,
    response: AgentResponse,
    intent: Intent
  ): void {
    // Fire-and-forget — don't block the SMS response
    Promise.all([
      ConversationManager.appendMessage(context.conversationId, 'user', userMessage),
      ConversationManager.appendMessage(context.conversationId, 'assistant', response.reply),
      ConversationManager.updateState(context.conversationId, {
        lastIntent: intent.type,
        lastPersona: response.persona,
        followUp: response.followUp ?? null,
      }),
    ]).catch((err) => {
      console.error('[Orchestrator] Failed to persist conversation:', err);
    });
  }
}
