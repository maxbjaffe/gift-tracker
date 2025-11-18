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

    // Fetch updated email with associations
    const { data: updatedEmail, error: fetchError } = await supabase
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
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch processed email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      email: updatedEmail,
    });
  } catch (error: any) {
    console.error('Error in POST /api/email/messages/[id]/process:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
