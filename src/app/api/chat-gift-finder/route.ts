// API Route: Conversational Gift Finder
// Provides natural language chat interface for finding gifts

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Check for API key at startup
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[chat-gift-finder] ANTHROPIC_API_KEY not configured');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI chat is not configured. Please add ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    const { messages, recipientId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get recipient context if provided
    let recipientContext = '';
    if (recipientId) {
      const supabase = await createServerSupabaseClient();
      const { data: recipient } = await supabase
        .from('recipients')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (recipient) {
        recipientContext = `\n\nRECIPIENT CONTEXT:
You are helping find gifts for: ${recipient.name}
- Relationship: ${recipient.relationship || 'Not specified'}
- Age Range: ${recipient.age_range || 'Not specified'}
- Gender: ${recipient.gender || 'Not specified'}
- Interests: ${recipient.interests?.join(', ') || 'Not specified'}
- Hobbies: ${recipient.hobbies?.join(', ') || 'Not specified'}
- Favorite Brands: ${recipient.favorite_brands?.join(', ') || 'Not specified'}
- Favorite Stores: ${recipient.favorite_stores?.join(', ') || 'Not specified'}
- Budget: ${recipient.max_budget ? `Up to $${recipient.max_budget}` : 'Not specified'}
- Gift Preferences: ${recipient.gift_preferences || 'None specified'}
- Restrictions: ${recipient.restrictions?.join(', ') || 'None'}

Use this information to provide highly personalized recommendations.`;
      }
    }

    // Build system prompt
    const systemPrompt = `You are an expert gift recommendation assistant with a friendly, conversational style. Your goal is to help users find the perfect gifts through natural conversation.

YOUR APPROACH:
1. Ask clarifying questions when needed (age, interests, budget, occasion)
2. Suggest 3-5 specific gift ideas with details
3. Be enthusiastic and helpful
4. Keep responses concise but informative
5. Include price ranges and where to buy

WHEN SUGGESTING GIFTS:
- Provide specific product names, not just categories
- Include estimated prices
- Mention where to buy (stores or online)
- Explain WHY each gift is a good match
- Offer variety (different price points, types)

FORMAT FOR GIFT SUGGESTIONS:
For each gift idea, use this structure:
🎁 **[Gift Name]** ($XX-$YY)
[2-3 sentence description explaining why it's perfect]
Where to buy: [Store names]
${recipientContext}

Keep the conversation natural and friendly. If the user provides vague info, ask 1-2 clarifying questions before suggesting gifts.`;

    // Call Claude API with conversation history
    const claudeMessages: Anthropic.MessageParam[] = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: claudeMessages,
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    return NextResponse.json({
      success: true,
      message: textContent.text,
    });

  } catch (error: any) {
    console.error('Error in chat gift finder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
