/**
 * Email AI Processing API Route
 * POST /api/email/messages/[id]/process - Process email with AI (analyze, categorize, extract)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIAssociationService } from '@/lib/email/associationService';

export async function POST(
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

    // Verify email belongs to user
    const { data: email, error: emailError } = await supabase
      .from('school_emails')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (emailError || !email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Process with AI
    await AIAssociationService.processEmail(params.id, user.id);

    // Fetch updated email without nested relations to avoid RLS conflicts
    const { data: updatedEmail, error: fetchError } = await supabase
      .from('school_emails')
      .select(`
        *,
        attachments:email_attachments(*),
        actions:email_actions(*),
        child_relevance:email_child_relevance(*),
        event_associations:email_event_associations(*)
      `)
      .eq('id', params.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch processed email' }, { status: 500 });
    }

    // Enrich with child and event data (client-side join to respect RLS)
    let enrichedEmail = updatedEmail;

    // Get unique child IDs
    const childIds = [...new Set(
      (updatedEmail.child_relevance as any)?.map((rel: any) => rel.child_id) || []
    )];

    // Get unique event IDs
    const eventIds = [...new Set(
      (updatedEmail.event_associations as any)?.map((assoc: any) => assoc.calendar_event_id).filter(Boolean) || []
    )];

    // Fetch children data
    let childrenMap = new Map();
    if (childIds.length > 0) {
      const { data: children } = await supabase
        .from('children')
        .select('*')
        .in('id', childIds)
        .eq('user_id', user.id);

      if (children) {
        childrenMap = new Map(children.map(child => [child.id, child]));
      }
    }

    // Fetch events data
    let eventsMap = new Map();
    if (eventIds.length > 0) {
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .in('id', eventIds)
        .eq('user_id', user.id);

      if (events) {
        eventsMap = new Map(events.map(event => [event.id, event]));
      }
    }

    // Enrich the email
    enrichedEmail = {
      ...updatedEmail,
      child_relevance: (updatedEmail.child_relevance as any)?.map((rel: any) => ({
        ...rel,
        child: childrenMap.get(rel.child_id) || null
      })) || [],
      event_associations: (updatedEmail.event_associations as any)?.map((assoc: any) => ({
        ...assoc,
        event: eventsMap.get(assoc.calendar_event_id) || null
      })) || []
    };

    return NextResponse.json({
      success: true,
      email: enrichedEmail,
    });
  } catch (error: any) {
    console.error('Error in POST /api/email/messages/[id]/process:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
