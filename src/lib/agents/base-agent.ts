import type { Intent, AgentResponse, ConversationContext } from './types';

export abstract class BaseAgent {
  abstract name: string;

  abstract canHandle(intent: Intent, context: ConversationContext): boolean;

  abstract execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse>;
}
