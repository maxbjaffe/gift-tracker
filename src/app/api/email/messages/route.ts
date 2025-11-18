/**
 * Email Messages API Routes
 * GET /api/email/messages - List/search emails with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const childId = searchParams.get('child_id');
    const accountId = searchParams.get('account_id');
    const isRead = searchParams.get('is_read');
    const isStarred = searchParams.get('is_starred');
    const isArchived = searchParams.get('is_archived');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('school_emails')
      .select(`
        *,
        attachments:email_attachments(count),
        actions:email_actions(count),
        child_relevance:email_child_relevance(
          id,
          child_id,
          relevance_type,
          child:children(id, name, avatar_color)
        ),
        event_associations:email_event_associations(
          id,
          event:calendar_events(id, title, start_date)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('ai_category', category);
    }

    if (priority) {
      query = query.eq('ai_priority', priority);
    }

    if (accountId) {
      query = query.eq('email_account_id', accountId);
    }

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    if (isStarred !== null) {
      query = query.eq('is_starred', isStarred === 'true');
    }

    if (isArchived !== null) {
      query = query.eq('is_archived', isArchived === 'true');
    }

    // Text search
    if (search) {
      query = query.or(`subject.ilike.%${search}%,body_text.ilike.%${search}%,from_address.ilike.%${search}%`);
    }

    const { data: emails, error, count } = await query;

    if (error) {
      console.error('Error fetching emails:', error);
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }

    // Filter by child if specified (join filter)
    let filteredEmails = emails;
    if (childId) {
      filteredEmails = emails?.filter(email =>
        email.child_relevance?.some((rel: any) => rel.child_id === childId)
      ) || [];
    }

    return NextResponse.json({
      emails: filteredEmails,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/email/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
