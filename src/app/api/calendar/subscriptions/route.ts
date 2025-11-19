/**
 * Calendar Subscriptions API
 * GET - List all subscriptions
 * POST - Create new subscription
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { syncCalendarSubscription } from '@/lib/calendar/syncService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscriptions, error } = await supabase
      .from('calendar_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error in GET /api/calendar/subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, ical_url, color } = body;

    if (!name || !ical_url) {
      return NextResponse.json(
        { error: 'Name and iCal URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(ical_url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Create subscription
    const { data: subscription, error } = await supabase
      .from('calendar_subscriptions')
      .insert({
        user_id: user.id,
        name,
        description,
        ical_url,
        color: color || '#3b82f6',
        is_active: true,
        sync_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Trigger initial sync in the background (don't wait)
    syncCalendarSubscription(subscription.id, user.id).catch(err =>
      console.error('Background sync error:', err)
    );

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
