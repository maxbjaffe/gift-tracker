/**
 * Calendar Subscription Sync API
 * POST - Trigger sync for a specific subscription
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { syncCalendarSubscription } from '@/lib/calendar/syncService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('calendar_subscriptions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Trigger sync
    const result = await syncCalendarSubscription(params.id, user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error in POST /api/calendar/subscriptions/[id]/sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
