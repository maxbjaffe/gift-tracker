/**
 * Calendar Sync Cron Job
 * Syncs all calendar subscriptions hourly
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncAllCalendars } from '@/lib/calendar/syncService';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting calendar sync...');

    const results = await syncAllCalendars();

    const totalAdded = results.reduce((sum, r) => sum + r.eventsAdded, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.eventsUpdated, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.eventsRemoved, 0);
    const failed = results.filter(r => !r.success);

    console.log(
      `[Cron] Calendar sync complete: ${results.length} calendars, +${totalAdded} ~${totalUpdated} -${totalRemoved}, ${failed.length} failed`
    );

    return NextResponse.json({
      success: true,
      summary: {
        calendars: results.length,
        eventsAdded: totalAdded,
        eventsUpdated: totalUpdated,
        eventsRemoved: totalRemoved,
        failed: failed.length,
      },
      results,
    });
  } catch (error) {
    console.error('[Cron] Error syncing calendars:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
