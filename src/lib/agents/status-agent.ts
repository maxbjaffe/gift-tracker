import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import { callClaude } from '../claude';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

const VALID_STATUSES = ['idea', 'purchased', 'wrapped', 'given'] as const;
type GiftStatus = (typeof VALID_STATUSES)[number];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class StatusAgent extends BaseAgent {
  name = 'StatusAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'status';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Parse what to update and to what status
    const parsed = await this.parseStatusUpdate(message);

    if (!parsed.giftName || !parsed.newStatus) {
      return {
        reply: 'What gift should I update? Try: "Mark the LEGO set as purchased" or "I bought the AirPods"',
        actions,
        persona: context.persona,
        confidence: 0.4,
        agentPath: [this.name],
      };
    }

    // Find the gift by fuzzy name search
    const { data: gifts } = await supabase
      .from('gifts')
      .select('id, name, status, current_price')
      .eq('user_id', context.userId)
      .ilike('name', `%${parsed.giftName}%`)
      .limit(5);

    if (!gifts || gifts.length === 0) {
      return {
        reply: `Couldn't find a gift matching "${parsed.giftName}". Check your gifts at ${process.env.NEXT_PUBLIC_APP_URL || 'giftstash.app'}/gifts`,
        actions,
        persona: context.persona,
        confidence: 0.5,
        agentPath: [this.name],
      };
    }

    // Use best match (first result)
    const gift = gifts[0];

    // Update status
    const { error } = await supabase
      .from('gifts')
      .update({ status: parsed.newStatus })
      .eq('id', gift.id);

    if (error) {
      return {
        reply: 'Something went wrong updating the status. Please try again.',
        actions,
        persona: context.persona,
        confidence: 0.5,
        agentPath: [this.name],
      };
    }

    actions.push({
      type: 'update_gift',
      payload: { giftId: gift.id, oldStatus: gift.status, newStatus: parsed.newStatus },
    });

    const emoji = { idea: '💡', purchased: '🛒', wrapped: '🎁', given: '✅' }[parsed.newStatus] || '✓';

    if (context.persona === 'scout') {
      return {
        reply: `${emoji} Updated "${gift.name}" from ${gift.status} → ${parsed.newStatus}. Nice progress!`,
        actions,
        persona: context.persona,
        confidence: intent.confidence,
        agentPath: [this.name],
      };
    }

    return {
      reply: `${emoji} ${gift.name} → ${parsed.newStatus}`,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private async parseStatusUpdate(message: string): Promise<{
    giftName: string | null;
    newStatus: GiftStatus | null;
  }> {
    try {
      const response = await callClaude(
        `Parse this gift status update request.
Message: "${message}"

Valid statuses: idea, purchased, wrapped, given
"bought" = purchased, "gave" = given

Return JSON only:
{"giftName": "name of the gift or null", "newStatus": "idea|purchased|wrapped|given or null"}`,
        { model: 'haiku', maxTokens: 80, temperature: 0, caller: 'StatusAgent.parse' }
      );

      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.newStatus && VALID_STATUSES.includes(parsed.newStatus)) {
          return parsed;
        }
      }
    } catch {
      // Fall through
    }

    return { giftName: null, newStatus: null };
  }
}
