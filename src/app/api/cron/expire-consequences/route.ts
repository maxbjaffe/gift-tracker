import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyConsequenceExpired } from '@/lib/notifications/partner-notify';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cron job: Expire consequences that have passed their expiration date
 * Runs every 15 minutes
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all active consequences that should be expired
    const { data: expiredConsequences, error: fetchError } = await supabase
      .from('consequences')
      .select(`
        *,
        child:children!inner(id, name, user_id)
      `)
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired consequences:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredConsequences || expiredConsequences.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No consequences to expire',
        expired: 0,
      });
    }

    console.log(`Found ${expiredConsequences.length} consequences to expire`);

    // Update status to 'expired'
    const consequenceIds = expiredConsequences.map((c) => c.id);

    const { error: updateError } = await supabase
      .from('consequences')
      .update({ status: 'expired' })
      .in('id', consequenceIds);

    if (updateError) {
      console.error('Error updating consequences:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Notify both parents for each expired consequence
    const notificationPromises = expiredConsequences.map(async (consequence) => {
      try {
        await notifyConsequenceExpired(consequence, consequence.child.user_id);
      } catch (error) {
        console.error(`Failed to notify for consequence ${consequence.id}:`, error);
      }
    });

    await Promise.allSettled(notificationPromises);

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredConsequences.length} consequences`,
      expired: expiredConsequences.length,
      consequenceIds,
    });
  } catch (error) {
    console.error('Error in expire-consequences cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
