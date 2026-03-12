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

export class BudgetAgent extends BaseAgent {
  name = 'BudgetAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'budget';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Check if asking about a specific recipient
    const recipientName = await this.extractRecipientName(message);
    let recipientId: string | null = null;
    let matchedName: string | null = null;

    if (recipientName) {
      const match = await findRecipientMatch(recipientName, context.userId, supabase);
      if (match.matched) {
        recipientId = match.matched.id;
        matchedName = match.matched.name;
        actions.push({
          type: 'match_recipient',
          payload: { searchName: recipientName },
          result: { matched: matchedName },
        });
      }
    }

    // Fetch gifts with prices
    let query = supabase
      .from('gifts')
      .select('name, current_price, status, category, gift_recipients(recipient_id, recipients(name))')
      .eq('user_id', context.userId)
      .not('current_price', 'is', null);

    const { data: gifts } = await query;

    if (!gifts || gifts.length === 0) {
      return {
        reply: "No gifts with prices tracked yet. Add prices when you save gifts to track your budget!",
        actions,
        persona: context.persona,
        confidence: intent.confidence,
        agentPath: [this.name],
      };
    }

    // Filter to specific recipient if requested
    let filtered = gifts;
    if (recipientId) {
      filtered = gifts.filter((g: any) =>
        g.gift_recipients?.some((gr: any) => gr.recipient_id === recipientId)
      );
    }

    // Calculate totals
    const totals = this.calculateTotals(filtered);
    const reply = this.formatBudget(totals, matchedName, context.persona);

    return {
      reply,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private async extractRecipientName(message: string): Promise<string | null> {
    try {
      const response = await callClaude(
        `Extract the recipient name from this budget question. Return ONLY the name, or "null" if asking about overall spending.
Message: "${message}"`,
        { model: 'haiku', maxTokens: 30, temperature: 0, caller: 'BudgetAgent.extractName' }
      );
      const name = response.trim();
      return name === 'null' || name === '' ? null : name;
    } catch {
      return null;
    }
  }

  private calculateTotals(gifts: any[]): {
    total: number;
    byStatus: Record<string, { count: number; total: number }>;
    count: number;
  } {
    const byStatus: Record<string, { count: number; total: number }> = {};
    let total = 0;

    for (const gift of gifts) {
      const price = gift.current_price || 0;
      const status = gift.status || 'idea';
      total += price;

      if (!byStatus[status]) byStatus[status] = { count: 0, total: 0 };
      byStatus[status].count++;
      byStatus[status].total += price;
    }

    return { total, byStatus, count: gifts.length };
  }

  private formatBudget(
    totals: { total: number; byStatus: Record<string, { count: number; total: number }>; count: number },
    recipientName: string | null,
    persona: 'dash' | 'scout'
  ): string {
    const target = recipientName ? ` for ${recipientName}` : '';

    const statusLines = Object.entries(totals.byStatus)
      .map(([status, data]) => `${status}: ${data.count} ($${data.total.toFixed(0)})`)
      .join(', ');

    if (persona === 'scout') {
      return `Budget summary${target}:\n${totals.count} gifts totaling $${totals.total.toFixed(2)}\n${statusLines}`;
    }

    return `💰${target}: $${totals.total.toFixed(0)} across ${totals.count} gifts — ${statusLines}`;
  }
}
