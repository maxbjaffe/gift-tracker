import { createClient } from '@/lib/supabase/server';

export interface ReliabilityTrend {
  month: string; // YYYY-MM
  childId: string;
  childName: string;
  reliabilityScore: number;
  totalCommitments: number;
  completedOnTime: number;
  completedLate: number;
  missed: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface WeeklyTrend {
  weekStart: string; // YYYY-MM-DD
  childId: string;
  childName: string;
  completedOnTime: number;
  completedLate: number;
  missed: number;
  reliabilityScore: number;
}

/**
 * Get reliability trends for all children over the past N months
 */
export async function getMonthlyReliabilityTrends(
  userId: string,
  monthsBack: number = 6
): Promise<ReliabilityTrend[]> {
  const supabase = await createClient();

  // Get all children for this user
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (!children || children.length === 0) {
    return [];
  }

  const trends: ReliabilityTrend[] = [];

  // Calculate start month
  const startMonth = new Date();
  startMonth.setMonth(startMonth.getMonth() - monthsBack);
  const startMonthStr = startMonth.toISOString().slice(0, 7) + '-01';

  for (const child of children) {
    // Get stats for this child for the past N months
    const { data: stats } = await supabase
      .from('commitment_stats')
      .select('*')
      .eq('child_id', child.id)
      .gte('month', startMonthStr)
      .order('month', { ascending: true });

    if (stats && stats.length > 0) {
      for (const stat of stats) {
        trends.push({
          month: stat.month.slice(0, 7), // YYYY-MM
          childId: child.id,
          childName: child.name,
          reliabilityScore: stat.reliability_score || 0,
          totalCommitments: stat.total_commitments || 0,
          completedOnTime: stat.completed_on_time || 0,
          completedLate: stat.completed_late || 0,
          missed: stat.missed || 0,
          trend: stat.improvement_trend || 'stable',
        });
      }
    }
  }

  return trends;
}

/**
 * Get weekly reliability trends for a specific child
 */
export async function getWeeklyTrends(
  childId: string,
  weeksBack: number = 12
): Promise<WeeklyTrend[]> {
  const supabase = await createClient();

  // Get child info
  const { data: child } = await supabase
    .from('children')
    .select('name')
    .eq('id', childId)
    .single();

  if (!child) {
    return [];
  }

  // Calculate start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksBack * 7));

  // Get all commitments for this child in the time range
  const { data: commitments } = await supabase
    .from('commitments')
    .select('*')
    .eq('child_id', childId)
    .gte('created_at', startDate.toISOString())
    .in('status', ['completed', 'missed'])
    .order('created_at', { ascending: true });

  if (!commitments || commitments.length === 0) {
    return [];
  }

  // Group by week
  const weeklyData = new Map<string, WeeklyTrend>();

  for (const commitment of commitments) {
    const date = new Date(commitment.created_at);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().slice(0, 10);

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, {
        weekStart: weekKey,
        childId,
        childName: child.name,
        completedOnTime: 0,
        completedLate: 0,
        missed: 0,
        reliabilityScore: 0,
      });
    }

    const week = weeklyData.get(weekKey)!;

    if (commitment.status === 'completed' && commitment.completed_on_time === true) {
      week.completedOnTime++;
    } else if (commitment.status === 'completed' && commitment.completed_on_time === false) {
      week.completedLate++;
    } else if (commitment.status === 'missed') {
      week.missed++;
    }
  }

  // Calculate reliability scores
  const trends: WeeklyTrend[] = Array.from(weeklyData.values());
  for (const trend of trends) {
    const total = trend.completedOnTime + trend.completedLate + trend.missed;
    trend.reliabilityScore = total > 0 ? (trend.completedOnTime / total) * 100 : 0;
  }

  return trends.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * Get reliability comparison across all children (current month)
 */
export async function getChildrenComparison(userId: string): Promise<{
  children: Array<{
    childId: string;
    childName: string;
    age?: number;
    reliabilityScore: number;
    totalCommitments: number;
    rank: number;
    improvement: number; // Change from last month
  }>;
  average: number;
}> {
  const supabase = await createClient();

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7) + '-01';

  // Get all children
  const { data: children } = await supabase
    .from('children')
    .select('id, name, age')
    .eq('user_id', userId);

  if (!children || children.length === 0) {
    return { children: [], average: 0 };
  }

  const comparison = [];

  for (const child of children) {
    // Get current month stats
    const { data: currentStats } = await supabase
      .from('commitment_stats')
      .select('*')
      .eq('child_id', child.id)
      .eq('month', currentMonth)
      .single();

    // Get last month stats for improvement calculation
    const { data: lastStats } = await supabase
      .from('commitment_stats')
      .select('reliability_score')
      .eq('child_id', child.id)
      .eq('month', lastMonthStr)
      .single();

    if (currentStats) {
      const improvement = lastStats?.reliability_score
        ? (currentStats.reliability_score || 0) - (lastStats.reliability_score || 0)
        : 0;

      comparison.push({
        childId: child.id,
        childName: child.name,
        age: child.age,
        reliabilityScore: currentStats.reliability_score || 0,
        totalCommitments: currentStats.total_commitments || 0,
        improvement,
        rank: 0, // Will be calculated below
      });
    }
  }

  // Sort by reliability score and assign ranks
  comparison.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
  comparison.forEach((child, index) => {
    child.rank = index + 1;
  });

  // Calculate average
  const average =
    comparison.length > 0
      ? comparison.reduce((sum, c) => sum + c.reliabilityScore, 0) / comparison.length
      : 0;

  return { children: comparison, average };
}

/**
 * Get category performance breakdown for a child
 */
export async function getCategoryPerformance(childId: string, monthsBack: number = 3): Promise<{
  categories: Array<{
    category: string;
    total: number;
    completedOnTime: number;
    completedLate: number;
    missed: number;
    reliabilityScore: number;
  }>;
}> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  // Get all commitments in time range
  const { data: commitments } = await supabase
    .from('commitments')
    .select('category, status, completed_on_time')
    .eq('child_id', childId)
    .gte('created_at', startDate.toISOString())
    .in('status', ['completed', 'missed']);

  if (!commitments || commitments.length === 0) {
    return { categories: [] };
  }

  // Group by category
  const categoryMap = new Map<string, any>();

  for (const commitment of commitments) {
    const category = commitment.category || 'other';

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        total: 0,
        completedOnTime: 0,
        completedLate: 0,
        missed: 0,
        reliabilityScore: 0,
      });
    }

    const cat = categoryMap.get(category);
    cat.total++;

    if (commitment.status === 'completed' && commitment.completed_on_time === true) {
      cat.completedOnTime++;
    } else if (commitment.status === 'completed' && commitment.completed_on_time === false) {
      cat.completedLate++;
    } else if (commitment.status === 'missed') {
      cat.missed++;
    }
  }

  // Calculate reliability scores
  const categories = Array.from(categoryMap.values());
  for (const cat of categories) {
    cat.reliabilityScore = cat.total > 0 ? (cat.completedOnTime / cat.total) * 100 : 0;
  }

  return {
    categories: categories.sort((a, b) => b.total - a.total),
  };
}

/**
 * Helper: Get the Monday of the week for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}
