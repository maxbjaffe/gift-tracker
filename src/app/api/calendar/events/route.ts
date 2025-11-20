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

    // Build query with deduplication
    // We'll dedupe by selecting distinct on (title, start_time) to avoid showing
    // the same event multiple times from different calendar subscriptions
    let query = supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        description,
        location,
        start_time,
        end_time,
        all_day,
        category,
        color,
        source_type
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

    // Deduplicate events by title + start_time
    // Keep the first occurrence of each unique event
    const deduped = events?.reduce((acc: any[], event: any) => {
      const key = `${event.title}|${event.start_time}`;
      if (!acc.find((e: any) => `${e.title}|${e.start_time}` === key)) {
        acc.push(event);
      }
      return acc;
    }, []) || [];

    return NextResponse.json({ events: deduped });
  } catch (error) {
    console.error('Error in GET /api/calendar/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
