import { createClient } from '@/lib/supabase/server';

export interface ConsequenceEffectiveness {
  restrictionType: string;
  totalConsequences: number;
  averageDuration: number; // in days
  earlyLifts: number; // lifted before expiration
  completedFull: number; // ran full duration
  extended: number; // had to extend
  effectiveness: number; // 0-100 score
  repeatOffenses: number; // same child, same reason within 30 days
}

export interface ConsequencePattern {
  childId: string;
  childName: string;
  mostCommonReason: string;
  mostEffectiveRestriction: string;
  totalConsequences: number;
  repeatRate: number; // percentage
}

/**
 * Analyze consequence effectiveness by restriction type
 */
export async function getConsequenceEffectiveness(
  userId: string,
  monthsBack: number = 6
): Promise<ConsequenceEffectiveness[]> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  // Get all consequences for this user's children
  const { data: consequences } = await supabase
    .from('consequences')
    .select(`
      *,
      child:children!inner(user_id)
    `)
    .eq('child.user_id', userId)
    .gte('created_at', startDate.toISOString())
    .in('status', ['expired', 'lifted', 'extended']);

  if (!consequences || consequences.length === 0) {
    return [];
  }

  // Group by restriction type
  const typeMap = new Map<string, any>();

  for (const consequence of consequences) {
    const type = consequence.restriction_type;

    if (!typeMap.has(type)) {
      typeMap.set(type, {
        restrictionType: type,
        totalConsequences: 0,
        totalDuration: 0,
        earlyLifts: 0,
        completedFull: 0,
        extended: 0,
        repeatOffenses: 0,
      });
    }

    const stats = typeMap.get(type);
    stats.totalConsequences++;
    stats.totalDuration += consequence.duration_days || 0;

    if (consequence.status === 'lifted') {
      stats.earlyLifts++;
    } else if (consequence.status === 'expired') {
      stats.completedFull++;
    } else if (consequence.status === 'extended') {
      stats.extended++;
    }
  }

  // Calculate repeat offenses
  for (const [type, stats] of typeMap) {
    const typeConsequences = consequences.filter((c) => c.restriction_type === type);

    // Check for repeat offenses (same child, similar reason within 30 days)
    for (let i = 0; i < typeConsequences.length; i++) {
      for (let j = i + 1; j < typeConsequences.length; j++) {
        const c1 = typeConsequences[i];
        const c2 = typeConsequences[j];

        if (c1.child_id === c2.child_id) {
          const daysDiff = Math.abs(
            new Date(c2.created_at).getTime() - new Date(c1.created_at).getTime()
          ) / (1000 * 60 * 60 * 24);

          if (daysDiff <= 30) {
            stats.repeatOffenses++;
            break; // Count each pair only once
          }
        }
      }
    }
  }

  // Calculate effectiveness scores and format results
  const results: ConsequenceEffectiveness[] = [];

  for (const [type, stats] of typeMap) {
    const averageDuration = stats.totalDuration / stats.totalConsequences;

    // Effectiveness scoring:
    // - Higher score for low repeat rate
    // - Higher score for completing full duration (not lifted early)
    // - Lower score for extensions
    const repeatRate = stats.repeatOffenses / stats.totalConsequences;
    const completionRate = stats.completedFull / stats.totalConsequences;
    const extensionPenalty = (stats.extended / stats.totalConsequences) * 20;

    const effectiveness = Math.max(
      0,
      Math.min(
        100,
        (1 - repeatRate) * 50 + // 50% weight on low repeats
        completionRate * 30 + // 30% weight on completion
        20 - extensionPenalty // 20% base, minus extensions
      )
    );

    results.push({
      restrictionType: type,
      totalConsequences: stats.totalConsequences,
      averageDuration,
      earlyLifts: stats.earlyLifts,
      completedFull: stats.completedFull,
      extended: stats.extended,
      effectiveness: Math.round(effectiveness),
      repeatOffenses: stats.repeatOffenses,
    });
  }

  return results.sort((a, b) => b.effectiveness - a.effectiveness);
}

/**
 * Get consequence patterns for each child
 */
