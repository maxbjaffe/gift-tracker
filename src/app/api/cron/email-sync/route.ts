/**
 * Email Sync Cron Job
 * Runs every 15 minutes to sync emails from all active accounts
 * Triggered by Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/emailService';
import { GmailService } from '@/lib/email/gmailService';
import { AIAssociationService } from '@/lib/email/associationService';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all active email accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('is_active', true);

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ message: 'No active accounts to sync' });
    }

    const results = [];

    // Sync each account
    for (const account of accounts) {
      try {
        // Use the appropriate service based on provider
        const syncResult = account.provider === 'gmail'
          ? await GmailService.syncAccount(account.id, account.user_id)
          : await EmailService.syncAccount(account.id, account.user_id);
        results.push({
          accountId: account.id,
          email: account.email_address,
          ...syncResult,
        });

        // Process new emails with AI if sync was successful
        if (syncResult.success && syncResult.emailsSaved > 0) {
          // Get newly saved emails for this account
          const { data: newEmails } = await supabase
            .from('school_emails')
            .select('id')
            .eq('email_account_id', account.id)
            .is('ai_processed_at', null)
            .limit(20); // Process max 20 at a time to avoid timeout

          if (newEmails && newEmails.length > 0) {
            const emailIds = newEmails.map(e => e.id);
            await AIAssociationService.processBatch(emailIds, account.user_id);
          }
        }
      } catch (error: any) {
        console.error(`Error syncing account ${account.id}:`, error);
        results.push({
          accountId: account.id,
          email: account.email_address,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Email sync completed',
      accountsProcessed: accounts.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in email sync cron:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
