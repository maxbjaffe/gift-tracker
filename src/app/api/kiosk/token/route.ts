import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/kiosk/token
 * Generate or retrieve kiosk token for current user
 */
export async function GET() {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieString = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          cookie: cookieString,
        },
      },
    });

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
export async function DELETE() {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieString = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          cookie: cookieString,
        },
      },
    });

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
