import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyConsequenceExpiring } from '@/lib/notifications/partner-notify';
import { isWithinQuietHours } from '@/lib/utils/quiet-hours';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cron job: Send warnings for consequences expiring soon
 * Runs every 30 minutes
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find consequences expiring in the next 1-2 hours
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: expiringConsequences, error: fetchError } = await supabase
      .from('consequences')
      .select(`
        *,
        child:children!inner(id, name, user_id)
      `)
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .gte('expires_at', oneHourFromNow.toISOString())
      .lte('expires_at', twoHoursFromNow.toISOString());

    if (fetchError) {
      console.error('Error fetching expiring consequences:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiringConsequences || expiringConsequences.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No consequences expiring soon',
        warnings: 0,
      });
    }

    console.log(`Found ${expiringConsequences.length} consequences expiring soon`);

    // Check if we've already sent a warning for each consequence
    // We'll track this by checking for recent partner notifications
    const warnings = [];

    for (const consequence of expiringConsequences) {
      try {
        const userId = consequence.child.user_id;

        // Check if we already sent a warning (look for notifications in past 2 hours)
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        const { data: existingNotifications } = await supabase
          .from('partner_notifications')
          .select('id')
          .eq('reference_id', consequence.id)
          .eq('reference_type', 'consequence')
          .eq('type', 'consequence_modified') // Using this type for expiration warnings
          .gte('created_at', twoHoursAgo.toISOString());

        if (existingNotifications && existingNotifications.length > 0) {
          console.log(`Already sent warning for consequence ${consequence.id}`);
          continue;
        }

        // Check quiet hours
        const inQuietHours = await isWithinQuietHours(userId);
        if (inQuietHours) {
          console.log(`Skipping warning for ${consequence.id} - quiet hours`);
          continue;
        }

        // Send expiration warning
        await notifyConsequenceExpiring(consequence, userId);

        warnings.push(consequence.id);
      } catch (error) {
        console.error(`Error sending warning for consequence ${consequence.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${warnings.length} expiration warnings`,
      warnings: warnings.length,
      consequenceIds: warnings,
    });
  } catch (error) {
    console.error('Error in consequence-warnings cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
