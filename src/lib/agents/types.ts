export type IntentType =
  | 'capture'
  | 'lookup'
  | 'suggest'
  | 'budget'
  | 'occasion'
  | 'inventory'
  | 'enrich'
  | 'status';

export interface Intent {
  type: IntentType;
  confidence: number;
  source: 'keyword' | 'ai';
}

export interface AgentResponse {
  reply: string;
  actions: Action[];
  persona: 'dash' | 'scout';
  followUp?: IntentType;
  confidence: number;
  agentPath: string[];
}

export interface Action {
  type: 'create_gift' | 'update_gift' | 'match_recipient' | 'log_conversation';
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
}

export interface ConversationContext {
  userId: string;
  conversationId: string;
  history: ConversationMessage[];
  recipient?: {
    id: string;
    name: string;
    relationship?: string;
  };
  persona: 'dash' | 'scout';
  images?: { url: string; base64: string; mediaType: string }[];
  metadata: Record<string, unknown>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
