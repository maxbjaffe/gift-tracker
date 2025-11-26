// API endpoint for enabling/disabling recipient gift list sharing
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Enable or update sharing for a recipient
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id;
    const body = await request.json();
    const { privacy = 'link-only', expiresInDays = null } = body;

    // Validate privacy level
    if (!['private', 'link-only', 'public'].includes(privacy)) {
      return NextResponse.json(
        { error: 'Invalid privacy level. Must be private, link-only, or public' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('id, user_id, share_token')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    if (recipient.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to share this recipient' },
        { status: 403 }
      );
    }

    // Generate share token if not exists
    const shareToken = recipient.share_token || crypto.randomUUID();

    // Calculate expiration date
    const shareExpiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Update recipient with sharing settings
    const { data: updatedRecipient, error: updateError } = await supabase
      .from('recipients')
      .update({
        share_token: shareToken,
        share_privacy: privacy,
        share_enabled: true,
        share_expires_at: shareExpiresAt,
      })
      .eq('id', recipientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error enabling sharing:', updateError);
      return NextResponse.json(
        { error: 'Failed to enable sharing' },
        { status: 500 }
      );
    }

    // Return shareable URL info
    const shareUrl = `${request.nextUrl.origin}/share/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareToken,
      shareUrl,
      privacy,
      expiresAt: shareExpiresAt,
      recipient: updatedRecipient,
    });
  } catch (error) {
    console.error('Error in share endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable sharing for a recipient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id;
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('id, user_id')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    if (recipient.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this recipient' },
        { status: 403 }
      );
    }

    // Disable sharing (keep token for re-enabling)
    const { error: updateError } = await supabase
      .from('recipients')
      .update({
        share_enabled: false,
        share_privacy: 'private',
      })
      .eq('id', recipientId);

    if (updateError) {
      console.error('Error disabling sharing:', updateError);
      return NextResponse.json(
        { error: 'Failed to disable sharing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sharing disabled successfully',
    });
  } catch (error) {
    console.error('Error in share delete endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get sharing status for a recipient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id;
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get recipient sharing info
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('id, user_id, name, share_token, share_privacy, share_enabled, share_expires_at, share_view_count')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    if (recipient.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this recipient' },
        { status: 403 }
      );
    }

    // Build share URL if sharing is enabled
    const shareUrl = recipient.share_enabled && recipient.share_token
      ? `${request.nextUrl.origin}/share/${recipient.share_token}`
      : null;

    return NextResponse.json({
      recipientId: recipient.id,
      recipientName: recipient.name,
      shareEnabled: recipient.share_enabled || false,
      shareToken: recipient.share_token,
      shareUrl,
      privacy: recipient.share_privacy || 'private',
      expiresAt: recipient.share_expires_at,
      viewCount: recipient.share_view_count || 0,
      isExpired: recipient.share_expires_at
        ? new Date(recipient.share_expires_at) < new Date()
        : false,
    });
  } catch (error) {
    console.error('Error in share get endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
