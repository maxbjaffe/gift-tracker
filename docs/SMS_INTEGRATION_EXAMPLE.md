# SMS Integration Example: Fuzzy Recipient Matching

## Overview

This guide shows exactly how to integrate the fuzzy recipient matching system into your SMS webhook for gift tracking.

---

## Current SMS Flow

```
User texts: "No iPad 3 days Emma"
    ↓
SMS Webhook (webhook/route.ts)
    ↓
Message Router (message-router.ts)
    ↓
Consequence Handler
    ↓
Response: "✅ Emma: No iPad for 3 days"
```

## New Gift Tracking Flow with Fuzzy Matching

```
User texts: "AirPods for Sarah"
    ↓
SMS Webhook (webhook/route.ts)
    ↓
Message Router (detects "for" keyword → gift intent)
    ↓
Gift Handler (gift-handler.ts) ← NEW FILE
    ↓
Claude AI: Extract gift details
    ↓
Fuzzy Recipient Matching ← YOUR NEW SYSTEM
    ↓
Response based on confidence level
```

---

## Step 1: Create Gift Handler

Create a new file: `src/lib/sms/gift-handler.ts`

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { findRecipientMatch } from '@/lib/recipient-matcher';  // ← THIS IS THE IMPORT
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Handle gift-related SMS messages
 * Example: "AirPods for Sarah"
 */
export async function handleGiftMessage(
  message: string,
  fromNumber: string,
  userId: string
): Promise<string> {
  try {
    // 1. Use Claude to extract gift details
    const extractedData = await extractGiftDetails(message);

    if (!extractedData.item) {
      return "I couldn't understand the gift. Try: 'AirPods for Sarah' or 'Lego set for Mom'";
    }

    // 2. Match recipient using fuzzy matching
    const supabase = await createServerSupabaseClient();

    // ← THIS IS WHERE YOU USE THE MATCHING SYSTEM
    const matchResult = await findRecipientMatch(
      extractedData.recipientName,
      userId,
      supabase
    );

    // 3. Handle based on confidence level
    if (matchResult.confidence === 'exact' || matchResult.confidence === 'high') {
      // AUTO-SAVE: High confidence match
      await saveGift({
        name: extractedData.item,
        description: extractedData.description,
        recipient_id: matchResult.matched!.id,
        user_id: userId,
        source: 'sms',
      });

      return `✅ Saved! ${extractedData.item} for ${matchResult.matched!.name}`;
    }

    else if (matchResult.confidence === 'medium') {
      // ASK FOR CONFIRMATION: Medium confidence
      // Store pending gift in context
      await storePendingGift(fromNumber, {
        item: extractedData.item,
        recipient: matchResult.matched!,
        confirmationNeeded: true,
      });

      return `${matchResult.confirmationMessage}\n\nReply Y to confirm or N to cancel.`;
    }

    else if (matchResult.matched === null) {
      // NO MATCH: Create new recipient
      const suggestions = matchResult.suggestions || [];

      if (suggestions.length > 0) {
        // Offer suggestions
        const suggestionText = suggestions
          .slice(0, 3)
          .map((s, i) => `${i + 1}. ${s.recipient.name}`)
          .join('\n');

        return `I don't know "${extractedData.recipientName}". Did you mean:\n\n${suggestionText}\n\nReply with the number, or reply NEW to create a new recipient.`;
      } else {
        // No suggestions - create new
        return `I don't know "${extractedData.recipientName}" yet. Reply Y to create a new recipient, or provide their full name.`;
      }
    }

    return 'Unable to process gift. Please try again.';
  } catch (error) {
    console.error('Error in gift handler:', error);
    return 'Sorry, an error occurred. Please try again.';
  }
}

/**
 * Extract gift details from SMS using Claude AI
 */
async function extractGiftDetails(message: string): Promise<{
  item: string;
  recipientName: string;
  description?: string;
  price?: number;
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Extract gift information from this message: "${message}"

Return JSON:
{
  "item": "gift item name",
  "recipientName": "recipient name (could be nickname, relationship like 'Mom', or full name)",
  "description": "optional description",
  "price": optional price number
}

Examples:
- "AirPods for Sarah" → {"item": "AirPods", "recipientName": "Sarah"}
- "Lego set for Mom" → {"item": "Lego set", "recipientName": "Mom"}
- "$50 Amazon gift card for Dad" → {"item": "Amazon gift card", "recipientName": "Dad", "price": 50}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { item: '', recipientName: '' };
}

/**
 * Save gift to database
 */
async function saveGift(data: {
  name: string;
  description?: string;
  recipient_id: string;
  user_id: string;
  source: string;
}): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from('gifts').insert({
    ...data,
    status: 'idea',
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error('Failed to save gift');
  }
}

/**
 * Store pending gift for confirmation flow
 */
async function storePendingGift(
  phoneNumber: string,
  giftData: any
): Promise<void> {
  // Store in sms_context or temporary storage
  // Implementation depends on your context system
}
```

---

## Step 2: Update Message Router

In `src/lib/sms/message-router.ts`:

### Add Gift Keywords

```typescript
// At top of file, add new keyword array
const GIFT_KEYWORDS = [
  'for',      // "AirPods for Sarah"
  'gift',     // "Gift idea: Lego for Emma"
  'buy',      // "Buy AirPods for Mom"
  'get',      // "Get Sarah a book"
  'present',  // "Present for Dad"
];
```

### Update MessageIntent Type

```typescript
export type MessageIntent =
  | 'consequence'
  | 'commitment'
  | 'query'
  | 'response'
  | 'unknown'
  | 'shortcut'
  | 'bulk'
  | 'gift';  // ← ADD THIS
