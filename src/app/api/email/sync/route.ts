/**
 * Manual Email Sync API
 * POST /api/email/sync - Sync all active email accounts for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GmailService } from '@/lib/email/gmailService';
import { EmailService } from '@/lib/email/emailService';

export const maxDuration = 60; // Allow up to 60 seconds for sync
export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Email Sync] Starting sync operation...');

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active email accounts for this user
    const { data: accounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        message: 'No active email accounts found',
        emailsFetched: 0,
        emailsSaved: 0,
      });
    }

    let totalFetched = 0;
    let totalSaved = 0;
    const results = [];

    // Sync each account
    for (const account of accounts) {
      try {
        // Use the appropriate service based on provider
        const syncResult = account.provider === 'gmail'
          ? await GmailService.syncAccount(account.id, user.id)
          : await EmailService.syncAccount(account.id, user.id);

        totalFetched += syncResult.emailsFetched || 0;
        totalSaved += syncResult.emailsSaved || 0;

        results.push({
          accountId: account.id,
          email: account.email_address,
          provider: account.provider,
          ...syncResult,
        });
      } catch (error: any) {
        console.error(`Error syncing account ${account.id}:`, error);
        results.push({
          accountId: account.id,
          email: account.email_address,
          provider: account.provider,
          success: false,
          error: error.message,
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Email Sync] Completed in ${duration}ms - Fetched: ${totalFetched}, Saved: ${totalSaved}`);

    return NextResponse.json({
      success: true,
      message: `Synced ${accounts.length} account(s)`,
      emailsFetched: totalFetched,
      emailsSaved: totalSaved,
      accounts: results,
      duration,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Email Sync] Failed after ${duration}ms:`, error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
