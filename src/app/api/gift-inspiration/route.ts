// API Route: Gift Inspiration Feed
// Generates trending and popular gift ideas for browsing

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { category, minPrice, maxPrice, ageRange, occasion, limit = 20 } = await request.json();

    // Build filter constraints
    const priceRangeText = minPrice !== null && maxPrice !== null
      ? `between $${minPrice} and $${maxPrice}`
      : minPrice !== null
      ? `$${minPrice} or more`
      : maxPrice !== null
      ? `$${maxPrice} or less`
      : null;

    // Build prompt for trending gift ideas
    const prompt = `You are a gift trends expert. Generate ${limit} trending, popular gift ideas that people are loving right now.

${category || priceRangeText || ageRange || occasion ? '**FILTERS:**' : ''}
${category ? `- Category: ONLY "${category}" gifts` : ''}
${priceRangeText ? `- Price Range: ONLY gifts that cost ${priceRangeText}` : ''}
${ageRange ? `- Age Range: Appropriate for ${ageRange}` : ''}
${occasion ? `- Occasion: Perfect for ${occasion}` : ''}

REQUIREMENTS:
- Mix of price points (unless filtered)
- Variety of categories (unless filtered)
- Currently trending and popular items
- Real, specific products (not generic categories)
- Include both classic favorites and new trending items
- Diverse selection to appeal to different tastes

For each gift, provide:
1. Specific product name
2. Engaging 1-2 sentence description
3. Estimated price range
4. Category
5. Age appropriateness
6. Best occasion for this gift
7. Keywords for image search (2-3 words, descriptive, like "wireless headphones black" or "lego architecture taj mahal")

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

[
  {
    "name": "Specific Gift Name",
    "description": "Engaging description here",
    "price_range": "$XX-$YY",
    "price_min": XX,
    "price_max": YY,
    "category": "Category Name",
    "age_range": "Age range like 18-25, 6-12, All Ages",
    "occasion": "Birthday/Holiday/Anniversary/etc",
    "image_keywords": "short descriptive keywords",
    "trending": true
  }
]`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
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

    // Parse JSON response
    let giftIdeas;
    try {
      const responseText = textContent.text;

      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      giftIdeas = JSON.parse(jsonStr);

      // Validate that we got an array
      if (!Array.isArray(giftIdeas)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', textContent.text);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Enhance with images from Unsplash
    const enhancedGifts = await Promise.all(giftIdeas.map(async (gift: any) => {
      try {
        const imageKeywords = gift.image_keywords || gift.name;
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageKeywords)}&per_page=1&orientation=squarish`,
          {
            headers: {
              'Authorization': 'Client-ID 9e0f4ca10c03e1b69cf570cf16be3af6b715559029bc6d46e50a3b89e0f28fd1'
            }
          }
        );

        if (unsplashResponse.ok) {
          const imageData = await unsplashResponse.json();
          if (imageData.results && imageData.results.length > 0) {
            gift.image_url = imageData.results[0].urls.regular;
            gift.image_thumb = imageData.results[0].urls.small;
          }
        }
      } catch (imageError) {
        console.error('Error fetching image:', imageError);
        // Continue without image
      }

      // Add shopping links
      gift.amazon_link = `https://www.amazon.com/s?k=${encodeURIComponent(gift.name)}`;
      gift.google_shopping_link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(gift.name)}`;

      return gift;
    }));

    return NextResponse.json({
      success: true,
      gifts: enhancedGifts,
    });

  } catch (error: any) {
    console.error('Error generating gift inspiration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate gift ideas' },
      { status: 500 }
    );
  }
}
