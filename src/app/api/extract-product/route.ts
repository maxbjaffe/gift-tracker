import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract basic info from URL when fetch fails
function extractBasicInfoFromUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Determine store name from domain
    let store = null;
    if (hostname.includes('amazon')) store = 'Amazon';
    else if (hostname.includes('target')) store = 'Target';
    else if (hostname.includes('walmart')) store = 'Walmart';
    else if (hostname.includes('ebay')) store = 'eBay';
    else if (hostname.includes('etsy')) store = 'Etsy';
    else if (hostname.includes('bestbuy')) store = 'Best Buy';
    else {
      // Extract readable domain name
      const parts = hostname.split('.');
      store = parts[parts.length - 2]?.charAt(0).toUpperCase() + parts[parts.length - 2]?.slice(1);
    }

    return {
      name: 'Product from ' + store,
      store,
      url: url
    };
  } catch {
    return {
      name: 'Product',
      store: 'Unknown',
      url: url
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, productName, storeName } = await request.json();

    // If product name is provided, use AI to generate details
    if (productName && storeName) {
      console.log('Generating product details from name:', productName, 'at', storeName);

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a product information assistant. Based on the following product name and store, provide reasonable estimates and details about this product.

Product Name: ${productName}
Store: ${storeName}

Please return a JSON object with the following fields:
- name: Clean, properly formatted product name
- price: Estimated typical price range (use the midpoint as a numeric value, no currency symbols)
- store: Store name (cleaned up, e.g., "Amazon", "Target", "Walmart")
- brand: Most likely brand name if identifiable from the product name
- category: Product category (e.g., "Electronics", "Toys", "Clothing", "Home & Garden", "Beauty", "Books", "Sports", "Food & Beverage", "Jewelry", "Other")
- description: Brief 2-3 sentence product description based on what you know about this type of product

CRITICAL: Respond ONLY with a valid JSON object. Do not include any explanation, markdown formatting, or text outside the JSON object.

Example format:
{
  "name": "Product Name",
  "price": 99.99,
  "store": "Amazon",
  "brand": "Sony",
  "category": "Electronics",
  "description": "Brief description here"
}

If you cannot determine a field with confidence, set it to null. Make reasonable estimates based on typical products with similar names.`
          }
        ]
      });

      const extractedText = message.content[0].type === 'text' ? message.content[0].text : '';

      try {
        const cleanedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const productData = JSON.parse(cleanedText);

        return NextResponse.json({
          success: true,
          data: productData,
          source: 'ai_generated'
        });
      } catch (parseError) {
        console.error('Failed to parse AI response:', extractedText);
        return NextResponse.json(
          { error: 'Failed to generate product details from AI' },
          { status: 500 }
        );
      }
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL or product name is required' },
        { status: 400 }
      );
    }

    // Fetch the HTML content from the URL
    console.log('Fetching URL:', url);

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        }
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);

      // Return basic info extracted from URL
      const basicInfo = extractBasicInfoFromUrl(url);
      return NextResponse.json({
        success: true,
        partial: true,
        message: 'Could not access the product page directly. Please complete the details manually.',
        data: basicInfo
      });
    }

    if (!response.ok) {
      console.error(`Failed to fetch URL. Status: ${response.status}, URL: ${url}`);

      // Return basic info extracted from URL instead of failing completely
      const basicInfo = extractBasicInfoFromUrl(url);
      return NextResponse.json({
        success: true,
        partial: true,
        message: 'The website is blocking automated access. Please complete the product details manually.',
        data: basicInfo
      });
    }

    const html = await response.text();
    
    // Use Claude to extract product information
    console.log('Calling Claude API to extract product info...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
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