/**
 * SMS Gift Handler with Fuzzy Recipient Matching
 *
 * Handles gift-related SMS messages like:
 * - "AirPods for Sarah"
 * - "Lego set for Mom"
 * - "Buy book for Dad"
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { findRecipientMatch } from '@/lib/recipient-matcher';
import { getSMSContext, saveSMSContext } from './context-manager';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ExtractedGift {
  item: string;
  recipientName: string;
  description?: string;
  price?: number;
  url?: string;
}

interface PendingGift {
  item: string;
  description?: string;
  price?: number;
  url?: string;
  recipientId: string;
  recipientName: string;
  needsConfirmation: boolean;
}

/**
 * Main handler for gift-related SMS messages
 *
 * @param message - SMS message text
 * @param fromNumber - Sender's phone number
 * @param userId - User ID (from authentication)
 * @returns Response message to send back
 */
export async function handleGiftMessage(
  message: string,
  fromNumber: string,
  userId: string
): Promise<string> {
  try {
    console.log('[Gift Handler] Processing gift message:', message);

    // 1. Extract gift details using Claude AI
    const extractedData = await extractGiftDetails(message);

    if (!extractedData.item || !extractedData.recipientName) {
      return (
        "I couldn't understand the gift. Try formatting like:\n\n" +
        "• 'AirPods for Sarah'\n" +
        "• 'Lego set for Mom'\n" +
        "• 'Buy book for Dad'"
      );
    }

    console.log('[Gift Handler] Extracted:', extractedData);

    // 2. Match recipient using fuzzy matching
    const supabase = await createServerSupabaseClient();
    const matchResult = await findRecipientMatch(
      extractedData.recipientName,
      userId,
      supabase
    );

    console.log('[Gift Handler] Match result:', {
      confidence: matchResult.confidence,
      matched: matchResult.matched?.name,
    });

    // 3. Handle based on confidence level
    if (matchResult.confidence === 'exact' || matchResult.confidence === 'high') {
      // HIGH CONFIDENCE: Auto-save the gift
      await saveGift(
        {
          name: extractedData.item,
          description: extractedData.description,
          current_price: extractedData.price,
          url: extractedData.url,
          recipient_id: matchResult.matched!.id,
          user_id: userId,
          source: 'sms',
          status: 'idea',
        },
        supabase
      );

      // Save context
      await saveSMSContext(fromNumber, userId, message, 'gift', {
        lastGiftAdded: extractedData.item,
        lastRecipient: matchResult.matched!.name,
      });

      return `✅ Saved! ${extractedData.item} for ${matchResult.matched!.name}`;
    } else if (matchResult.confidence === 'medium') {
      // MEDIUM CONFIDENCE: Ask for confirmation
      const pendingGift: PendingGift = {
        item: extractedData.item,
        description: extractedData.description,
        price: extractedData.price,
        url: extractedData.url,
        recipientId: matchResult.matched!.id,
        recipientName: matchResult.matched!.name,
        needsConfirmation: true,
      };

      // Store pending gift in context
      await saveSMSContext(fromNumber, userId, message, 'gift', {
        pendingGift,
        awaitingConfirmation: true,
      });

      return `${matchResult.confirmationMessage}\n\nReply Y to confirm or N to cancel.`;
    } else if (matchResult.matched === null) {
      // NO MATCH: Offer to create new recipient or show suggestions
      const suggestions = matchResult.suggestions || [];

      if (suggestions.length > 0) {
        // Show suggestions
        const suggestionText = suggestions
          .slice(0, 3)
          .map((s, i) => `${i + 1}. ${s.recipient.name}`)
          .join('\n');

        // Store for later selection
        await saveSMSContext(fromNumber, userId, message, 'gift', {
          pendingGift: {
            item: extractedData.item,
            description: extractedData.description,
            price: extractedData.price,
            url: extractedData.url,
          },
          suggestions: suggestions.slice(0, 3),
          awaitingSuggestionSelection: true,
        });

        return (
          `I don't know "${extractedData.recipientName}". Did you mean:\n\n` +
          `${suggestionText}\n\n` +
          `Reply with the number, or NEW to create a new recipient.`
        );
      } else {
        // No suggestions - offer to create new recipient
        await saveSMSContext(fromNumber, userId, message, 'gift', {
          pendingGift: {
            item: extractedData.item,
            description: extractedData.description,
            price: extractedData.price,
            url: extractedData.url,
          },
          newRecipientName: extractedData.recipientName,
          awaitingRecipientCreation: true,
        });

        return (
          `I don't know "${extractedData.recipientName}" yet.\n\n` +
          `Reply Y to create a new recipient, or provide their full name.`
        );
      }
    }

    return 'Unable to process gift. Please try again.';
  } catch (error) {
    console.error('[Gift Handler] Error:', error);
    return 'Sorry, an error occurred processing your gift. Please try again.';
  }
}

