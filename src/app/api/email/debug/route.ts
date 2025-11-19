/**
 * Debug endpoint to diagnose email sync issues
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get email account
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'No active email accounts' }, { status: 404 });
    }

    const account = accounts[0];

    // Get total email count
    const { count: totalCount } = await supabase
      .from('school_emails')
      .select('*', { count: 'exact', head: true })
      .eq('email_account_id', account.id);

    // Get oldest email
    const { data: oldestEmail } = await supabase
      .from('school_emails')
      .select('id, subject, received_at, from_address')
      .eq('email_account_id', account.id)
      .order('received_at', { ascending: true })
      .limit(1)
      .single();

    // Get newest email
    const { data: newestEmail } = await supabase
      .from('school_emails')
      .select('id, subject, received_at, from_address')
      .eq('email_account_id', account.id)
      .order('received_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent emails (last 10)
    const { data: recentEmails } = await supabase
      .from('school_emails')
      .select('id, subject, received_at, from_address, message_id')
      .eq('email_account_id', account.id)
      .order('received_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      account: {
        id: account.id,
        email: account.email_address,
        provider: account.provider,
        last_sync_at: account.last_sync_at,
        last_sync_status: account.last_sync_status,
        fetch_since_date: account.fetch_since_date,
      },
      database: {
        totalEmails: totalCount,
        oldestEmail: oldestEmail ? {
          subject: oldestEmail.subject,
          received_at: oldestEmail.received_at,
          from: oldestEmail.from_address,
        } : null,
        newestEmail: newestEmail ? {
          subject: newestEmail.subject,
          received_at: newestEmail.received_at,
          from: newestEmail.from_address,
        } : null,
        recentEmails: recentEmails?.map(e => ({
          subject: e.subject,
          received_at: e.received_at,
          from: e.from_address,
          message_id: e.message_id,
        })),
      },
      nextSyncQuery: oldestEmail ?
        `before:${new Date(oldestEmail.received_at).toISOString().split('T')[0].replace(/-/g, '/')}` :
        'No date filter (first sync)',
    });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
