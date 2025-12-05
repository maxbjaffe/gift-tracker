/**
 * Accountability Dashboard API
 * GET - Get combined accountability data (commitments + consequences)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, fetch user's children (RLS will filter this automatically)
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, avatar_color')
      .eq('user_id', user.id);

    if (childrenError) {
      console.error('[Dashboard] Error fetching children:', childrenError);
      return NextResponse.json(
        { error: 'Failed to fetch children', details: childrenError.message, code: childrenError.code },
        { status: 500 }
      );
    }

    const childIds = children?.map((c) => c.id) || [];

    if (childIds.length === 0) {
      return NextResponse.json({
        commitments: [],
        consequences: [],
      });
    }

    // Fetch commitments for user's children
    const { data: commitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select('*')
      .in('child_id', childIds)
      .order('due_date', { ascending: true });

    if (commitmentsError) {
      console.error('[Dashboard] Error fetching commitments:', commitmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch commitments', details: commitmentsError.message, code: commitmentsError.code },
        { status: 500 }
      );
    }

    // Fetch consequences for user's children
    const { data: consequences, error: consequencesError } = await supabase
      .from('consequences')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false });

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

    return NextResponse.json({
      commitments: commitmentsWithChildren,
      consequences: consequencesWithChildren,
    });
  } catch (error) {
    console.error('[Dashboard] Caught error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
