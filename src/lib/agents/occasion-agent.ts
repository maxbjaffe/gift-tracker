import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class OccasionAgent extends BaseAgent {
  name = 'OccasionAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'occasion';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Fetch recipients with birthdays
    const { data: recipients } = await supabase
      .from('recipients')
      .select('id, name, birthday, relationship')
      .eq('user_id', context.userId)
      .not('birthday', 'is', null)
      .order('birthday', { ascending: true });

    if (!recipients || recipients.length === 0) {
      return {
        reply: "No birthdays saved yet. Add birthdays to your recipients in the app to track upcoming occasions!",
        actions,
        persona: context.persona,
        confidence: intent.confidence,
        agentPath: [this.name],
      };
    }

    // Calculate upcoming birthdays (next 90 days)
    const upcoming = this.getUpcoming(recipients, 90);

    // For each upcoming person, count their saved gifts
    const withGiftCounts = await Promise.all(
      upcoming.map(async (entry) => {
        const { count } = await supabase
          .from('gift_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', entry.id);

        return { ...entry, giftCount: count || 0 };
      })
    );

    if (withGiftCounts.length === 0) {
      return {
        reply: "No upcoming birthdays in the next 90 days. You're all set! 🎉",
        actions,
        persona: context.persona,
        confidence: intent.confidence,
        agentPath: [this.name],
      };
    }

    const reply = this.formatUpcoming(withGiftCounts, context.persona);

    return {
      reply,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private getUpcoming(
    recipients: any[],
    daysAhead: number
  ): { id: string; name: string; birthday: string; daysUntil: number; relationship: string | null }[] {
    const now = new Date();
    const results: { id: string; name: string; birthday: string; daysUntil: number; relationship: string | null }[] = [];

    for (const r of recipients) {
      if (!r.birthday) continue;

      const bday = new Date(r.birthday);
      // Set birthday to this year
      const nextBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());

      // If already passed this year, use next year
      if (nextBday < now) {
        nextBday.setFullYear(now.getFullYear() + 1);
      }

      const diff = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diff <= daysAhead) {
        results.push({
          id: r.id,
          name: r.name,
          birthday: r.birthday,
          daysUntil: diff,
          relationship: r.relationship,
        });
      }
    }

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  private formatUpcoming(
    entries: { name: string; daysUntil: number; giftCount: number; relationship: string | null }[],
    persona: 'dash' | 'scout'
  ): string {
    const lines = entries.map((e) => {
      const when = e.daysUntil === 0 ? 'TODAY!' : e.daysUntil === 1 ? 'tomorrow' : `in ${e.daysUntil} days`;
      const gifts = e.giftCount > 0 ? ` (${e.giftCount} gift${e.giftCount > 1 ? 's' : ''} saved)` : ' (no gifts yet!)';
      return `• ${e.name} — ${when}${gifts}`;
    });

    if (persona === 'scout') {
      const urgentCount = entries.filter((e) => e.daysUntil <= 7).length;
      const header = urgentCount > 0
        ? `🎂 ${urgentCount} birthday${urgentCount > 1 ? 's' : ''} this week!\n`
        : '🎂 Upcoming birthdays:\n';
      return `${header}${lines.join('\n')}\n\nNeed suggestions? Text "ideas for [name]"`;
    }

    return `🎂 Coming up:\n${lines.join('\n')}`;
  }
}
