import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/kiosk/token
 * Generate or retrieve kiosk token for current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user using server helper
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service key to update profile
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has a kiosk token
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('kiosk_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    let kioskToken = profile.kiosk_token;

    // Generate token if doesn't exist
    if (!kioskToken) {
      kioskToken = generateSecureToken();

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ kiosk_token: kioskToken })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    // Get the base URL from the request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const kioskUrl = `${baseUrl}/kiosk?token=${kioskToken}`;

    return NextResponse.json({
      token: kioskToken,
      url: kioskUrl,
    });
  } catch (error) {
    console.error('Error generating kiosk token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kiosk/token
 * Regenerate kiosk token (invalidates old one)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user using server helper
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    const newToken = generateSecureToken();

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ kiosk_token: newToken })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Get the base URL from the request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const kioskUrl = `${baseUrl}/kiosk?token=${newToken}`;

    return NextResponse.json({
      token: newToken,
      url: kioskUrl,
    });
  } catch (error) {
    console.error('Error regenerating kiosk token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateSecureToken(): string {
  // Generate a cryptographically secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
