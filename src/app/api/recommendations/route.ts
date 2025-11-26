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

    // Get recommendation context (trending, successful gifts, etc.)
    const { recommendationAnalyticsService } = await import('@/lib/recommendation-analytics.service');
    const context = await recommendationAnalyticsService.getRecommendationContext(
      recipientId,
      recipient.age_range,
      recipient.interests,
      recipient.relationship,
      category // Use category as occasion if provided
    );

    // Build a detailed prompt based on recipient information and filters
    const prompt = buildRecommendationPrompt(recipient, context, category, minPrice, maxPrice);

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
    const { fetchProductImage } = await import('@/lib/imageService');

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

      // Fetch product image - try OpenGraph from Amazon link, fall back to enhanced placeholder
      try {
        const imageKeywords = rec.image_keywords || rec.category || rec.title;
        const imageResult = await fetchProductImage(
          imageKeywords,
          rec.title,
          rec.amazon_link // Pass Amazon link to try OpenGraph extraction
        );

        rec.image_url = imageResult.url;
        rec.image_thumb = imageResult.thumbnail;
        rec.image_source = imageResult.source; // Track if it's real or placeholder
      } catch (imageError) {
        console.error('Error fetching image:', imageError);
        // Fallback to enhanced placeholder
        const imageResult = await fetchProductImage(
          rec.category || 'gift',
          rec.title
        );
        rec.image_url = imageResult.url;
        rec.image_thumb = imageResult.thumbnail;
        rec.image_source = 'placeholder';
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
  context: any,
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

  // Format trending gifts for context
  const trendingText = context.trendingGifts.length > 0
    ? context.trendingGifts
        .slice(0, 8)
        .map((g: any) => `- ${g.gift_name}${g.gift_brand ? ` by ${g.gift_brand}` : ''}${g.gift_store ? ` (${g.gift_store})` : ''} - Added ${g.add_count} times`)
        .join('\n')
    : 'No trending data available yet';

  // Format successful gifts for similar people
  const successfulText = context.successfulGiftsForSimilar.length > 0
    ? context.successfulGiftsForSimilar
        .slice(0, 8)
        .map((g: any) => `- ${g.gift_name}${g.gift_brand ? ` by ${g.gift_brand}` : ''}${g.current_price ? ` ($${g.current_price})` : ''}`)
        .join('\n')
    : 'No data for similar recipients yet';

  // Format dismissed recommendations
  const dismissedText = context.dismissedRecommendations.length > 0
    ? context.dismissedRecommendations
        .map((d: any) => `- ${d.recommendation_name}`)
        .join('\n')
    : 'None';

  // Format popular brands
  const brandsText = context.popularBrands.length > 0
    ? context.popularBrands.join(', ')
    : 'No brand data yet';

  // Format popular stores
  const storesText = context.popularStores.length > 0
    ? context.popularStores.join(', ')
    : 'Amazon, Target, Best Buy, Walmart';

  return `You are an expert gift recommendation AI. Generate 8-10 personalized, SPECIFIC gift ideas using real-world data and trends.

====================
RECIPIENT PROFILE
====================
- Name: ${recipient.name}
- Relationship: ${recipient.relationship}
- Age: ${age}
- Interests: ${interests}
- Budget: Up to ${budget}
- Gift Preferences: ${preferences}
- Restrictions: ${restrictions}

====================
TRENDING GIFTS (What's popular right now)
====================
${trendingText}

====================
SUCCESSFUL GIFTS FOR SIMILAR PEOPLE
====================
These gifts worked well for people with similar profiles:
${successfulText}

====================
AVOID THESE (Previously dismissed)
====================
${dismissedText}

====================
POPULAR BRANDS & STORES
====================
- Popular Brands: ${brandsText}
- Popular Stores: ${storesText}

${category || priceRangeText ? '\n====================\n**MANDATORY FILTERS**\n====================' : ''}
${category ? `- CATEGORY: ONLY suggest gifts in the "${category}" category. All suggestions MUST fit within this category.` : ''}
${priceRangeText ? `- PRICE RANGE: ONLY suggest gifts that cost ${priceRangeText}. All price ranges MUST fall within this constraint.` : ''}
${category || priceRangeText ? '- These filters are MANDATORY. Do not suggest anything outside these parameters.\n' : ''}

====================
REQUIREMENTS
====================
1. Be SPECIFIC - Include real brand names and product names (e.g., "Sony WH-1000XM5 Headphones" not "wireless headphones")
2. Use trending data above - Prioritize items that are popular or worked for similar people
3. Match interests and age precisely
4. Stay within budget
5. Include specific store names where each item can be purchased
6. Provide variety in categories and price points (unless constrained by filters)
7. NEVER suggest items from the "AVOID THESE" list
8. Include popular brands when relevant

====================
OUTPUT FORMAT
====================
Return ONLY a valid JSON array. No markdown, no code blocks, no other text:

[
  {
    "title": "Specific Product Name with Brand",
    "brand": "Brand Name",
    "description": "Detailed 2-3 sentence description explaining features and benefits",
    "price_range": "$XX-$YY or $XX",
    "reasoning": "Why this gift fits based on their interests and the data above",
    "where_to_buy": "Specific store names (e.g., Amazon, Target, Best Buy)",
    "category": "Category name",
    "search_query": "Exact product search term for Amazon (e.g., 'Sony WH-1000XM5 Wireless Headphones')",
    "image_keywords": "HIGHLY SPECIFIC keywords including brand, model, color (e.g., 'sony wh1000xm5 black wireless headphones', 'lego architecture statue liberty 21042')"
  }
]

Return ONLY the JSON array. No other text.`;
}