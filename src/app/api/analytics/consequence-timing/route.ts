import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getConsequenceTimingPatterns } from '@/lib/analytics/consequence-effectiveness';

/**
 * GET /api/analytics/consequence-timing
 * Returns timing patterns for when consequences are set
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timingPatterns = await getConsequenceTimingPatterns(user.id);

    return NextResponse.json({
      success: true,
      data: timingPatterns,
    });
  } catch (error) {
    console.error('Error fetching consequence timing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
