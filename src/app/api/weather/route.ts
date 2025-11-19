/**
 * Weather API
 * GET - Get weather data for the current user
 * POST - Update user's location
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForUser } from '@/lib/weather/weatherService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weather = await getWeatherForUser(user.id);

    return NextResponse.json({ weather });
  } catch (error) {
    console.error('Error in GET /api/weather:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    if (errorMessage.includes('No location specified')) {
      return NextResponse.json(
        { error: 'No location configured. Please set your location first.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { location } = body;

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // Fetch weather for new location (this will update the cache)
    const weather = await getWeatherForUser(user.id, location);

    return NextResponse.json({ weather });
  } catch (error) {
    console.error('Error in POST /api/weather:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
