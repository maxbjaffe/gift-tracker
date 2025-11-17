import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWeeklyTrends, getCategoryPerformance } from '@/lib/analytics/reliability-trends';

/**
 * GET /api/analytics/child/[childId]
 * Returns detailed analytics for a specific child
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { childId } = params;

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Fetch child-specific analytics
    const [weeklyTrends, categoryPerformance] = await Promise.all([
      getWeeklyTrends(childId, 12),
      getCategoryPerformance(childId, 3),
    ]);

    // Get current month stats
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const { data: currentStats } = await supabase
      .from('commitment_stats')
      .select('*')
      .eq('child_id', childId)
      .eq('month', currentMonth)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          age: child.age,
          avatarColor: child.avatar_color,
        },
        currentMonth: currentStats || null,
        weeklyTrends,
        categoryPerformance,
      },
    });
  } catch (error) {
    console.error('Error fetching child analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
