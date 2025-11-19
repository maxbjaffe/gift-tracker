/**
 * Checklist Completions API
 * GET /api/accountability/checklist/completions - Get today's completions for a child
 * POST /api/accountability/checklist/completions - Mark item as complete
 * DELETE /api/accountability/checklist/completions - Uncheck item
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('child_id');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    let query = supabase
      .from('checklist_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completion_date', date);

    if (childId) {
      query = query.eq('child_id', childId);
    }

    const { data: completions, error } = await query;

    if (error) {
      console.error('Error fetching completions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ completions });
  } catch (error: any) {
    console.error('Error in GET /api/accountability/checklist/completions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { child_id, item_id } = body;

    if (!child_id || !item_id) {
      return NextResponse.json(
        { error: 'child_id and item_id are required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Upsert to handle duplicate clicks
    const { data: completion, error } = await supabase
      .from('checklist_completions')
      .upsert({
        user_id: user.id,
        child_id,
        item_id,
        completion_date: today,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'child_id,item_id,completion_date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating completion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ completion });
  } catch (error: any) {
    console.error('Error in POST /api/accountability/checklist/completions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('child_id');
    const itemId = searchParams.get('item_id');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!childId || !itemId) {
      return NextResponse.json(
        { error: 'child_id and item_id are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('checklist_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('child_id', childId)
      .eq('item_id', itemId)
      .eq('completion_date', date);

    if (error) {
      console.error('Error deleting completion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/accountability/checklist/completions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
