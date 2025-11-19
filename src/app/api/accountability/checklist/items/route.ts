/**
 * Checklist Items API
 * GET /api/accountability/checklist/items - List items (optionally filtered by child_id)
 * POST /api/accountability/checklist/items - Create new item
 * PUT /api/accountability/checklist/items - Update item
 * DELETE /api/accountability/checklist/items - Delete item
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

    let query = supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (childId) {
      query = query.eq('child_id', childId);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching checklist items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error in GET /api/accountability/checklist/items:', error);
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
    const { child_id, title, description, icon, display_order, weekdays_only } = body;

    if (!child_id || !title) {
      return NextResponse.json(
        { error: 'child_id and title are required' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('checklist_items')
      .insert({
        user_id: user.id,
        child_id,
        title,
        description,
        icon,
        display_order: display_order ?? 0,
        weekdays_only: weekdays_only ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating checklist item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error('Error in POST /api/accountability/checklist/items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, icon, display_order, is_active, weekdays_only } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (display_order !== undefined) updates.display_order = display_order;
    if (is_active !== undefined) updates.is_active = is_active;
    if (weekdays_only !== undefined) updates.weekdays_only = weekdays_only;

    const { data: item, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating checklist item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error('Error in PUT /api/accountability/checklist/items:', error);
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting checklist item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/accountability/checklist/items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
