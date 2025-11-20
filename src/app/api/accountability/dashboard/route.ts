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

    // Fetch commitments with child info
    // Join through children table since commitments don't have parent_id
    const { data: commitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select(`
        id,
        child_id,
        commitment_text,
        due_date,
        status,
        created_at,
        child:children (
          id,
          name,
          avatar_url,
          user_id
        )
      `)
      .order('due_date', { ascending: true });

    if (commitmentsError) {
      console.error('Error fetching commitments:', commitmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch commitments', details: commitmentsError.message },
        { status: 500 }
      );
    }

    // Filter commitments by user_id through children relationship
    const userCommitments = commitments?.filter((c: any) => c.child?.user_id === user.id) || [];

    // Fetch consequences with child info
    const { data: consequences, error: consequencesError } = await supabase
      .from('consequences')
      .select(`
        id,
        child_id,
        restriction_item,
        expires_at,
        created_at,
        child:children (
          id,
          name,
          avatar_url,
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (consequencesError) {
      console.error('Error fetching consequences:', consequencesError);
      return NextResponse.json(
        { error: 'Failed to fetch consequences', details: consequencesError.message },
        { status: 500 }
      );
    }

    // Filter consequences by user_id through children relationship
    const userConsequences = consequences?.filter((c: any) => c.child?.user_id === user.id) || [];

    return NextResponse.json({
      commitments: userCommitments,
      consequences: userConsequences,
    });
  } catch (error) {
    console.error('Error in GET /api/accountability/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
