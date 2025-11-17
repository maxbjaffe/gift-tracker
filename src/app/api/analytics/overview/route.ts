import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getMonthlyReliabilityTrends, getChildrenComparison } from '@/lib/analytics/reliability-trends';
import { getConsequenceEffectiveness, getChildConsequencePatterns } from '@/lib/analytics/consequence-effectiveness';
import { detectCommitmentPatterns, generateInsights } from '@/lib/analytics/pattern-detection';

/**
 * GET /api/analytics/overview
 * Returns comprehensive analytics overview for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all analytics data in parallel
    const [
      monthlyTrends,
      childrenComparison,
      consequenceEffectiveness,
      consequencePatterns,
      detectedPatterns,
    ] = await Promise.all([
      getMonthlyReliabilityTrends(user.id, 6),
      getChildrenComparison(user.id),
      getConsequenceEffectiveness(user.id, 6),
      getChildConsequencePatterns(user.id, 6),
      detectCommitmentPatterns(user.id),
    ]);

    // Generate AI insights
    const insights = await generateInsights(detectedPatterns, user.id);

    return NextResponse.json({
      success: true,
      data: {
        reliability: {
          monthlyTrends,
          childrenComparison,
        },
        consequences: {
          effectiveness: consequenceEffectiveness,
          patterns: consequencePatterns,
        },
        patterns: detectedPatterns,
        insights,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
