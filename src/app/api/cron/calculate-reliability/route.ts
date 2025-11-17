import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cron job: Calculate daily reliability scores for all children
 * Runs once per day at 1:00 AM
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, user_id');

    if (childrenError || !children) {
      console.error('Error fetching children:', childrenError);
      return NextResponse.json({ error: childrenError?.message }, { status: 500 });
    }

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
    const results = [];

    for (const child of children) {
      try {
        const stats = await calculateChildReliability(supabase, child.id, currentMonth);
        results.push({
          childId: child.id,
          childName: child.name,
          stats,
        });
      } catch (error) {
        console.error(`Error calculating stats for child ${child.id}:`, error);
        results.push({
          childId: child.id,
          childName: child.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Calculated reliability for ${children.length} children`,
      results,
    });
  } catch (error) {
    console.error('Error in calculate-reliability cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate reliability stats for a child for the current month
 */
async function calculateChildReliability(
  supabase: any,
  childId: string,
  month: string
) {
  // Get all commitments for this child this month
  const { data: commitments } = await supabase
    .from('commitments')
    .select('*')
    .eq('child_id', childId)
    .gte('created_at', month)
    .lt('created_at', getNextMonth(month))
    .in('status', ['completed', 'missed']);

  if (!commitments || commitments.length === 0) {
    return null; // No data for this month
  }

  // Calculate totals
  const total = commitments.length;
  const completedOnTime = commitments.filter((c) => c.completed_on_time === true).length;
  const completedLate = commitments.filter(
    (c) => c.status === 'completed' && c.completed_on_time === false
  ).length;
  const missed = commitments.filter((c) => c.status === 'missed').length;

  // Calculate reliability score (on-time completion rate)
  const reliabilityScore = total > 0 ? (completedOnTime / total) * 100 : null;

  // Calculate category breakdowns
  const homeworkCount = commitments.filter((c) => c.category === 'homework').length;
  const choresCount = commitments.filter((c) => c.category === 'chores').length;
  const otherCount = commitments.filter(
    (c) => !['homework', 'chores'].includes(c.category)
  ).length;

  // Get previous month's score to determine trend
  const previousMonth = getPreviousMonth(month);
  const { data: previousStats } = await supabase
    .from('commitment_stats')
    .select('reliability_score')
    .eq('child_id', childId)
    .eq('month', previousMonth)
    .single();

  let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (previousStats?.reliability_score && reliabilityScore) {
    const diff = reliabilityScore - previousStats.reliability_score;
    if (diff > 5) improvementTrend = 'improving';
    else if (diff < -5) improvementTrend = 'declining';
  }

  // Upsert stats record
  const statsData = {
    child_id: childId,
    month,
    total_commitments: total,
    completed_on_time: completedOnTime,
    completed_late: completedLate,
    missed,
    reliability_score: reliabilityScore,
    improvement_trend: improvementTrend,
    homework_count: homeworkCount,
    chores_count: choresCount,
    other_count: otherCount,
  };

  const { data: upsertedStats, error: upsertError } = await supabase
    .from('commitment_stats')
    .upsert(statsData, {
      onConflict: 'child_id,month',
    })
    .select()
    .single();

  if (upsertError) {
    console.error('Error upserting stats:', upsertError);
    throw upsertError;
  }

  return upsertedStats;
}

/**
 * Get next month in YYYY-MM-01 format
 */
function getNextMonth(month: string): string {
  const date = new Date(month);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 7) + '-01';
}

/**
 * Get previous month in YYYY-MM-01 format
 */
function getPreviousMonth(month: string): string {
  const date = new Date(month);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7) + '-01';
}
