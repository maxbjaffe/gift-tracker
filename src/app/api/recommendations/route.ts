// src/app/api/recommendations/route.ts - FIXED VERSION

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    // Fetch recipient data from database
    const supabase = createClient();
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Build a detailed prompt based on recipient information
    const prompt = buildRecommendationPrompt(recipient);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response
    let recommendations = JSON.parse(textContent.text);

    // Extract price from price_range if estimated_price is missing
    recommendations = recommendations.map((rec: any) => {
      if (!rec.estimated_price && rec.price_range) {
        // Try to extract a number from price_range like "$50-$100"
        const match = rec.price_range.match(/\$?(\d+(?:\.\d{2})?)/);
        if (match && match[1]) {
          const min = parseFloat(match[1]);
          rec.estimated_price = min;
        }
      }
      return rec;
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

function buildRecommendationPrompt(recipient: any): string {
  const age = recipient.age_range || 'Not specified';
  const interests = recipient.interests || 'Not specified';
  const budget = recipient.max_budget ? `$${recipient.max_budget}` : 'No limit';
  const preferences = recipient.gift_preferences || 'None specified';
  const restrictions = recipient.restrictions || 'None';

  return `You are a gift recommendation expert. Generate 8-10 personalized gift ideas for this person:

RECIPIENT PROFILE:
- Name: ${recipient.name}
- Relationship: ${recipient.relationship}
- Age: ${age}
- Interests: ${interests}
- Budget: Up to ${budget}
- Gift Preferences: ${preferences}
- Restrictions: ${restrictions}

REQUIREMENTS:
1. Each gift should match their interests and age
2. Stay within the budget (or close to it)
3. Provide variety in price ranges (some cheaper, some more expensive)
4. Be specific and detailed in descriptions
5. Include practical information

CRITICAL: Return ONLY a valid JSON array with this exact structure. Do not include any markdown formatting, code blocks, or text outside the JSON:

[
  {
    "title": "Gift name",
    "description": "Detailed 2-3 sentence description",
    "price_range": "$XX-$YY or $XX",
    "reasoning": "Why this gift fits this person",
    "where_to_buy": "Store names (e.g., Amazon, Target, Walmart)",
    "category": "Category name"
  }
]

Return ONLY the JSON array. No other text.`;
}