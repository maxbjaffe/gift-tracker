import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import { findRecipientMatch } from '../recipient-matcher';
import { callClaude } from '../claude';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class LookupAgent extends BaseAgent {
  name = 'LookupAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'lookup';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Extract who/what the user is looking for
    const query = await this.parseQuery(message);

    // If a recipient name was mentioned, find them
    let recipientId: string | null = null;
    let recipientName: string | null = null;

    if (query.recipientName) {
      const match = await findRecipientMatch(query.recipientName, context.userId, supabase);
      if (match.matched) {
        recipientId = match.matched.id;
        recipientName = match.matched.name;
        actions.push({
          type: 'match_recipient',
          payload: { searchName: query.recipientName },
          result: { matched: recipientName, confidence: match.confidence },
        });
      }
    }

    // Fetch gifts — two separate paths to keep types clean
    let results: any[] | null = null;
    let error: any = null;

    if (recipientId) {
      const res = await supabase
        .from('gift_recipients')
        .select('gifts(id, name, current_price, status, category), recipients(name)')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .limit(10);
      results = res.data;
      error = res.error;
    } else {
      let q = supabase
        .from('gifts')
        .select('id, name, current_price, status, category')
        .eq('user_id', context.userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (query.status) q = q.eq('status', query.status);
      if (query.category) q = q.ilike('category', `%${query.category}%`);

      const res = await q;
      results = res.data;
      error = res.error;
    }

    if (error || !results || results.length === 0) {
      const target = recipientName ? ` for ${recipientName}` : '';
      return {
        reply: `No gifts found${target}. Text a gift idea to get started!`,
        actions,
        persona: context.persona,
        confidence: intent.confidence,
        agentPath: [this.name],
      };
    }

    // Format results
    const reply = this.formatResults(results, recipientName, context.persona);

    return {
      reply,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private async parseQuery(message: string): Promise<{
    recipientName: string | null;
    status: string | null;
    category: string | null;
  }> {
    try {
      const response = await callClaude(
        `Extract search parameters from this gift lookup request.
Message: "${message}"

Return JSON only:
{"recipientName": "name or null", "status": "idea|purchased|wrapped|given or null", "category": "category or null"}`,
        { model: 'haiku', maxTokens: 100, temperature: 0, caller: 'LookupAgent.parseQuery' }
      );

      const match = response.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {
      // Fall through
    }

    return { recipientName: null, status: null, category: null };
  }

  private formatResults(results: any[], recipientName: string | null, persona: 'dash' | 'scout'): string {
    const gifts = results.map((r: any) => {
      const gift = r.gifts || r;
      const name = gift.name || 'Unnamed';
      const price = gift.current_price ? ` $${gift.current_price}` : '';
      const status = gift.status ? ` [${gift.status}]` : '';
      return `• ${name}${price}${status}`;
    });

    const header = recipientName ? `Gifts for ${recipientName}:` : 'Your saved gifts:';
    const count = results.length >= 10 ? '(showing last 10)' : `(${results.length})`;

    if (persona === 'scout') {
      return `${header} ${count}\n${gifts.join('\n')}\n\nView all at ${process.env.NEXT_PUBLIC_APP_URL || 'giftstash.app'}/gifts`;
    }

    return `${header} ${count}\n${gifts.join('\n')}`;
  }
}
