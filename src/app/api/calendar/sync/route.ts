/**
 * Calendar Sync API
 * POST - Sync all calendars for the current user
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { syncAllUserCalendars } from '@/lib/calendar/syncService';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync all user's calendars
    const results = await syncAllUserCalendars(user.id);

    const totalAdded = results.reduce((sum, r) => sum + r.eventsAdded, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.eventsUpdated, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.eventsRemoved, 0);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      results,
      summary: {
        calendars: results.length,
        eventsAdded: totalAdded,
        eventsUpdated: totalUpdated,
        eventsRemoved: totalRemoved,
        failed: failed.length,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/calendar/sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
