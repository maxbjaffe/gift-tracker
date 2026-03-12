import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class InventoryAgent extends BaseAgent {
  name = 'InventoryAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'inventory';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Fetch gifts that are purchased or wrapped (on-hand inventory)
    const { data: onHand } = await supabase
      .from('gifts')
      .select('id, name, current_price, status, category, gift_recipients(recipients(name))')
      .eq('user_id', context.userId)
      .in('status', ['purchased', 'wrapped'])
      .order('created_at', { ascending: false });

    if (!onHand || onHand.length === 0) {
      return {
        reply: "No gifts on hand right now. When you purchase or wrap a gift, update its status and it'll show up here!",
        actions,
        persona: context.persona,
        confidence: intent.confidence,
        agentPath: [this.name],
      };
    }

    // Group by status
    const purchased = onHand.filter((g) => g.status === 'purchased');
    const wrapped = onHand.filter((g) => g.status === 'wrapped');

    const reply = this.formatInventory(purchased, wrapped, context.persona);

    return {
      reply,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private formatInventory(
    purchased: any[],
    wrapped: any[],
    persona: 'dash' | 'scout'
  ): string {
    const total = purchased.length + wrapped.length;

    const formatGift = (g: any): string => {
      const recipients = g.gift_recipients
        ?.map((gr: any) => gr.recipients?.name)
        .filter(Boolean)
        .join(', ');
      const forWho = recipients ? ` → ${recipients}` : '';
      const price = g.current_price ? ` ($${g.current_price})` : '';
      return `• ${g.name}${price}${forWho}`;
    };

    const sections: string[] = [];

    if (wrapped.length > 0) {
      sections.push(`🎁 Wrapped (${wrapped.length}):\n${wrapped.map(formatGift).join('\n')}`);
    }

    if (purchased.length > 0) {
      sections.push(`🛒 Purchased (${purchased.length}):\n${purchased.map(formatGift).join('\n')}`);
    }

    if (persona === 'scout') {
      const totalValue = [...purchased, ...wrapped]
        .reduce((sum, g) => sum + (g.current_price || 0), 0);
      const valueText = totalValue > 0 ? ` ($${totalValue.toFixed(0)} total value)` : '';
      return `📦 Gift inventory: ${total} on hand${valueText}\n\n${sections.join('\n\n')}`;
    }

    return `📦 ${total} on hand\n${sections.join('\n')}`;
  }
}
