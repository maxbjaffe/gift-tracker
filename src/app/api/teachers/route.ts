/**
 * Teachers API Routes
 * GET /api/teachers - Get all teachers for current user
 * POST /api/teachers - Create a new teacher
 * DELETE /api/teachers?id=xxx - Delete a teacher
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

    // Get all teachers for user
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select(`
        *,
        child_teachers(
          id,
          child_id,
          subject,
          is_primary,
          child:children(id, name)
        )
      `)
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching teachers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teachers: teachers || [] });
  } catch (error: any) {
    console.error('Error in GET /api/teachers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, subject, school, phone, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Teacher name is required' },
        { status: 400 }
      );
    }

    // Create teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert({
        user_id: user.id,
        name,
        email,
        subject,
        school,
        phone,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating teacher:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/teachers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('id');

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // Delete teacher (cascade will delete child_teachers associations)
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', teacherId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting teacher:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/teachers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
