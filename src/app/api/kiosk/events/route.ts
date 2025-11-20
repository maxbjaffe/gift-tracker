/**
 * Kiosk API - Calendar Events
 * Fetches calendar events for kiosk display
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Use service role key for kiosk access (no cookies needed)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the kiosk token and get user_id from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('kiosk_token', token)
      .single();

    if (profileError || !profile) {
      console.error('[Kiosk API] Invalid token:', profileError);
      return NextResponse.json({ error: 'Invalid kiosk token' }, { status: 403 });
    }

    const userId = profile.id;

    // Build query for calendar events
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    // Apply date filters if provided
    if (start) {
      query = query.gte('start_time', start);
    }
    if (end) {
      query = query.lte('start_time', end);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error('[Kiosk API] Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
    }

    return NextResponse.json({
      events: events || [],
    });
  } catch (error) {
    console.error('[Kiosk API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
