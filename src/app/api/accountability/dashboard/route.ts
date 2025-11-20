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
    const { data: commitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select(`
        id,
        child_id,
        commitment_text,
        due_date,
        status,
        created_at,
        child:children!commitments_child_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('parent_id', user.id)
      .order('due_date', { ascending: true });

    if (commitmentsError) {
      console.error('Error fetching commitments:', commitmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch commitments', details: commitmentsError.message },
        { status: 500 }
      );
    }

    // Fetch consequences with child info
    const { data: consequences, error: consequencesError } = await supabase
      .from('consequences')
      .select(`
        id,
        child_id,
        restriction_item,
        expires_at,
        created_at,
        child:children!consequences_child_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false });

    if (consequencesError) {
      console.error('Error fetching consequences:', consequencesError);
      return NextResponse.json(
        { error: 'Failed to fetch consequences', details: consequencesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      commitments: commitments || [],
      consequences: consequences || [],
    });
  } catch (error) {
    console.error('Error in GET /api/accountability/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
