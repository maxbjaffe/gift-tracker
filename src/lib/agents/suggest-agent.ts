import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import { findRecipientMatch } from '../recipient-matcher';
import { callClaude } from '../claude';
import { getPersonaPrompt } from './personas';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class SuggestAgent extends BaseAgent {
  name = 'SuggestAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'suggest';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();

    // Extract recipient name from message
    const recipientName = await this.extractRecipientName(message);

    let recipientProfile: Record<string, unknown> | null = null;
    let pastGifts: string[] = [];

    if (recipientName) {
      const match = await findRecipientMatch(recipientName, context.userId, supabase);

      if (match.matched) {
        actions.push({
          type: 'match_recipient',
          payload: { searchName: recipientName },
          result: { matched: match.matched.name, confidence: match.confidence },
        });

        // Fetch full recipient profile
        const { data: recipient } = await supabase
          .from('recipients')
          .select('*')
          .eq('id', match.matched.id)
          .single();

        if (recipient) {
          recipientProfile = {
            name: recipient.name,
            relationship: recipient.relationship,
            age_range: recipient.age_range,
            gender: recipient.gender,
            interests: recipient.interests,
            hobbies: recipient.hobbies,
            favorite_colors: recipient.favorite_colors,
            favorite_brands: recipient.favorite_brands,
            gift_preferences: recipient.gift_preferences,
            gift_donts: recipient.gift_donts,
            restrictions: recipient.restrictions,
            max_budget: recipient.max_budget,
          };
        }

        // Fetch past gifts to avoid duplicates
        const { data: gifts } = await supabase
          .from('gift_recipients')
          .select('gifts(name, category, current_price)')
          .eq('recipient_id', match.matched.id)
          .limit(20);

        if (gifts) {
          pastGifts = gifts
            .map((g: any) => g.gifts?.name)
            .filter(Boolean);
        }
      }
    }

    // Generate suggestions via Claude
    const suggestions = await this.generateSuggestions(
      message,
      recipientProfile,
      pastGifts,
      context.persona
    );

    return {
      reply: suggestions,
      actions,
      persona: context.persona,
      followUp: 'capture', // Next message likely captures one of the suggestions
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private async extractRecipientName(message: string): Promise<string | null> {
    try {
      const response = await callClaude(
        `Extract the recipient name from this gift suggestion request. Return ONLY the name, or "null" if none mentioned.
Message: "${message}"`,
        { model: 'haiku', maxTokens: 30, temperature: 0, caller: 'SuggestAgent.extractName' }
      );

      const name = response.trim();
      return name === 'null' || name === '' ? null : name;
    } catch {
      return null;
    }
  }

  private async generateSuggestions(
    message: string,
    profile: Record<string, unknown> | null,
    pastGifts: string[],
    persona: 'dash' | 'scout'
  ): Promise<string> {
    const profileContext = profile
      ? `\nRecipient profile: ${JSON.stringify(profile, null, 0)}`
      : '\nNo profile data available.';

    const pastContext = pastGifts.length > 0
      ? `\nPast gifts (avoid duplicates): ${pastGifts.join(', ')}`
      : '';

    const personaInstruction = persona === 'scout'
      ? 'Give 3-4 thoughtful suggestions with brief explanations of why each fits. Be warm and conversational.'
      : 'Give 3 quick suggestions, one line each. Be concise.';

    try {
      return await callClaude(
        `You're a gift suggestion assistant. Based on the request and any available profile data, suggest gifts.

Request: "${message}"${profileContext}${pastContext}

${personaInstruction}
Keep total response under 300 characters (SMS-friendly). End with: "Text any of these to save it!"`,
        {
          model: 'haiku',
          maxTokens: 300,
          caller: 'SuggestAgent.generate',
          system: getPersonaPrompt(persona),
        }
      );
    } catch {
      return profile
        ? `I'd love to help with suggestions for ${(profile.name as string) || 'them'}, but hit a snag. Try again in a moment!`
        : "I'd love to help with suggestions, but hit a snag. Try again in a moment!";
    }
  }
}
