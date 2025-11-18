/**
 * Email Accounts API Routes
 * GET /api/email/accounts - List all accounts
 * POST /api/email/accounts - Create new account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailEncryption } from '@/lib/email/emailService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch accounts
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email accounts:', error);
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    // Remove encrypted password from response
    const sanitizedAccounts = accounts?.map(acc => {
      const { imap_password_encrypted, ...rest } = acc;
      return rest;
    });

    return NextResponse.json({ accounts: sanitizedAccounts });
  } catch (error) {
    console.error('Error in GET /api/email/accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      email_address,
      display_name,
      provider,
      imap_host,
      imap_port,
      imap_username,
      imap_password,
      use_ssl = true,
      sync_frequency_minutes = 15,
    } = body;

    // Validate required fields
    if (!email_address || !provider || !imap_host || !imap_port || !imap_username || !imap_password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Encrypt password
    const encrypted_password = EmailEncryption.encrypt(imap_password);

    // Create account
    const { data: account, error } = await supabase
      .from('email_accounts')
      .insert({
        user_id: user.id,
        email_address,
        display_name,
        provider,
        imap_host,
        imap_port,
        imap_username,
        imap_password_encrypted: encrypted_password,
        use_ssl,
        sync_frequency_minutes,
        fetch_since_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating email account:', error);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Remove encrypted password from response
    const { imap_password_encrypted, ...sanitizedAccount } = account;

    return NextResponse.json({ account: sanitizedAccount }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/email/accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
