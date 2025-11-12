// src/app/api/gifts/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/gifts - List all gifts for the authenticated user or filter by recipient
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user (may be null in development with service role)
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const recipient_id = searchParams.get('recipient_id');

    if (recipient_id) {
      // Get gifts for a specific recipient
      const { data: giftRecipients, error: linkError } = await supabase
        .from('gift_recipients')
        .select('gift_id')
        .eq('recipient_id', recipient_id);

      if (linkError) throw linkError;

      if (!giftRecipients || giftRecipients.length === 0) {
        return NextResponse.json([]);
      }

      const giftIds = giftRecipients.map(gr => gr.gift_id);

      // In development with service role, skip user_id filter
      let query = supabase
        .from('gifts')
        .select('*')
        .in('id', giftIds)
        .order('created_at', { ascending: false });

      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data: gifts, error: giftsError } = await query;

      if (giftsError) throw giftsError;

      return NextResponse.json(gifts || []);
    } else {
      // Get all gifts for the authenticated user
      let query = supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data: gifts, error } = await query;

      if (error) throw error;

      return NextResponse.json(gifts || []);
    }
  } catch (error: any) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gifts' },
      { status: 500 }
    );
  }
}

// POST /api/gifts - Create a new gift
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user (may be null in development with service role)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();

    const {
      name,
      url,
      current_price,
      original_price,
      store,
      brand,
      category,
      description,
      image_url,
      status,
      purchase_date,
      occasion,
      occasion_date,
      notes,
      recipient_ids, // Array of recipient IDs to link to
      user_id, // May be passed explicitly for development
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Gift name is required' },
        { status: 400 }
      );
    }

    // Use authenticated user's ID, or fallback to provided user_id, or null for dev
    const effectiveUserId = user?.id || user_id || null;

    // Create the gift with user_id
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .insert({
        user_id: effectiveUserId,
        name,
        url,
        current_price,
        original_price,
        store,
        brand,
        category,
        description,
        image_url,
        status: status || 'idea',
        purchase_date,
        occasion,
        occasion_date,
        notes,
      })
      .select()
      .single();

    if (giftError) throw giftError;

    // Link to recipients if provided
    if (recipient_ids && recipient_ids.length > 0) {
      const links = recipient_ids.map((recipient_id: string) => ({
        gift_id: gift.id,
        recipient_id,
      }));

      const { error: linkError } = await supabase
        .from('gift_recipients')
        .insert(links);

      if (linkError) {
        console.error('Error linking gift to recipients:', linkError);
        // Don't throw - gift is already created
      }
    }

    return NextResponse.json({
      success: true,
      gift,
    });
  } catch (error: any) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create gift' },
      { status: 500 }
    );
  }
}