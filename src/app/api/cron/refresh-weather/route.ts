/**
 * Weather Refresh Cron Job
 * Refreshes all weather caches hourly
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshAllWeatherCaches } from '@/lib/weather/weatherService';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting weather refresh...');

    const result = await refreshAllWeatherCaches();

    console.log(
      `[Cron] Weather refresh complete: ${result.success} success, ${result.failed} failed`
    );

    if (result.errors.length > 0) {
      console.error('[Cron] Weather refresh errors:', result.errors);
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[Cron] Error refreshing weather:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
