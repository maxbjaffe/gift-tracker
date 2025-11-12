// src/app/api/recipients/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/recipients/[id] - Get a single recipient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user (may be null in development with service role)
    const { data: { user } } = await supabase.auth.getUser();

    const { id } = params;

    // In development with service role, skip user_id filter
    let query = supabase
      .from('recipients')
      .select('*')
      .eq('id', id);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: recipient, error } = await query.single();

    if (error) throw error;

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipient);
  } catch (error: any) {
    console.error('Error fetching recipient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipient' },
      { status: 500 }
    );
  }
}

// PUT /api/recipients/[id] - Update a recipient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user (may be null in development with service role)
    const { data: { user } } = await supabase.auth.getUser();

    const { id } = params;
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

    // In development with service role, skip user_id filter
    let query = supabase
      .from('recipients')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: recipient, error } = await query.select().single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      recipient,
    });
  } catch (error: any) {
    console.error('Error updating recipient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update recipient' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipients/[id] - Delete a recipient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user (may be null in development with service role)
    const { data: { user } } = await supabase.auth.getUser();

    const { id } = params;

    // In development with service role, skip user_id filter
    let query = supabase
      .from('recipients')
      .delete()
      .eq('id', id);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Recipient deleted',
    });
  } catch (error: any) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete recipient' },
      { status: 500 }
    );
  }
}