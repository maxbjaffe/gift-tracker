import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recipient data
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', recipientId)
      .eq('user_id', user.id)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Get existing gifts for this recipient to avoid duplicates
    const { data: existingGifts } = await supabase
      .from('gift_recipients')
      .select('gifts(*)')
      .eq('recipient_id', recipientId);

    const existingGiftsList = existingGifts?.map((gr: any) => gr.gifts?.name).filter(Boolean) || [];

    // Calculate average budget from existing gifts
    const giftsWithPrices = existingGifts
      ?.map((gr: any) => gr.gifts?.current_price)
      .filter((price): price is number => typeof price === 'number') || [];

    const averageBudget =
      giftsWithPrices.length > 0
        ? giftsWithPrices.reduce((sum, price) => sum + price, 0) / giftsWithPrices.length
        : 50; // Default to $50 if no price history

    // Build context for Claude
    const recipientContext = `
Recipient Information:
- Name: ${recipient.name}
- Relationship: ${recipient.relationship || 'Not specified'}
- Age Range: ${recipient.age_range || 'Not specified'}
- Birthday: ${recipient.birthday ? new Date(recipient.birthday).toLocaleDateString() : 'Not specified'}
- Interests: ${recipient.interests && recipient.interests.length > 0 ? recipient.interests.join(', ') : 'Not specified'}
- Notes: ${recipient.notes || 'None'}

Budget Guidance:
- Average price of previous gifts: $${averageBudget.toFixed(2)}
- Suggested price range: $${Math.max(10, averageBudget * 0.7).toFixed(0)} - $${(averageBudget * 1.3).toFixed(0)}

Gifts they already have (avoid duplicates):
${existingGiftsList.length > 0 ? existingGiftsList.map(name => `- ${name}`).join('\n') : '- None yet'}
`.trim();

    const prompt = `You are a thoughtful gift advisor. Based on the recipient information provided, suggest 5 unique and personalized gift ideas.

${recipientContext}

For each gift suggestion, provide:
1. Gift name (concise)
2. Description (1-2 sentences explaining what it is)
3. Estimated price (realistic, within the suggested range)
4. Why it's perfect (personalized reasoning based on recipient's interests, age, relationship)

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {
      "name": "Gift name",
      "description": "What it is and why it's special",
      "price": 45.99,
      "reasoning": "Why this gift is perfect for them based on their interests/age/relationship"
    }
  ]
}

Consider:
- Their age and what's age-appropriate
- Their stated interests and hobbies
- The relationship (gifts for parents differ from gifts for friends)
- Avoid anything too similar to what they already have
- Be creative but practical
- Stay within the suggested price range
`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    let suggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.error('Error parsing Claude response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recipient: {
        id: recipient.id,
        name: recipient.name,
      },
      suggestions: suggestions.suggestions || [],
    });
  } catch (error) {
    logger.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
