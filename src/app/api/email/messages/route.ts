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
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - simplified to avoid RLS conflicts
    let query = supabase
      .from('school_emails')
      .select(`
        *,
        email_attachments(id),
        email_actions(id),
        email_child_relevance(
          id,
          child_id,
          relevance_type,
          is_verified,
          is_rejected
        ),
        email_event_associations(
          id,
          calendar_event_id
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
      return NextResponse.json({ error: 'Failed to fetch emails', details: error.message }, { status: 500 });
    }

    // Enrich emails with child and event data
    let enrichedEmails = emails;
    if (emails && emails.length > 0) {
      try {
      // Get all unique child IDs
      const childIds = [...new Set(
        emails.flatMap((email: any) =>
          email.email_child_relevance?.map((rel: any) => rel.child_id) || []
        )
      )];

      // Get all unique event IDs
      const eventIds = [...new Set(
        emails.flatMap((email: any) =>
          email.email_event_associations?.map((assoc: any) => assoc.calendar_event_id) || []
        ).filter(Boolean)
      )];

      // Fetch children data
      let childrenMap = new Map();
      if (childIds.length > 0) {
        const { data: children, error: childrenError } = await supabase
          .from('children')
          .select('id, name, avatar_type, avatar_data, avatar_background')
          .in('id', childIds)
          .eq('user_id', user.id);

        if (childrenError) {
          console.error('Error fetching children:', childrenError);
        }

        if (children) {
          childrenMap = new Map(children.map(child => [child.id, child]));
        }
      }

      // Fetch events data
      let eventsMap = new Map();
      if (eventIds.length > 0) {
        const { data: events, error: eventsError } = await supabase
          .from('calendar_events')
          .select('id, title, start_time')
          .in('id', eventIds)
          .eq('user_id', user.id);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        }

        if (events) {
          eventsMap = new Map(events.map(event => [event.id, event]));
        }
      }

      // Enrich the emails
      enrichedEmails = emails.map((email: any) => ({
        ...email,
        attachments: email.email_attachments || [],
        actions: email.email_actions || [],
        child_relevance: (email.email_child_relevance || []).map((rel: any) => ({
          ...rel,
          child: childrenMap.get(rel.child_id) || null
        })),
        event_associations: (email.email_event_associations || []).map((assoc: any) => ({
          ...assoc,
          event: eventsMap.get(assoc.calendar_event_id) || null
        }))
      }));
      } catch (enrichError) {
        console.error('Error enriching emails:', enrichError);
        // Return emails without enrichment if enrichment fails
        enrichedEmails = emails.map((email: any) => ({
          ...email,
          attachments: email.email_attachments || [],
          actions: email.email_actions || [],
          child_relevance: email.email_child_relevance || [],
          event_associations: email.email_event_associations || []
        }));
      }
    }

    // Filter by child if specified (join filter)
    let filteredEmails = enrichedEmails;
    if (childId) {
      filteredEmails = enrichedEmails?.filter(email =>
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
