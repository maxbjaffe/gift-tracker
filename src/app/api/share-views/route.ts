// API endpoint for tracking anonymous share views
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'recipientId is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Create a simple fingerprint from IP and user agent for basic deduplication
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Simple hash function
    const fingerprint = Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);

    // Insert view record
    const { error: insertError } = await supabase
      .from('share_views')
      .insert({
        recipient_id: recipientId,
        visitor_fingerprint: fingerprint,
        referrer: request.headers.get('referer') || null,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('Error tracking view:', insertError);
      // Don't fail the request if tracking fails
    }

    // Increment recipient view count
    const { error: updateError } = await supabase.rpc('increment_share_view_count', {
      recipient_id: recipientId,
    });

    if (updateError) {
      console.error('Error incrementing view count:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in share-views endpoint:', error);
    // Return success even if tracking fails - it's not critical
    return NextResponse.json({ success: true });
  }
}
