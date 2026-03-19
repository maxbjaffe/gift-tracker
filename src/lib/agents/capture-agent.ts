import { createClient } from '@supabase/supabase-js';
import { BaseAgent } from './base-agent';
import { callClaude } from '../claude';
import { findRecipientMatch } from '../recipient-matcher';
import { getPersonaPrompt } from './personas';
import { enrichGiftImages } from '../image-enrichment/enrichment-service';
import type { Intent, AgentResponse, ConversationContext, Action } from './types';

interface ParsedGift {
  recipient_names: string[];
  gift_name: string | null;
  price: number | null;
  category: string | null;
  url: string | null;
  notes: string | null;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class CaptureAgent extends BaseAgent {
  name = 'CaptureAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'capture';
  }

  async execute(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<AgentResponse> {
    const actions: Action[] = [];
    const supabase = getSupabase();
    const hasImages = (context.images?.length ?? 0) > 0;

    // 1. Extract gift details via Claude
    const parsed = await this.extractGift(message, context);

    if (!parsed.gift_name) {
      return {
        reply: hasImages
          ? "I see the image but couldn't identify the gift. Try adding a description like: \"LEGO set for Mom\""
          : "I couldn't extract a clear gift idea. Try: \"AirPods Pro for Sarah - $249\"",
        actions,
        persona: context.persona,
        confidence: 0.3,
        agentPath: [this.name],
      };
    }

    // 2. Match recipients using fuzzy matcher
    const matchedRecipients: { id: string; name: string }[] = [];
    const unmatchedNames: string[] = [];

    for (const name of parsed.recipient_names) {
      const match = await findRecipientMatch(name, context.userId, supabase);
      actions.push({
        type: 'match_recipient',
        payload: { searchName: name },
        result: {
          matched: match.matched?.name ?? null,
          confidence: match.confidence,
          method: match.matchMethod,
        },
      });

      if (match.matched && (match.confidence === 'exact' || match.confidence === 'high')) {
        matchedRecipients.push({ id: match.matched.id, name: match.matched.name });
      } else {
        unmatchedNames.push(name);
      }
    }

    // 3. Upload images to Supabase Storage
    let imageUrl: string | null = null;
    if (context.images?.length) {
      try {
        const img = context.images[0];
        const ext = img.mediaType?.split('/')[1] || 'jpg';
        const filename = `sms-gifts/${context.userId}/${Date.now()}-0.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('gift-images')
          .upload(filename, Buffer.from(img.base64, 'base64'), {
            contentType: img.mediaType || 'image/jpeg',
            upsert: false,
          });

        if (!uploadErr) {
          const { data: publicUrl } = supabase.storage
            .from('gift-images')
            .getPublicUrl(filename);
          imageUrl = publicUrl.publicUrl;
        }
      } catch {
        // Non-critical — continue without image
      }
    }

    // 4. Create gift in DB
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .insert({
        user_id: context.userId,
        name: parsed.gift_name,
        description: parsed.notes || '',
        current_price: parsed.price,
        category: parsed.category,
        url: parsed.url,
        image_url: imageUrl,
        status: 'idea',
        source: 'sms',
        source_metadata: {
          original_sms: message,
          parsed_data: parsed,
          has_images: hasImages,
          agent: this.name,
        },
      })
      .select()
      .single();

    if (giftError || !gift) {
      return {
        reply: 'Something went wrong saving your gift. Please try again.',
        actions,
        persona: context.persona,
        confidence: 0.5,
        agentPath: [this.name],
      };
    }

    actions.push({
      type: 'create_gift',
      payload: { giftId: gift.id, name: parsed.gift_name },
    });

    // Fire-and-forget image enrichment
    if (parsed.url || parsed.gift_name) {
      enrichGiftImages(gift.id, parsed.url || null, parsed.gift_name || null).catch(() => {});
    }

    // 5. Link matched recipients
    if (matchedRecipients.length > 0) {
      const associations = matchedRecipients.map((r) => ({
        gift_id: gift.id,
        recipient_id: r.id,
      }));
      await supabase.from('gift_recipients').insert(associations);
    }

    // 6. Build persona-shaped confirmation
    const reply = this.buildConfirmation(
      parsed,
      matchedRecipients,
      unmatchedNames,
      imageUrl !== null,
      context.persona
    );

    return {
      reply,
      actions,
      persona: context.persona,
      confidence: intent.confidence,
      agentPath: [this.name],
    };
  }

  private async extractGift(
    message: string,
    context: ConversationContext
  ): Promise<ParsedGift> {
    const hasImages = (context.images?.length ?? 0) > 0;

    // Include conversation history for context (last 3 messages)
    const historyContext = context.history.length > 0
      ? '\n\nRecent conversation:\n' +
        context.history
          .slice(-3)
          .map((m) => `${m.role}: ${m.content}`)
          .join('\n')
      : '';

    const prompt = hasImages
      ? `Analyze the image(s) and text message to extract gift information.

SMS Message: "${message || '(no text - analyze image only)'}"${historyContext}

Extract:
- recipient_names: Who is this gift for? Array of name strings. Return [] if unclear.
- gift_name: Product/gift name from the image or text
- price: Price as a number (no currency symbols), or null
- category: Electronics, Books, Toys, Fashion, Home, Sports, Beauty, Food, Games, Art, or Other
- url: Any product URL, or null
- notes: Description from image + any additional context

Respond ONLY with valid JSON:
{"recipient_names":[],"gift_name":null,"price":null,"category":null,"url":null,"notes":null}`
      : `Parse this SMS and extract gift information.

SMS Message: "${message}"${historyContext}

Extract:
- recipient_names: Who is this for? Array of name strings. Return [] if none mentioned.
- gift_name: What is the gift?
- price: Price as number, or null
- category: Electronics, Books, Toys, Fashion, Home, Sports, Beauty, Food, Games, Art, or Other
- url: Any product URL, or null
- notes: Additional context, or null

Respond ONLY with valid JSON:
{"recipient_names":[],"gift_name":null,"price":null,"category":null,"url":null,"notes":null}`;

    const images = hasImages
      ? context.images!.map((img) => ({
          base64: img.base64,
          mediaType: img.mediaType || 'image/jpeg',
        }))
      : undefined;

    try {
      const response = await callClaude(prompt, {
        model: hasImages ? 'sonnet' : 'haiku',
        maxTokens: 500,
        caller: 'CaptureAgent.extractGift',
        images,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ParsedGift;
      }
    } catch (err) {
      console.error('[CaptureAgent] Extraction failed:', err);
    }

    // Fallback
    return {
      recipient_names: [],
      gift_name: null,
      price: null,
      category: null,
      url: null,
      notes: message,
    };
  }

  private buildConfirmation(
    parsed: ParsedGift,
    matched: { id: string; name: string }[],
    unmatched: string[],
    hasImage: boolean,
    persona: 'dash' | 'scout'
  ): string {
    const price = parsed.price ? ` ($${parsed.price})` : '';
    const img = hasImage ? ' + photo' : '';

    if (persona === 'scout') {
      let reply = `Saved "${parsed.gift_name}"${price}${img}`;
      if (matched.length > 0) {
        const names = matched.map((r) => r.name).join(' & ');
        reply += ` for ${names}`;
      }
      if (unmatched.length > 0) {
        reply += ` (couldn't find: ${unmatched.join(', ')} — you can assign in the app)`;
      }
      reply += `. View at ${process.env.NEXT_PUBLIC_APP_URL || 'giftstash.app'}/gifts`;
      return reply;
    }

    // Dash: ultra-concise
    let reply = `✓ ${parsed.gift_name}${price}`;
    if (matched.length > 0) {
      reply += ` → ${matched.map((r) => r.name).join(', ')}`;
    }
    if (unmatched.length > 0) {
      reply += ` (${unmatched.join(', ')} not found)`;
    }
    if (hasImage) reply += ' 📷';
    return reply;
  }
}
