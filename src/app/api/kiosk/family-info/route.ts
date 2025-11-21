import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Verify token and get user_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('kiosk_tokens')
      .select('user_id')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid or inactive token' }, { status: 401 });
    }

    const userId = tokenData.user_id;

    // Get query parameters for filtering
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('family_information')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: entries, error: entriesError } = await query;

    if (entriesError) {
      console.error('Error fetching family info:', entriesError);
      return NextResponse.json({ error: 'Failed to fetch family information' }, { status: 500 });
    }

    return NextResponse.json({
      entries: entries || [],
      count: entries?.length || 0,
    });
  } catch (error) {
    console.error('Kiosk family-info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
