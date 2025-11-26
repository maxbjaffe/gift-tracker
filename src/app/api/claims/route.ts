// API endpoint for claiming/unclaiming gifts on shared lists
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with anon key for public access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Claim a gift item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      giftRecipientId,
      claimedByName,
      claimedByEmail = null,
      claimNotes = null,
      claimDurationDays = 30,
    } = body;

    // Validate required fields
    if (!giftRecipientId || !claimedByName) {
      return NextResponse.json(
        { error: 'giftRecipientId and claimedByName are required' },
        { status: 400 }
      );
    }

    // Use anon client to allow public claiming
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if the item is on a shared list
    const { data: giftRecipient, error: checkError } = await supabase
      .from('gift_recipients')
      .select(`
        id,
        recipient_id,
        claimed_by_name,
        recipients!inner(
          id,
          share_enabled,
          share_expires_at
        )
      `)
      .eq('id', giftRecipientId)
      .single();

    if (checkError || !giftRecipient) {
      return NextResponse.json(
        { error: 'Gift item not found' },
        { status: 404 }
      );
    }

    // @ts-ignore - Supabase typing issue with inner join
    const recipient = giftRecipient.recipients;

    // Check if sharing is enabled
    if (!recipient.share_enabled) {
      return NextResponse.json(
        { error: 'This gift list is not shared' },
        { status: 403 }
      );
    }

    // Check if sharing has expired
    if (recipient.share_expires_at && new Date(recipient.share_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This shared list has expired' },
        { status: 403 }
      );
    }

    // Check if already claimed
    if (giftRecipient.claimed_by_name) {
      return NextResponse.json(
        { error: 'This item is already claimed by someone else' },
        { status: 409 }
      );
    }

    // Calculate expiration date
    const claimExpiresAt = new Date();
    claimExpiresAt.setDate(claimExpiresAt.getDate() + claimDurationDays);

    // Claim the item
    const { data: updatedGiftRecipient, error: updateError } = await supabase
      .from('gift_recipients')
      .update({
        claimed_by_name: claimedByName,
        claimed_by_email: claimedByEmail,
        claimed_at: new Date().toISOString(),
        claim_expires_at: claimExpiresAt.toISOString(),
        claim_notes: claimNotes,
      })
      .eq('id', giftRecipientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error claiming gift:', updateError);
      return NextResponse.json(
        { error: 'Failed to claim gift item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gift item claimed successfully',
      giftRecipient: updatedGiftRecipient,
      claimedAt: updatedGiftRecipient.claimed_at,
      expiresAt: updatedGiftRecipient.claim_expires_at,
    });
  } catch (error) {
    console.error('Error in claim endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Unclaim a gift item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const giftRecipientId = searchParams.get('giftRecipientId');
    const claimerEmail = searchParams.get('claimerEmail');

    if (!giftRecipientId) {
      return NextResponse.json(
        { error: 'giftRecipientId is required' },
        { status: 400 }
      );
    }

    // Use anon client to allow public unclaiming
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get current claim info
    const { data: giftRecipient, error: checkError } = await supabase
      .from('gift_recipients')
      .select('id, claimed_by_email, claimed_by_name')
      .eq('id', giftRecipientId)
      .single();

    if (checkError || !giftRecipient) {
      return NextResponse.json(
        { error: 'Gift item not found' },
        { status: 404 }
      );
    }

    // If item is not claimed, nothing to do
    if (!giftRecipient.claimed_by_name) {
      return NextResponse.json(
        { error: 'This item is not claimed' },
        { status: 400 }
      );
    }

    // Verify claimer (if email was provided during claim)
    if (giftRecipient.claimed_by_email && giftRecipient.claimed_by_email !== claimerEmail) {
      return NextResponse.json(
        { error: 'Only the person who claimed this item can unclaim it' },
        { status: 403 }
      );
    }

    // Unclaim the item
    const { error: updateError } = await supabase
      .from('gift_recipients')
      .update({
        claimed_by_name: null,
        claimed_by_email: null,
        claimed_at: null,
        claim_expires_at: null,
        claim_notes: null,
      })
      .eq('id', giftRecipientId);

    if (updateError) {
      console.error('Error unclaiming gift:', updateError);
      return NextResponse.json(
        { error: 'Failed to unclaim gift item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gift item unclaimed successfully',
    });
  } catch (error) {
    console.error('Error in unclaim endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
