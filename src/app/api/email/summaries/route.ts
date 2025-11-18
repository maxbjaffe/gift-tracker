/**
 * Email Summaries API Routes
 * GET /api/email/summaries - List all summaries
 * POST /api/email/summaries - Generate new summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SummaryGenerationService } from '@/lib/email/summaryService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summaries = await SummaryGenerationService.getAllSummaries(user.id);

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Error in GET /api/email/summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { year, month, child_id } = body;

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: year, month' },
        { status: 400 }
      );
    }

    const summary = await SummaryGenerationService.generateMonthlySummary(
      user.id,
      year,
      month,
      child_id
    );

    return NextResponse.json({ summary }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/email/summaries:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
