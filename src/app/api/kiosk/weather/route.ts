/**
 * Kiosk API - Weather Data
 * Fetches weather data for kiosk display
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForUser } from '@/lib/weather/weatherService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Use service role key for kiosk access (no cookies needed)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the kiosk token and get user_id from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('kiosk_token', token)
      .single();

    if (profileError || !profile) {
      console.error('[Kiosk API] Invalid token:', profileError);
      return NextResponse.json({ error: 'Invalid kiosk token' }, { status: 403 });
    }

    const userId = profile.id;

    // Get weather data using the weather service (which handles caching)
    const weather = await getWeatherForUser(userId);

    return NextResponse.json({ weather });
  } catch (error) {
    console.error('[Kiosk API] Weather error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    // Handle no location error gracefully
    if (errorMessage.includes('No location specified')) {
      return NextResponse.json(
        { error: 'No location configured. Please set your location first.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
