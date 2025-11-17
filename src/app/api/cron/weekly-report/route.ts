import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { weeklyReliabilityReport } from '@/lib/notifications/notification-templates';
import { sendBulkSMS } from '@/lib/sms/twilio-client';
import { isWithinQuietHours } from '@/lib/utils/quiet-hours';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cron job: Send weekly family reliability report
 * Runs every Sunday at 6:00 PM
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    // Get all users who have partner settings (indicating they use the accountability system)
    const { data: partnerSettings } = await supabase
      .from('partner_settings')
      .select('user_id, partner_phone');

    if (!partnerSettings || partnerSettings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with partner settings',
        sent: 0,
      });
    }

    const reportsSent = [];

    for (const settings of partnerSettings) {
      try {
        // Check quiet hours
        const inQuietHours = await isWithinQuietHours(settings.user_id);
        if (inQuietHours) {
          console.log(`Skipping report for user ${settings.user_id} - quiet hours`);
          continue;
        }

        // Get all children for this user with their stats
        const { data: children } = await supabase
          .from('children')
          .select(
            `
            id,
            name,
            age,
            avatar_color
          `
          )
          .eq('user_id', settings.user_id);

        if (!children || children.length === 0) {
          continue;
        }

        // Get stats for each child
        const childrenWithStats = [];
        for (const child of children) {
          const { data: stats } = await supabase
            .from('commitment_stats')
            .select('*')
            .eq('child_id', child.id)
            .eq('month', currentMonth)
            .single();

          if (stats) {
            childrenWithStats.push({
              child,
              stats,
            });
          }
        }

        if (childrenWithStats.length === 0) {
          // No activity this month - skip report
          continue;
        }

        // Generate report message
        const reportMessage = weeklyReliabilityReport(childrenWithStats);

        // Get user's phone number from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', settings.user_id)
          .single();

        const phones = [];
        if (profile?.phone_number) phones.push(profile.phone_number);
        if (settings.partner_phone) phones.push(settings.partner_phone);

        if (phones.length > 0) {
          // Send to both parents
          await sendBulkSMS(phones, reportMessage);

          reportsSent.push({
            userId: settings.user_id,
            childrenCount: childrenWithStats.length,
            recipientsCount: phones.length,
          });
        }
      } catch (error) {
        console.error(`Error sending report for user ${settings.user_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${reportsSent.length} weekly reports`,
      sent: reportsSent.length,
      reports: reportsSent,
    });
  } catch (error) {
    console.error('Error in weekly-report cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
