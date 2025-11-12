import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the HTML content from the URL
    console.log('Fetching URL:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Use Claude to extract product information
    console.log('Calling Claude API to extract product info...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a product information extraction assistant. Analyze the following HTML content from a product page and extract the key product details.

HTML Content (truncated to first 50000 characters):
${html.substring(0, 50000)}

Please extract and return a JSON object with the following fields:
- name: Product name/title
- price: Current price (numeric value only, no currency symbols)
- original_price: Original price if on sale (numeric value only)
- store: Store/retailer name (e.g., "Amazon", "Target", "Walmart")
- brand: Product brand name
- category: Product category (e.g., "Electronics", "Clothing", "Home & Garden")
- description: Brief product description (2-3 sentences max)
- image_url: Main product image URL (full URL, not relative path)

CRITICAL: Respond ONLY with a valid JSON object. Do not include any explanation, markdown formatting, or text outside the JSON object. The response must be parseable by JSON.parse().

Example format:
{
  "name": "Product Name",
  "price": 99.99,
  "original_price": 129.99,
  "store": "Amazon",
  "brand": "Sony",
  "category": "Electronics",
  "description": "Brief description here",
  "image_url": "https://example.com/image.jpg"
}

If you cannot find a particular field, set it to null. Ensure all string values are properly escaped for JSON.`
        }
      ]
    });

    const extractedText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parse the JSON response from Claude
    let productData;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      productData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', extractedText);
      throw new Error('Failed to parse product data from AI response');
    }

    console.log('Successfully extracted product data:', productData);

    return NextResponse.json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Error extracting product info:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to extract product information',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}