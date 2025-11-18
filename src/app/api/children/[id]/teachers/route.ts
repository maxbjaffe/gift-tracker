/**
 * Child Teachers API
 * GET /api/children/[id]/teachers - Get all teachers for a child
 * POST /api/children/[id]/teachers - Associate a teacher with a child
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get teachers for this child
    const { data: associations, error } = await supabase
      .from('child_teachers')
      .select(`
        *,
        teacher:teachers(*)
      `)
      .eq('child_id', params.id);

    if (error) {
      console.error('Error fetching child teachers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teachers: associations || [] });
  } catch (error: any) {
    console.error('Error in GET /api/children/[id]/teachers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const body = await request.json();
    const { teacher_id, subject, is_primary, school_year } = body;

    if (!teacher_id) {
      return NextResponse.json(
        { error: 'teacher_id is required' },
        { status: 400 }
      );
    }

    // Create association
    const { data: association, error } = await supabase
      .from('child_teachers')
      .insert({
        child_id: params.id,
        teacher_id,
        subject,
        is_primary: is_primary || false,
        school_year: school_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      })
      .select(`
        *,
        teacher:teachers(*)
      `)
      .single();

    if (error) {
      console.error('Error creating child-teacher association:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ association }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/children/[id]/teachers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const associationId = searchParams.get('association_id');

    if (!associationId) {
      return NextResponse.json(
        { error: 'association_id is required' },
        { status: 400 }
      );
    }

    // Delete association
    const { error } = await supabase
      .from('child_teachers')
      .delete()
      .eq('id', associationId);

    if (error) {
      console.error('Error deleting child-teacher association:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/children/[id]/teachers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
