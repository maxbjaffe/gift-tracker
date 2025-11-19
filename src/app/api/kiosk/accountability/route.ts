/**
 * Kiosk API - Accountability Dashboard
 * Fetches active consequences and today's commitments for DAKboard-style display
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, age, avatar_type, avatar_data, avatar_background')
      .eq('user_id', userId)
      .order('name');

    if (childrenError) {
      console.error('[Kiosk API] Error fetching children:', childrenError);
      return NextResponse.json({ error: 'Failed to load children' }, { status: 500 });
    }

    // Fetch active consequences
    const { data: consequences, error: consequencesError } = await supabase
      .from('consequences')
      .select('*, child:children(id, name)')
      .eq('status', 'active')
      .in('child_id', children?.map(c => c.id) || [])
      .order('created_at', { ascending: false });

    if (consequencesError) {
      console.error('[Kiosk API] Error fetching consequences:', consequencesError);
    }

    // Fetch all active commitments (sorted by due date)
    const { data: allCommitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select('*, child:children(id, name)')
      .in('status', ['active', 'completed'])
      .in('child_id', children?.map(c => c.id) || [])
      .order('due_date', { ascending: true });

    if (commitmentsError) {
      console.error('[Kiosk API] Error fetching commitments:', commitmentsError);
    }

    return NextResponse.json({
      children: children || [],
      consequences: consequences || [],
      commitments: allCommitments,
    });
  } catch (error) {
    console.error('[Kiosk API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
