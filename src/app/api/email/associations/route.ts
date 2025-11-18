/**
 * Email Child Associations API Routes
 * POST /api/email/associations - Create a new child-email association
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email_id, child_id, relevance_type } = body;

    if (!email_id || !relevance_type) {
      return NextResponse.json(
        { error: 'Missing required fields: email_id, relevance_type' },
        { status: 400 }
      );
    }

    // Create the association
    const { data: association, error } = await supabase
      .from('email_child_relevance')
      .insert({
        email_id,
        child_id,
        user_id: user.id,
        relevance_type,
        is_verified: true, // Manually added associations are auto-verified
        is_rejected: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating association:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, association });
  } catch (error: any) {
    console.error('Error in POST /api/email/associations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
