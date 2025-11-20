/**
 * Accountability Dashboard API
 * GET - Get combined accountability data (commitments + consequences)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[Dashboard] Starting request');
    const supabase = await createClient();
    console.log('[Dashboard] Supabase client created');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('[Dashboard] User fetched:', user?.id || 'none');

    if (!user) {
      console.log('[Dashboard] No user, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, fetch user's children (RLS will filter this automatically)
    console.log('[Dashboard] Fetching children for user:', user.id);
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, avatar_url')
      .eq('user_id', user.id);

    console.log('[Dashboard] Children result:', {
      count: children?.length || 0,
      error: childrenError?.message || 'none'
    });

    if (childrenError) {
      console.error('[Dashboard] Error fetching children:', childrenError);
      return NextResponse.json(
        { error: 'Failed to fetch children', details: childrenError.message, code: childrenError.code },
        { status: 500 }
      );
    }

    const childIds = children?.map((c) => c.id) || [];
    console.log('[Dashboard] Child IDs:', childIds.length);

    if (childIds.length === 0) {
      console.log('[Dashboard] No children found, returning empty arrays');
      return NextResponse.json({
        commitments: [],
        consequences: [],
      });
    }

    // Fetch commitments for user's children
    console.log('[Dashboard] Fetching commitments for child IDs:', childIds);
    const { data: commitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select('*')
      .in('child_id', childIds)
      .order('due_date', { ascending: true });

    console.log('[Dashboard] Commitments result:', {
      count: commitments?.length || 0,
      error: commitmentsError?.message || 'none'
    });

    if (commitmentsError) {
      console.error('[Dashboard] Error fetching commitments:', commitmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch commitments', details: commitmentsError.message, code: commitmentsError.code },
        { status: 500 }
      );
    }

    // Fetch consequences for user's children
    console.log('[Dashboard] Fetching consequences for child IDs:', childIds);
    const { data: consequences, error: consequencesError } = await supabase
      .from('consequences')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false });

    console.log('[Dashboard] Consequences result:', {
      count: consequences?.length || 0,
      error: consequencesError?.message || 'none'
    });

    if (consequencesError) {
      console.error('[Dashboard] Error fetching consequences:', consequencesError);
      return NextResponse.json(
        { error: 'Failed to fetch consequences', details: consequencesError.message, code: consequencesError.code },
        { status: 500 }
      );
    }

    // Create a map of children for easy lookup
    const childMap = new Map(children?.map((c) => [c.id, c]));

    // Add child info to commitments and consequences
    const commitmentsWithChildren = commitments?.map((c: any) => ({
      ...c,
      child: childMap.get(c.child_id),
    })) || [];

    const consequencesWithChildren = consequences?.map((c: any) => ({
      ...c,
      child: childMap.get(c.child_id),
    })) || [];

    console.log('[Dashboard] Returning data:', {
      commitments: commitmentsWithChildren.length,
      consequences: consequencesWithChildren.length
    });

    return NextResponse.json({
      commitments: commitmentsWithChildren,
      consequences: consequencesWithChildren,
    });
  } catch (error) {
    console.error('[Dashboard] Caught error:', error);
    console.error('[Dashboard] Error stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 });
  }
}
