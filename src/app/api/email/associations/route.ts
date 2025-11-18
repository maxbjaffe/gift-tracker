/**
 * Email Associations API Routes
 * POST /api/email/associations/verify - Verify an association
 * POST /api/email/associations/feedback - Submit classification feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIAssociationService } from '@/lib/email/associationService';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'verify') {
      // Verify or reject an association
      const { association_id, association_type, is_verified, feedback } = body;

      if (!association_id || !association_type) {
        return NextResponse.json(
          { error: 'Missing required fields: association_id, association_type' },
          { status: 400 }
        );
      }

      await AIAssociationService.verifyAssociation(
        association_id,
        association_type,
        is_verified,
        feedback
      );

      return NextResponse.json({ success: true });
    } else if (action === 'feedback') {
      // Submit classification feedback
      const { email_id, field_name, ai_value, user_value, feedback_text } = body;

      if (!email_id || !field_name || !user_value) {
        return NextResponse.json(
          { error: 'Missing required fields: email_id, field_name, user_value' },
          { status: 400 }
        );
      }

      await AIAssociationService.submitFeedback(
        email_id,
        user.id,
        field_name,
        ai_value,
        user_value,
        feedback_text
      );

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in POST /api/email/associations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
