// src/app/api/recommendations/route.ts - FIXED VERSION

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { recipientId, category, minPrice, maxPrice } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    // Fetch recipient data from database
    const supabase = await createServerSupabaseClient();
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

    // Build a detailed prompt based on recipient information and filters
    const prompt = buildRecommendationPrompt(recipient, category, minPrice, maxPrice);

    // Call Claude API
    // Use Claude 3 Haiku (fast and cost-effective)
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
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

    // Parse the JSON response with robust extraction
    let recommendations;
    try {
      const responseText = textContent.text;

      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      recommendations = JSON.parse(jsonStr);

      // Validate that we got an array
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', textContent.text);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response. The AI may have returned an invalid format.',
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
          rawResponse: textContent.text.substring(0, 500) // First 500 chars for debugging
        },
        { status: 500 }
      );
    }

    // Enhance recommendations with images and shopping links
    recommendations = await Promise.all(recommendations.map(async (rec: any) => {
      // Extract price from price_range if estimated_price is missing
      if (!rec.estimated_price && rec.price_range) {
        const match = rec.price_range.match(/\$?(\d+(?:\.\d{2})?)/);
        if (match && match[1]) {
          const min = parseFloat(match[1]);
          rec.estimated_price = min;
        }
      }

      // Generate shopping links
      const searchQuery = rec.search_query || rec.title;
      rec.amazon_link = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;
      rec.google_shopping_link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(searchQuery)}`;

      // Fetch product image from Unsplash
      try {
        const imageKeywords = rec.image_keywords || rec.category || rec.title;
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageKeywords)}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': 'Client-ID 9e0f4ca10c03e1b69cf570cf16be3af6b715559029bc6d46e50a3b89e0f28fd1'
            }
          }
        );

        if (unsplashResponse.ok) {
          const imageData = await unsplashResponse.json();
          if (imageData.results && imageData.results.length > 0) {
            rec.image_url = imageData.results[0].urls.regular;
            rec.image_thumb = imageData.results[0].urls.small;
          }
        }
      } catch (imageError) {
        console.error('Error fetching image:', imageError);
        // Image is optional, continue without it
      }

      return rec;
    }));

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);

    // Provide helpful error message if it's a model not found error
    if (error.status === 404 && error.message?.includes('model:')) {
      return NextResponse.json(
        {
          error: 'Claude API model not available',
          message: 'The AI model is not accessible with your API key. Please check your Anthropic API key has access to Claude 3.5 Sonnet, or update ANTHROPIC_API_KEY in your .env.local file.',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

function buildRecommendationPrompt(
  recipient: any,
  category?: string | null,
  minPrice?: number | null,
  maxPrice?: number | null
): string {
  const age = recipient.age_range || 'Not specified';
  const interests = recipient.interests || 'Not specified';
  const budget = recipient.max_budget ? `$${recipient.max_budget}` : 'No limit';
  const preferences = recipient.gift_preferences || 'None specified';
  const restrictions = recipient.restrictions || 'None';

  // Build price range text
  const priceRangeText = minPrice !== null && maxPrice !== null
    ? `between $${minPrice} and $${maxPrice}`
    : minPrice !== null
    ? `$${minPrice} or more`
    : maxPrice !== null
    ? `$${maxPrice} or less`
    : null;

  return `You are a gift recommendation expert. Generate 8-10 personalized gift ideas for this person:

RECIPIENT PROFILE:
- Name: ${recipient.name}
- Relationship: ${recipient.relationship}
- Age: ${age}
- Interests: ${interests}
- Budget: Up to ${budget}
- Gift Preferences: ${preferences}
- Restrictions: ${restrictions}

${category || priceRangeText ? '**MANDATORY FILTERS:**' : ''}
${category ? `- CATEGORY: ONLY suggest gifts in the "${category}" category. All suggestions MUST fit within this category.` : ''}
${priceRangeText ? `- PRICE RANGE: ONLY suggest gifts that cost ${priceRangeText}. All price ranges MUST fall within this constraint.` : ''}
${category || priceRangeText ? '- These filters are MANDATORY. Do not suggest anything outside these parameters.\n' : ''}

REQUIREMENTS:
1. Each gift should match their interests and age
2. Stay within the budget (or close to it)
${!priceRangeText ? '3. Provide variety in price ranges (some cheaper, some more expensive)' : '3. ALL gifts must be within the specified price range'}
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
    "category": "Category name",
    "search_query": "Specific product search term for Google/Amazon (e.g., 'LEGO Architecture Statue of Liberty 21042')",
    "image_keywords": "Short keyword for image search (e.g., 'lego architecture building', 'wireless headphones', 'coffee maker')"
  }
]

Return ONLY the JSON array. No other text.`;
}