/**
 * Handle confirmation responses (Y/N) for pending gifts
 */
export async function handleGiftConfirmation(
  response: string,
  fromNumber: string,
  userId: string
): Promise<string> {
  try {
    const context = await getSMSContext(fromNumber);

    if (!context || !context.parsedData) {
      return 'No pending gift to confirm.';
    }

    const { pendingGift, awaitingConfirmation, suggestions, awaitingSuggestionSelection } =
      context.parsedData;

    // Handle suggestion selection (1, 2, 3, or NEW)
    if (awaitingSuggestionSelection && suggestions) {
      const normalized = response.trim().toUpperCase();

      if (normalized === 'NEW') {
        // User wants to create new recipient
        return (
          `Please provide the full name of the new recipient, or reply CANCEL to abort.`
        );
      }

      const selectedIndex = parseInt(normalized) - 1;
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        // User selected a suggestion
        const selectedRecipient = suggestions[selectedIndex].recipient;

        const supabase = await createServerSupabaseClient();
        await saveGift(
          {
            name: pendingGift.item,
            description: pendingGift.description,
            current_price: pendingGift.price,
            url: pendingGift.url,
            recipient_id: selectedRecipient.id,
            user_id: userId,
            source: 'sms',
            status: 'idea',
          },
          supabase
        );

        // Clear context
        await saveSMSContext(fromNumber, userId, response, 'response', {});

        return `✅ Saved! ${pendingGift.item} for ${selectedRecipient.name}`;
      }

      return 'Invalid selection. Reply with 1, 2, 3, or NEW.';
    }

    // Handle Y/N confirmation
    if (awaitingConfirmation && pendingGift) {
      const normalized = response.trim().toLowerCase();

      if (normalized === 'y' || normalized === 'yes') {
        // User confirmed - save the gift
        const supabase = await createServerSupabaseClient();
        await saveGift(
          {
            name: pendingGift.item,
            description: pendingGift.description,
            current_price: pendingGift.price,
            url: pendingGift.url,
            recipient_id: pendingGift.recipientId,
            user_id: userId,
            source: 'sms',
            status: 'idea',
          },
          supabase
        );

        // Clear context
        await saveSMSContext(fromNumber, userId, response, 'response', {});

        return `✅ Confirmed! ${pendingGift.item} for ${pendingGift.recipientName}`;
      } else if (normalized === 'n' || normalized === 'no') {
        // User declined
        await saveSMSContext(fromNumber, userId, response, 'response', {});
        return 'Gift not saved. You can try again with a different message.';
      }

      return 'Please reply Y to confirm or N to cancel.';
    }

    return 'No pending confirmation found.';
  } catch (error) {
    console.error('[Gift Confirmation] Error:', error);
    return 'Sorry, an error occurred. Please try again.';
  }
}

/**
 * Extract gift details from SMS using Claude AI
 */
async function extractGiftDetails(message: string): Promise<ExtractedGift> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract gift information from this SMS message: "${message}"

Return JSON with these fields:
{
  "item": "gift item name (required)",
  "recipientName": "recipient name - could be nickname (Liz), relationship (Mom), or full name (required)",
  "description": "optional brief description",
  "price": optional price as number,
  "url": "optional product URL"
}

Examples:
- "AirPods for Sarah" → {"item": "AirPods", "recipientName": "Sarah"}
- "Lego set for Mom" → {"item": "Lego set", "recipientName": "Mom"}
- "$50 Amazon gift card for Dad" → {"item": "Amazon gift card", "recipientName": "Dad", "price": 50}
- "Buy book for Liz" → {"item": "book", "recipientName": "Liz"}

Return only the JSON object, no other text.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        item: parsed.item || '',
        recipientName: parsed.recipientName || '',
        description: parsed.description,
        price: parsed.price,
        url: parsed.url,
      };
    }

    return { item: '', recipientName: '' };
  } catch (error) {
    console.error('[Extract Gift Details] Error:', error);
    return { item: '', recipientName: '' };
  }
}

/**
 * Save gift to database
 */
async function saveGift(
  data: {
    name: string;
    description?: string;
    current_price?: number;
    url?: string;
    recipient_id: string;
    user_id: string;
    source: string;
    status: string;
  },
  supabase: any
): Promise<void> {
  const { error } = await supabase.from('gifts').insert({
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Save Gift] Error:', error);
    throw new Error('Failed to save gift to database');
  }

  console.log('[Save Gift] Successfully saved:', data.name);
}

/**
 * Create new recipient
 */
async function createRecipient(
  name: string,
  userId: string,
  supabase: any
): Promise<string> {
  const { data, error } = await supabase
    .from('recipients')
    .insert({
      name,
      user_id: userId,
      metadata: {
        created_from: 'sms',
        first_mentioned: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[Create Recipient] Error:', error);
    throw new Error('Failed to create recipient');
  }

  console.log('[Create Recipient] Successfully created:', name);
  return data.id;
}