export async function getChildConsequencePatterns(
  userId: string,
  monthsBack: number = 6
): Promise<ConsequencePattern[]> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  // Get all children
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (!children || children.length === 0) {
    return [];
  }

  const patterns: ConsequencePattern[] = [];

  for (const child of children) {
    // Get consequences for this child
    const { data: consequences } = await supabase
      .from('consequences')
      .select('*')
      .eq('child_id', child.id)
      .gte('created_at', startDate.toISOString());

    if (!consequences || consequences.length === 0) {
      continue;
    }

    // Find most common reason
    const reasonCounts = new Map<string, number>();
    for (const c of consequences) {
      const reason = c.reason || 'unknown';
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    }

    const mostCommonReason = Array.from(reasonCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'none';

    // Find most effective restriction (lowest repeat rate)
    const restrictionStats = new Map<string, { total: number; repeats: number }>();

    for (const c of consequences) {
      const type = c.restriction_type;
      if (!restrictionStats.has(type)) {
        restrictionStats.set(type, { total: 0, repeats: 0 });
      }
      restrictionStats.get(type)!.total++;
    }

    // Calculate repeats (similar consequence within 30 days)
    for (let i = 0; i < consequences.length; i++) {
      for (let j = i + 1; j < consequences.length; j++) {
        const daysDiff = Math.abs(
          new Date(consequences[j].created_at).getTime() -
          new Date(consequences[i].created_at).getTime()
        ) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 30 && consequences[i].restriction_type === consequences[j].restriction_type) {
          restrictionStats.get(consequences[i].restriction_type)!.repeats++;
          break;
        }
      }
    }

    // Find most effective (lowest repeat rate)
    let mostEffective = 'unknown';
    let lowestRepeatRate = 1;

    for (const [type, stats] of restrictionStats) {
      const repeatRate = stats.repeats / stats.total;
      if (repeatRate < lowestRepeatRate) {
        lowestRepeatRate = repeatRate;
        mostEffective = type;
      }
    }

    // Calculate overall repeat rate
    const totalRepeats = Array.from(restrictionStats.values()).reduce(
      (sum, s) => sum + s.repeats,
      0
    );
    const repeatRate = (totalRepeats / consequences.length) * 100;

    patterns.push({
      childId: child.id,
      childName: child.name,
      mostCommonReason,
      mostEffectiveRestriction: mostEffective,
      totalConsequences: consequences.length,
      repeatRate: Math.round(repeatRate),
    });
  }

  return patterns.sort((a, b) => b.totalConsequences - a.totalConsequences);
}

/**
 * Get time-based patterns (when are consequences most often set?)
 */
export async function getConsequenceTimingPatterns(userId: string): Promise<{
  byDayOfWeek: Array<{ day: string; count: number }>;
  byTimeOfDay: Array<{ hour: number; count: number }>;
  byMonth: Array<{ month: string; count: number }>;
}> {
  const supabase = await createClient();

  // Get consequences for the past year
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const { data: consequences } = await supabase
    .from('consequences')
    .select(`
      created_at,
      child:children!inner(user_id)
    `)
    .eq('child.user_id', userId)
    .gte('created_at', startDate.toISOString());

  if (!consequences || consequences.length === 0) {
    return {
      byDayOfWeek: [],
      byTimeOfDay: [],
      byMonth: [],
    };
  }

  // Count by day of week
  const dayOfWeekCounts = new Map<number, number>();
  const timeOfDayCounts = new Map<number, number>();
  const monthCounts = new Map<string, number>();

  for (const consequence of consequences) {
    const date = new Date(consequence.created_at);

    // Day of week (0 = Sunday)
    const dayOfWeek = date.getDay();
    dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);

    // Time of day (hour)
    const hour = date.getHours();
    timeOfDayCounts.set(hour, (timeOfDayCounts.get(hour) || 0) + 1);

    // Month
    const month = date.toISOString().slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    byDayOfWeek: Array.from(dayOfWeekCounts.entries())
      .map(([day, count]) => ({ day: dayNames[day], count }))
      .sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day)),

    byTimeOfDay: Array.from(timeOfDayCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour),

    byMonth: Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  };
}
