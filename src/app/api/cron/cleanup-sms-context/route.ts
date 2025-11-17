import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredContexts } from '@/lib/sms/context-manager';

/**
 * Cron job: Cleanup expired SMS conversation contexts
 * Runs every hour to remove stale conversation state
 *
 * Recommended Vercel Cron Schedule: 0 * * * * (every hour)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting SMS context cleanup...');

    // Clean up expired contexts
    const deletedCount = await cleanupExpiredContexts();

    console.log(`[Cron] Cleaned up ${deletedCount} expired SMS contexts`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired SMS contexts`,
      deletedCount,
    });
  } catch (error) {
    console.error('[Cron] Error in cleanup-sms-context:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
