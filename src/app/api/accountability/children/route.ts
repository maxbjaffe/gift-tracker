/**
 * Accountability Children API
 * GET /api/accountability/children - Get all children for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get children for user
    const { data: children, error } = await supabase
      .from('children')
      .select('id, name, grade, teacher, notes')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching children:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ children: children || [] });
  } catch (error: any) {
    console.error('Error in GET /api/accountability/children:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
