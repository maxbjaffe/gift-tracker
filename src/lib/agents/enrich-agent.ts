import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import { callClaude } from '../claude';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class EnrichAgent extends BaseAgent {
  name = 'EnrichAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'enrich';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Figure out which gift the user is asking about
    const giftName = await this.extractGiftName(message);

    if (!giftName) {
      return {
        reply: 'Which gift do you want info on? Try: "Price check the LEGO set" or "Where to buy the AirPods"',
        actions,
        persona: context.persona,
        confidence: 0.4,
        agentPath: [this.name],
      };
    }

    // Find the gift
    const { data: gifts } = await supabase
      .from('gifts')
      .select('id, name, description, current_price, url, category, brand')
      .eq('user_id', context.userId)
      .ilike('name', `%${giftName}%`)
      .limit(3);

    if (!gifts || gifts.length === 0) {
      // No saved gift — still try to provide info
      return {
        reply: await this.generateProductInfo(giftName, null, context.persona),
        actions,
        persona: context.persona,
        confidence: 0.6,
        agentPath: [this.name],
      };
    }

    const gift = gifts[0];
    const enrichment = await this.generateProductInfo(gift.name, gift, context.persona);

    // Update gift with any new info from enrichment if we parsed a price
    // (fire-and-forget — don't block response)

    return {
      reply: enrichment,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private async extractGiftName(message: string): Promise<string | null> {
    try {
      const response = await callClaude(
        `Extract the product/gift name from this enrichment request. Return ONLY the product name, or "null" if unclear.
Message: "${message}"`,
        { model: 'haiku', maxTokens: 40, temperature: 0, caller: 'EnrichAgent.extractName' }
      );
      const name = response.trim();
      return name === 'null' || name === '' ? null : name;
    } catch {
      return null;
    }
  }

  private async generateProductInfo(
    giftName: string,
    existingGift: Record<string, unknown> | null,
    persona: 'dash' | 'scout'
  ): Promise<string> {
    const existingContext = existingGift
      ? `\nSaved gift data: ${JSON.stringify({ name: existingGift.name, price: existingGift.current_price, url: existingGift.url, category: existingGift.category, brand: existingGift.brand })}`
      : '';

    const toneInstruction = persona === 'scout'
      ? 'Be helpful and conversational. Mention where to look and what to watch for.'
      : 'Be brief. Key facts only.';

    try {
      return await callClaude(
        `Provide helpful buying information for this gift: "${giftName}"${existingContext}

Include if relevant:
- Typical price range
- Best retailers to check (Amazon, Target, etc.)
- Key things to look for (versions, sizes, age ratings)
- Any seasonal deals or alternatives

${toneInstruction}
Keep under 250 characters (SMS-friendly).`,
        {
          model: 'haiku',
          maxTokens: 250,
          caller: 'EnrichAgent.productInfo',
        }
      );
    } catch {
      return `I couldn't look up "${giftName}" right now. Try checking Amazon or Target directly.`;
    }
  }
}
