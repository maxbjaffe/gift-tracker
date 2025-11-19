/**
 * Calendar Events API
 * GET - Get events for a date range
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const sourceType = searchParams.get('source_type'); // Optional filter
    const category = searchParams.get('category'); // Optional filter

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start and end query parameters are required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        subscription:calendar_subscriptions(name, color)
      `)
      .eq('user_id', user.id)
      .eq('is_cancelled', false)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time');

    // Apply optional filters
    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({
        error: 'Failed to fetch events',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error in GET /api/calendar/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
