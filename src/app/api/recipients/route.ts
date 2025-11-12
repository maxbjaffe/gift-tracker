// src/app/api/recipients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/recipients - List all recipients for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: recipients, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(recipients || []);
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipients' },
      { status: 500 }
    );
  }
}

// POST /api/recipients - Create a new recipient
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      relationship,
      birthday,
      age_range,
      interests,
      hobbies,
      gift_preferences,
      favorite_colors,
      favorite_stores,
      favorite_brands,
      gift_dos,
      gift_donts,
      restrictions,
      wishlist_items,
      past_gifts_received,
      max_budget,
      notes,
    } = body;

    // Validate required fields
    if (!name || !relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    // Create the recipient with user_id
    const { data: recipient, error } = await supabase
      .from('recipients')
      .insert({
        user_id: user.id,
        name,
        relationship,
        birthday,
        age_range,
        interests,
        hobbies,
        gift_preferences,
        favorite_colors,
        favorite_stores,
        favorite_brands,
        gift_dos,
        gift_donts,
        restrictions,
        wishlist_items,
        past_gifts_received,
        max_budget,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      recipient,
    });
  } catch (error: any) {
    console.error('Error creating recipient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create recipient' },
      { status: 500 }
    );
  }
}