/**
 * Child Stats API
 * GET /api/children/[id]/stats - Get email statistics for a child
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

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get email count for this child
    const { count: emailCount } = await supabase
      .from('email_child_relevance')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', params.id);

    // Get unread count
    const { data: unreadEmails } = await supabase
      .from('email_child_relevance')
      .select(`
        email:school_emails!inner(id, is_read)
      `)
      .eq('child_id', params.id)
      .eq('email.is_read', false);

    // Get recent emails (last 5)
    const { data: recentEmails } = await supabase
      .from('email_child_relevance')
      .select(`
        email:school_emails(
          id,
          subject,
          from_name,
          from_address,
          received_at,
          ai_category,
          ai_priority,
          is_read
        )
      `)
      .eq('child_id', params.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      id: params.id,
      emailCount: emailCount || 0,
      unreadCount: unreadEmails?.length || 0,
      recentEmails: recentEmails?.map(r => r.email).filter(Boolean) || [],
    });
  } catch (error: any) {
    console.error('Error in GET /api/children/[id]/stats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
