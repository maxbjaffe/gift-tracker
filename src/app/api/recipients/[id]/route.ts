// src/app/api/recipients/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/recipients/[id] - Get a single recipient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    const { data: recipient, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', id)
      .single();

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
    const supabase = createClient();
    const { id } = params;
    const body = await request.json();

    const {
      name,
      relationship,
      birthday,
      age_range,
      interests,
      gift_preferences,
      favorite_stores,
      favorite_brands,
      restrictions,
      wishlist_items,
      max_budget,
      notes,
    } = body;

    const { data: recipient, error } = await supabase
      .from('recipients')
      .update({
        name,
        relationship,
        birthday,
        age_range,
        interests,
        gift_preferences,
        favorite_stores,
        favorite_brands,
        restrictions,
        wishlist_items,
        max_budget,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

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
    const supabase = createClient();
    const { id } = params;

    const { error } = await supabase
      .from('recipients')
      .delete()
      .eq('id', id);

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