```

### Add Gift Detection in detectMessageIntent()

```typescript
export function detectMessageIntent(message: string): RouterResult {
  const normalized = message.toLowerCase().trim();

  // 1. Check for shortcuts first
  const shortcut = detectShortcut(message);
  if (shortcut) {
    return { intent: 'shortcut', confidence: 'high', message: normalized };
  }

  // 2. Check for gift keywords ← ADD THIS
  if (containsKeywords(normalized, GIFT_KEYWORDS)) {
    // Additional check: gifts usually have a recipient reference
    if (normalized.includes(' for ') || normalized.includes('gift')) {
      return {
        intent: 'gift',
        confidence: 'high',
        message: normalized,
      };
    }
  }

  // 3. Check for bulk operations...
  // ... rest of existing code
}
```

### Add Gift Case in routeMessage()

```typescript
export async function routeMessage(
  intent: MessageIntent,
  message: string,
  fromNumber: string,
  userId?: string
): Promise<string> {
  const context = await getSMSContext(fromNumber);

  // ... existing context handling

  switch (intent) {
    // ... existing cases

    case 'gift':  // ← ADD THIS CASE
      if (!userId) {
        return 'Please authenticate first by logging in through the app.';
      }

      // Import gift handler
      const { handleGiftMessage } = await import('./gift-handler');

      // Process gift with recipient matching
      const giftResponse = await handleGiftMessage(
        message,
        fromNumber,
        userId
      );

      // Save context
      await saveSMSContext(fromNumber, userId, message, 'gift', {}, null);

      return giftResponse;

    case 'consequence':
      // ... existing code
  }
}
```

---

## Step 3: Test the Integration

### Test Scenario 1: Exact Match

**SMS:** `"AirPods for Sarah"`

**Flow:**
1. Message Router detects "for" → gift intent
2. Claude extracts: `{item: "AirPods", recipientName: "Sarah"}`
3. Fuzzy Matcher finds exact match: Sarah Johnson
4. Auto-saves gift

**Response:** `"✅ Saved! AirPods for Sarah Johnson"`

---

### Test Scenario 2: Relationship Match

**SMS:** `"Lego set for Mom"`

**Flow:**
1. Message Router detects "for" → gift intent
2. Claude extracts: `{item: "Lego set", recipientName: "Mom"}`
3. Fuzzy Matcher finds relationship match: Linda Martinez (Mother)
4. Auto-saves gift

**Response:** `"✅ Saved! Lego set for Linda Martinez"`

---

### Test Scenario 3: Fuzzy Match with Typo

**SMS:** `"Book for Sarha"`  (typo: should be Sarah)

**Flow:**
1. Message Router detects "for" → gift intent
2. Claude extracts: `{item: "Book", recipientName: "Sarha"}`
3. Fuzzy Matcher finds medium confidence: Sarah Johnson (distance: 2)
4. Asks for confirmation

**Response:** `"Did you mean Sarah Johnson?\n\nReply Y to confirm or N to cancel."`

---

### Test Scenario 4: No Match

**SMS:** `"Watch for RandomPerson"`

**Flow:**
1. Message Router detects "for" → gift intent
2. Claude extracts: `{item: "Watch", recipientName: "RandomPerson"}`
3. Fuzzy Matcher finds no match
4. Offers to create new recipient

**Response:** `"I don't know 'RandomPerson' yet. Reply Y to create a new recipient, or provide their full name."`

---

## Step 4: Handle Confirmation Responses

When user replies "Y" or "N" to confirmation:

```typescript
// In response-handler.ts or gift-handler.ts

export async function handleGiftConfirmation(
  response: string,
  fromNumber: string,
  userId: string
): Promise<string> {
  // Load pending gift from context
  const context = await getSMSContext(fromNumber);
  const pendingGift = context?.pendingData?.gift;

  if (!pendingGift) {
    return "No pending gift confirmation.";
  }

  if (response.toLowerCase().includes('y')) {
    // User confirmed - save the gift
    await saveGift({
      name: pendingGift.item,
      recipient_id: pendingGift.recipient.id,
      user_id: userId,
      source: 'sms',
    });

    return `✅ Confirmed! ${pendingGift.item} for ${pendingGift.recipient.name}`;
  } else {
    // User declined
    return "Gift not saved. You can try again with a different name.";
  }
}
```

---

## Summary: What "Import findRecipientMatch" Means

**Before:**
```typescript
// Your SMS handler doesn't know about recipient matching
const gift = parseGift(message);
// No way to handle typos, nicknames, or relationships
```

**After:**
```typescript
// Import the fuzzy matching function
import { findRecipientMatch } from '@/lib/recipient-matcher';

// Use it in your gift handler
const matchResult = await findRecipientMatch(
  recipientName,  // "Sarah", "Mom", "Sarha" (typo)
  userId,
  supabase
);

// Now you can:
// - Match exact names
// - Match nicknames (Liz → Elizabeth)
// - Match relationships (Mom → Linda Martinez)
// - Handle typos (Sarha → Sarah Johnson)
// - Get suggestions when uncertain
```

---

## Key Integration Points

1. **Create** `src/lib/sms/gift-handler.ts` (handles gift logic)
2. **Update** `src/lib/sms/message-router.ts` (adds gift intent)
3. **Import** `findRecipientMatch` from your new matching system
4. **Call** `findRecipientMatch(recipientName, userId, supabase)`
5. **Handle** the `matchResult.confidence` levels appropriately

---

## Next Steps

1. Create the gift-handler.ts file (I can do this for you)
2. Update message-router.ts to add 'gift' intent
3. Test with SMS messages
4. Deploy to production

Would you like me to create the actual gift-handler.ts file for you?
