/**
 * Email Account Detail API Routes
 * GET /api/email/accounts/[id] - Get single account
 * PATCH /api/email/accounts/[id] - Update account
 * DELETE /api/email/accounts/[id] - Delete account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailEncryption } from '@/lib/email/emailService';

export async function GET(
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

    const { data: account, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Remove encrypted password from response
    const { imap_password_encrypted, ...sanitizedAccount } = account;

    return NextResponse.json({ account: sanitizedAccount });
  } catch (error) {
    console.error('Error in GET /api/email/accounts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await request.json();
    const updates: any = {};

    // Only allow specific fields to be updated
    const allowedFields = [
      'display_name',
      'is_active',
      'sync_frequency_minutes',
      'imap_host',
      'imap_port',
      'imap_username',
      'use_ssl',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Handle password update separately (requires encryption)
    if (body.imap_password) {
      updates.imap_password_encrypted = EmailEncryption.encrypt(body.imap_password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: account, error } = await supabase
      .from('email_accounts')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
    }

    // Remove encrypted password from response
    const { imap_password_encrypted, ...sanitizedAccount } = account;

    return NextResponse.json({ account: sanitizedAccount });
  } catch (error) {
    console.error('Error in PATCH /api/email/accounts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting account:', error);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/email/accounts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
