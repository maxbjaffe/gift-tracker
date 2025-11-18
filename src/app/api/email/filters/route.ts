/**
 * Email Filters API Routes
 * GET /api/email/filters - Get all saved filters
 * POST /api/email/filters - Create a new filter
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

    // Get all filters for user
    const { data: filters, error } = await supabase
      .from('email_filters')
      .select('*')
      .eq('user_id', user.id)
      .order('filter_name');

    if (error) {
      console.error('Error fetching filters:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ filters: filters || [] });
  } catch (error: any) {
    console.error('Error in GET /api/email/filters:', error);
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
    const { filter_name, filter_config, is_active } = body;

    if (!filter_name || !filter_config) {
      return NextResponse.json(
        { error: 'Missing required fields: filter_name, filter_config' },
        { status: 400 }
      );
    }

    // Create the filter
    const { data: filter, error } = await supabase
      .from('email_filters')
      .insert({
        user_id: user.id,
        filter_name,
        filter_config,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating filter:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ filter }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/email/filters:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
