// src/app/api/feedback/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Helper function to extract price from price_range text like "$120-$160"
function extractPriceFromRange(priceRange: string | undefined | null): number | null {
  if (!priceRange) return null;
  
  // Remove dollar signs and extract first number
  const match = priceRange.match(/\$?(\d+(?:\.\d{2})?)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  return null;
}

// Helper function to extract store from where_to_buy text
function extractStoreFromText(whereText: string | undefined | null): string {
  if (!whereText) return 'Online';
  
  // Look for common retailer names
  const retailers = ['Amazon', 'Target', 'Walmart', 'Best Buy', 'LEGO', 'Costco', 'Home Depot', 'Best Buy'];
  const lowerText = whereText.toLowerCase();
  
  for (const retailer of retailers) {
    if (lowerText.includes(retailer.toLowerCase())) {
      return retailer;
    }
  }
  
  // Default to first word if no known retailer found
  const firstWord = whereText.split(',')[0].trim();
  return firstWord || 'Online';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      recipient_id,
      recommendation_name,
      recommendation_description,
      price_range,           // e.g. "$120-$160"
      where_to_buy,          // e.g. "LEGO Store, Amazon"
      image_url,
      amazon_link,
      google_shopping_link,
      feedback_type,
    } = body;

    // Validate required fields
    if (!recipient_id || !recommendation_name || !feedback_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If feedback type is "added", create a gift entry
    if (feedback_type === 'added') {
      // Extract price from price_range text
      const extractedPrice = extractPriceFromRange(price_range);
      
      // Extract store from where_to_buy text
      const extractedStore = extractStoreFromText(where_to_buy);

      // Create gift with image and shopping links
      const { data: giftCreated, error: giftError } = await supabase
        .from('gifts')
        .insert({
          name: recommendation_name,
          description: recommendation_description,
          current_price: extractedPrice,
          store: extractedStore,
          category: 'Gift Idea',
          status: 'idea',
          image_url: image_url || null,
          url: amazon_link || google_shopping_link || null,
          notes: amazon_link && google_shopping_link
            ? `Amazon: ${amazon_link}\nGoogle Shopping: ${google_shopping_link}`
            : null,
        } as any)
        .select()
        .single();

      if (giftError) {
        console.error('Error creating gift:', giftError);
        throw giftError;
      }

      // Link gift to the recipient
      const { error: linkError } = await supabase
        .from('gift_recipients')
        .insert({
          gift_id: (giftCreated as any).id,
          recipient_id: recipient_id,
        } as any);

      if (linkError) {
        console.error('Error linking gift to recipient:', linkError);
        throw linkError;
      }

      // Store the feedback
      const { error: feedbackError } = await supabase
        .from('recommendation_feedback')
        .insert({
          recipient_id,
          recommendation_name,
          recommendation_description,
          feedback_type,
        } as any);

      if (feedbackError) {
        console.error('Error storing feedback:', feedbackError);
        // Don't throw - feedback is nice to have but not critical
      }

      return NextResponse.json({
        success: true,
        message: 'Gift created and linked to recipient',
        gift_id: (giftCreated as any)?.id,
        debug: {
          price_range,
          extracted_price: extractedPrice,
          where_to_buy,
          extracted_store: extractedStore,
          image_url,
          amazon_link,
          google_shopping_link
        }
      });
    }

    // For other feedback types, just store the feedback
    const { error } = await supabase
      .from('recommendation_feedback')
      .insert({
        recipient_id,
        recommendation_name,
        recommendation_description,
        feedback_type,
      } as any);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback recorded' 
    });

  } catch (error: any) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve feedback for a recipient
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const recipient_id = searchParams.get('recipient_id');

    if (!recipient_id) {
      return NextResponse.json(
        { error: 'recipient_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('recommendation_feedback')
      .select('*')
      .eq('recipient_id', recipient_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ feedback: data });

  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}