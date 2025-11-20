/**
 * API Route - Consequences
 * Create and manage consequences
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      child_id,
      restriction_type,
      restriction_item,
      reason,
      duration_days,
      expires_at,
      severity,
      status,
    } = body;

    // Validate required fields
    if (!child_id || !restriction_type || !restriction_item || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: child_id, restriction_type, restriction_item, reason' },
        { status: 400 }
      );
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 });
    }

    // Create consequence (without nested child to avoid RLS conflicts)
    const { data: consequence, error: createError } = await supabase
      .from('consequences')
      .insert({
        child_id,
        restriction_type,
        restriction_item,
        reason,
        duration_days: duration_days || null,
        expires_at: expires_at || null,
        severity: severity || 'medium',
        status: status || 'active',
        created_by: user.id,
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating consequence:', createError);
      return NextResponse.json(
        { error: 'Failed to create consequence' },
        { status: 500 }
      );
    }

    // Fetch child data separately (respects RLS)
    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      consequence: {
        ...consequence,
        child: childData || null
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in consequences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('child_id');
    const status = searchParams.get('status');

    // Get user's children IDs
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('user_id', user.id);

    const childIds = children?.map(c => c.id) || [];

    if (childIds.length === 0) {
      return NextResponse.json({ consequences: [] });
    }

    // Build query (without nested child to avoid RLS conflicts)
    let query = supabase
      .from('consequences')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false });

    if (childId) {
      query = query.eq('child_id', childId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: consequences, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching consequences:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch consequences' },
        { status: 500 }
      );
    }

    // Enrich with child data (client-side join to respect RLS)
    let enrichedConsequences = consequences;
    if (consequences && consequences.length > 0) {
      // Fetch all children data (we already have childIds)
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .in('id', childIds)
        .eq('user_id', user.id);

      const childrenMap = new Map(childrenData?.map(child => [child.id, child]) || []);

      // Enrich consequences with child data
      enrichedConsequences = consequences.map((consequence: any) => ({
        ...consequence,
        child: childrenMap.get(consequence.child_id) || null
      }));
    }

    return NextResponse.json({ consequences: enrichedConsequences || [] });
  } catch (error) {
    console.error('Unexpected error in consequences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
