/**
 * API Route - Commitments
 * Create and manage commitments
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { child_id, commitment_text, category, due_date, status } = body;

    // Validate required fields
    if (!child_id || !commitment_text || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields: child_id, commitment_text, due_date' },
        { status: 400 }
      );
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 });
    }

    // Create commitment
    const { data: commitment, error: createError } = await supabase
      .from('commitments')
      .insert({
        child_id,
        commitment_text,
        category: category || 'other',
        due_date,
        status: status || 'active',
        committed_by: user.id,
      })
      .select('*, child:children(*)')
      .single();

    if (createError) {
      console.error('Error creating commitment:', createError);
      return NextResponse.json(
        { error: 'Failed to create commitment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ commitment }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in commitments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('child_id');
    const status = searchParams.get('status');

    // Get user's children IDs
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('user_id', user.id);

    const childIds = children?.map(c => c.id) || [];

    if (childIds.length === 0) {
      return NextResponse.json({ commitments: [] });
    }

    // Build query
    let query = supabase
      .from('commitments')
      .select('*, child:children(*)')
      .in('child_id', childIds)
      .order('due_date', { ascending: true });

    if (childId) {
      query = query.eq('child_id', childId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: commitments, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching commitments:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch commitments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ commitments: commitments || [] });
  } catch (error) {
    console.error('Unexpected error in commitments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
