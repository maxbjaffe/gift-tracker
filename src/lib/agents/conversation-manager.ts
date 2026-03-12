import { createClient } from '@supabase/supabase-js';
import type { ConversationContext, ConversationMessage, IntentType } from './types';
import type { Persona } from './personas';

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class ConversationManager {
  /**
   * Get existing active conversation or create a new one.
   * A conversation is considered expired after 30 minutes of inactivity.
   */
  static async getOrCreate(
    userId: string,
    phone: string
  ): Promise<ConversationContext> {
    const supabase = getSupabase();

    // Look for recent conversation
    const { data: existing } = await supabase
      .from('giftstash_conversations')
      .select('*')
      .eq('phone', phone)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      const elapsed = Date.now() - new Date(existing.updated_at).getTime();
      if (elapsed < THIRTY_MINUTES_MS) {
        return {
          userId,
          conversationId: existing.id,
          history: (existing.messages as ConversationMessage[]) || [],
          persona: (existing.persona as Persona) || 'dash',
          metadata: {
            lastIntent: existing.last_intent,
            followUp: existing.follow_up,
          },
        };
      }
    }

    // Create new conversation
    const { data: created, error } = await supabase
      .from('giftstash_conversations')
      .insert({
        user_id: userId,
        phone,
        persona: 'dash',
        messages: [],
      })
      .select()
      .single();

    if (error || !created) {
      // Fallback: return an in-memory context
      return {
        userId,
        conversationId: 'ephemeral',
        history: [],
        persona: 'dash',
        metadata: {},
      };
    }

    return {
      userId,
      conversationId: created.id,
      history: [],
      persona: 'dash',
      metadata: {},
    };
  }

  /**
   * Append a message to the conversation history (fire-and-forget).
   */
  static async appendMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<void> {
    if (conversationId === 'ephemeral') return;

    const supabase = getSupabase();
    const newMessage: ConversationMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    // Fetch current messages, append, update
    const { data: conv } = await supabase
      .from('giftstash_conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    const messages = [
      ...((conv?.messages as ConversationMessage[]) || []),
      newMessage,
    ];

    // Keep last 10 messages to avoid unbounded growth
    const trimmed = messages.slice(-10);

    await supabase
      .from('giftstash_conversations')
      .update({
        messages: trimmed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);
  }

  /**
   * Update conversation state (persona, intent, follow-up).
   */
  static async updateState(
    conversationId: string,
    updates: {
      lastIntent?: IntentType;
      lastPersona?: Persona;
      followUp?: IntentType | null;
    }
  ): Promise<void> {
    if (conversationId === 'ephemeral') return;

    const supabase = getSupabase();
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.lastIntent) row.last_intent = updates.lastIntent;
    if (updates.lastPersona) row.persona = updates.lastPersona;
    if (updates.followUp !== undefined)
      row.follow_up = updates.followUp ?? null;

    await supabase
      .from('giftstash_conversations')
      .update(row)
      .eq('id', conversationId);
  }
}
