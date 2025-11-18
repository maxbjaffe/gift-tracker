/**
 * Email Account Sync API Route
 * POST /api/email/accounts/[id]/sync - Trigger email sync for account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/emailService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Trigger sync
    const result = await EmailService.syncAccount(params.id, user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Sync failed',
          emailsFetched: result.emailsFetched,
          emailsSaved: result.emailsSaved,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailsFetched: result.emailsFetched,
      emailsSaved: result.emailsSaved,
    });
  } catch (error: any) {
    console.error('Error in POST /api/email/accounts/[id]/sync:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
