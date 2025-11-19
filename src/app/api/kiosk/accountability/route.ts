/**
 * Kiosk API - Accountability Dashboard
 * Fetches active consequences and today's commitments for DAKboard-style display
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify the kiosk token and get user_id
    const { data: kioskData, error: kioskError } = await supabase
      .from('kiosk_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (kioskError || !kioskData) {
      console.error('[Kiosk API] Invalid token:', kioskError);
      return NextResponse.json({ error: 'Invalid kiosk token' }, { status: 403 });
    }

    // Check if token is expired
    if (kioskData.expires_at && new Date(kioskData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Kiosk token expired' }, { status: 403 });
    }

    const userId = kioskData.user_id;

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

    // Fetch today's commitments (due today or overdue)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: commitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select('*, child:children(id, name)')
      .in('status', ['active', 'completed'])
      .in('child_id', children?.map(c => c.id) || [])
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .order('due_date', { ascending: true });

    if (commitmentsError) {
      console.error('[Kiosk API] Error fetching commitments:', commitmentsError);
    }

    // Also fetch overdue commitments
    const { data: overdueCommitments, error: overdueError } = await supabase
      .from('commitments')
      .select('*, child:children(id, name)')
      .eq('status', 'active')
      .in('child_id', children?.map(c => c.id) || [])
      .lt('due_date', today.toISOString())
      .order('due_date', { ascending: true });

    if (overdueError) {
      console.error('[Kiosk API] Error fetching overdue commitments:', overdueError);
    }

    // Combine commitments (overdue first, then today's)
    const allCommitments = [
      ...(overdueCommitments || []),
      ...(commitments || []),
    ];

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
