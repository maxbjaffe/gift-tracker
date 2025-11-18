/**
 * Email Filter API Routes
 * PATCH /api/email/filters/[id] - Update a filter
 * DELETE /api/email/filters/[id] - Delete a filter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filter_name, filter_config, is_active } = body;

    const updates: any = {};
    if (filter_name !== undefined) updates.filter_name = filter_name;
    if (filter_config !== undefined) updates.filter_config = filter_config;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update the filter
    const { error } = await supabase
      .from('email_filters')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating filter:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/email/filters/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the filter
    const { error } = await supabase
      .from('email_filters')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting filter:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/email/filters/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
