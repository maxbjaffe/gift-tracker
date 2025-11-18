/**
 * Daily Summary Update Cron Job
 * Runs daily to update summaries for current month with new emails
 * Triggered by Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SummaryGenerationService } from '@/lib/email/summaryService';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all users who have email accounts
    const { data: users, error: usersError } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users to generate summaries for' });
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(users.map(u => u.user_id))];

    // Update summaries for CURRENT month (ongoing)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Current month

    const results = [];

    // Generate/update summaries for each user for current month
    for (const userId of uniqueUserIds) {
      try {
        // Generate summary for current month (will update if exists)
        const summaries = await SummaryGenerationService.generateAllSummaries(
          userId,
          year,
          month
        );

        results.push({
          userId,
          success: true,
          summariesGenerated: summaries.length,
          type: 'current_month',
        });
      } catch (error: any) {
        console.error(`Error generating summaries for user ${userId}:`, error);
        results.push({
          userId,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Daily summary update completed',
      year,
      month,
      usersProcessed: uniqueUserIds.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in summary generation cron:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
