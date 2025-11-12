// src/app/api/recipients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/recipients - List all recipients
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: recipients, error } = await supabase
      .from('recipients')
      .select('*')
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
    const supabase = createClient();
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

    // Validate required fields
    if (!name || !relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    // Create the recipient
    const { data: recipient, error } = await supabase
      .from('recipients')
      .insert({
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