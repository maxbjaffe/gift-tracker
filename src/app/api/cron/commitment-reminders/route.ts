import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendCommitmentReminder,
  sendVerificationRequest,
  notifyCommitmentMissed,
} from '@/lib/notifications/partner-notify';
import { isWithinQuietHours } from '@/lib/utils/quiet-hours';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cron job: Send commitment reminders and verification requests
 * Runs every 5 minutes
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const results = {
      reminders: 0,
      verifications: 0,
      escalations: 0,
      missed: 0,
    };

    // 1. Send 30-minute advance reminders
    const { data: upcomingCommitments } = await supabase
      .from('commitments')
      .select(`
        *,
        child:children!inner(id, name, user_id)
      `)
      .eq('status', 'active')
      .is('reminded_at', null)
      .gte('due_date', now.toISOString())
      .lte('due_date', in30Minutes.toISOString());

    if (upcomingCommitments && upcomingCommitments.length > 0) {
      console.log(`Sending ${upcomingCommitments.length} 30-minute reminders`);

      for (const commitment of upcomingCommitments) {
        const userId = commitment.child.user_id;

        // Check quiet hours
        const inQuietHours = await isWithinQuietHours(userId);
        if (inQuietHours) {
          console.log(`Skipping reminder for ${commitment.id} - quiet hours`);
          continue;
        }

        // Send reminder to both parents
        await sendCommitmentReminder(commitment, userId, 'parent');

        // Mark as reminded
        await supabase
          .from('commitments')
          .update({ reminded_at: now.toISOString() })
          .eq('id', commitment.id);

        results.reminders++;
      }
    }

    // 2. Send verification requests for commitments that just reached deadline
    const { data: dueCommitments } = await supabase
      .from('commitments')
      .select(`
        *,
        child:children!inner(id, name, user_id)
      `)
      .eq('status', 'active')
      .lte('due_date', now.toISOString())
      .gte('due_date', thirtyMinutesAgo.toISOString());

    if (dueCommitments && dueCommitments.length > 0) {
      console.log(`Sending ${dueCommitments.length} verification requests`);

      for (const commitment of dueCommitments) {
        const userId = commitment.child.user_id;

        // Check quiet hours
        const inQuietHours = await isWithinQuietHours(userId);
        if (inQuietHours) {
          console.log(`Skipping verification for ${commitment.id} - quiet hours`);
          continue;
        }

        // Send verification request
        await sendVerificationRequest(commitment, userId);

        results.verifications++;
      }
    }

    // 3. Mark commitments as missed if 30+ minutes past deadline and unverified
    const { data: overdueCommitments } = await supabase
      .from('commitments')
      .select(`
        *,
        child:children!inner(id, name, user_id)
      `)
      .eq('status', 'active')
      .lt('due_date', thirtyMinutesAgo.toISOString());

    if (overdueCommitments && overdueCommitments.length > 0) {
      console.log(`Marking ${overdueCommitments.length} commitments as missed`);

      for (const commitment of overdueCommitments) {
        const userId = commitment.child.user_id;
        const childId = commitment.child_id;

        // Mark as missed
        await supabase
          .from('commitments')
          .update({
            status: 'missed',
            completed_on_time: false,
          })
          .eq('id', commitment.id);

        // Get child's reliability stats
        const { data: stats } = await supabase
          .from('commitment_stats')
          .select('*')
          .eq('child_id', childId)
          .eq('month', new Date().toISOString().slice(0, 7) + '-01')
          .single();

        // Notify both parents
        const inQuietHours = await isWithinQuietHours(userId);
        if (!inQuietHours) {
          await notifyCommitmentMissed(
            commitment,
            stats || { missed: 1, reliability_score: 0 },
            userId
          );
        }

        results.missed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Commitment reminders processed',
      results,
    });
  } catch (error) {
    console.error('Error in commitment-reminders cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
