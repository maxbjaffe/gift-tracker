import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyToken(token: string | null): Promise<string | null> {
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('kiosk_token', token)
    .single();

  return profile?.id || null;
}

/**
 * POST /api/kiosk/checklist/completions?token=xxx
 * Mark checklist item as complete
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { child_id, item_id } = body;

    if (!child_id || !item_id) {
      return NextResponse.json(
        { error: 'child_id and item_id required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('checklist_completions')
      .insert({
        user_id: userId,
        child_id,
        item_id,
        completion_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ completion: data });
  } catch (error) {
    console.error('Error creating completion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kiosk/checklist/completions?token=xxx&child_id=xxx&item_id=xxx
 * Uncheck checklist item
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const childId = request.nextUrl.searchParams.get('child_id');
    const itemId = request.nextUrl.searchParams.get('item_id');

    if (!childId || !itemId) {
      return NextResponse.json(
        { error: 'child_id and item_id required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('checklist_completions')
      .delete()
      .eq('child_id', childId)
      .eq('item_id', itemId)
      .eq('completion_date', today);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting completion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
