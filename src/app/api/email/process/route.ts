/**
 * Email AI Processing API Route
 * POST /api/email/process - Process emails with AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIAnalysisService } from '@/lib/email/aiAnalysisService';

// Allow longer timeout for AI processing
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailIds, processAll, limit } = body;

    let result;

    if (processAll) {
      // Process all unprocessed emails
      result = await AIAnalysisService.processAllUnprocessed(user.id, limit || 10);
    } else if (emailIds && Array.isArray(emailIds)) {
      // Process specific emails
      result = await AIAnalysisService.processBatch(emailIds, user.id);
    } else {
      return NextResponse.json(
        { error: 'Must provide emailIds array or processAll: true' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error in POST /api/email/process:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
