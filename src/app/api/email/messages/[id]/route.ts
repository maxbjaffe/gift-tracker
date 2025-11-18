/**
 * Email Message Detail API Routes
 * GET /api/email/messages/[id] - Get single email with full details
 * PATCH /api/email/messages/[id] - Update email (read status, starred, archived, manual overrides)
 * DELETE /api/email/messages/[id] - Delete email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    const { data: email, error } = await supabase
      .from('school_emails')
      .select(`
        *,
        attachments:email_attachments(*),
        actions:email_actions(*),
        child_relevance:email_child_relevance(
          *,
          child:children(*)
        ),
        event_associations:email_event_associations(
          *,
          event:calendar_events(*)
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error('Error in GET /api/email/messages/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const updates: any = {};

    // Only allow specific fields to be updated
    const allowedFields = [
      'is_read',
      'is_starred',
      'is_archived',
      'manual_category',
      'manual_priority',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: email, error } = await supabase
      .from('school_emails')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email:', error);
      return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error('Error in PATCH /api/email/messages/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const { error } = await supabase
      .from('school_emails')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting email:', error);
      return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/email/messages/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
