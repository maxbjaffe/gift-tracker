import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DetectedPattern {
  type: 'time_based' | 'category_based' | 'behavioral' | 'effectiveness';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedChildren: string[];
  recommendation: string;
  confidence: number; // 0-100
}

export interface CommitmentPattern {
  pattern: string;
  description: string;
  frequency: number;
  childrenAffected: string[];
}

/**
 * Detect patterns in commitment performance
 */
export async function detectCommitmentPatterns(
  userId: string
): Promise<DetectedPattern[]> {
  const supabase = await createClient();
  const patterns: DetectedPattern[] = [];

  // Get all children
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (!children || children.length === 0) {
    return [];
  }

  // Pattern 1: Consistent time-of-day failures
  const timePatterns = await detectTimeBasedPatterns(userId, children);
  patterns.push(...timePatterns);

  // Pattern 2: Category-specific struggles
  const categoryPatterns = await detectCategoryPatterns(userId, children);
  patterns.push(...categoryPatterns);

  // Pattern 3: Declining reliability trend
  const trendPatterns = await detectTrendPatterns(userId, children);
  patterns.push(...trendPatterns);

  // Pattern 4: Weekend vs weekday performance
  const dayPatterns = await detectDayOfWeekPatterns(userId, children);
  patterns.push(...dayPatterns);

  return patterns.sort((a, b) => {
    // Sort by severity, then confidence
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.confidence - a.confidence;
  });
}

/**
 * Detect time-based patterns (e.g., missing evening commitments)
 */
async function detectTimeBasedPatterns(
  userId: string,
  children: Array<{ id: string; name: string }>
): Promise<DetectedPattern[]> {
  const supabase = await createClient();
  const patterns: DetectedPattern[] = [];

  for (const child of children) {
    // Get missed commitments
    const { data: missed } = await supabase
      .from('commitments')
      .select('due_date, commitment_text')
      .eq('child_id', child.id)
      .eq('status', 'missed')
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()); // 60 days

    if (!missed || missed.length < 3) continue;

    // Group by hour of day
    const hourCounts = new Map<number, number>();
    for (const m of missed) {
      const hour = new Date(m.due_date).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    // Find peak hour
    const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    if (peakHour && peakHour[1] >= 3) {
      const timeOfDay = peakHour[0] < 12 ? 'morning' : peakHour[0] < 17 ? 'afternoon' : 'evening';
      const confidence = Math.min(100, (peakHour[1] / missed.length) * 100);

      patterns.push({
        type: 'time_based',
        severity: confidence > 50 ? 'warning' : 'info',
        title: `${child.name}: ${timeOfDay} commitment struggles`,
        description: `${child.name} misses ${peakHour[1]} out of ${missed.length} commitments around ${peakHour[0]}:00`,
        affectedChildren: [child.name],
        recommendation: `Consider setting earlier deadlines or adding reminders 1 hour before ${timeOfDay} commitments.`,
        confidence: Math.round(confidence),
      });
    }
  }

  return patterns;
}

/**
 * Detect category-specific patterns (e.g., always missing homework)
 */
async function detectCategoryPatterns(
  userId: string,
  children: Array<{ id: string; name: string }>
): Promise<DetectedPattern[]> {
  const supabase = await createClient();
  const patterns: DetectedPattern[] = [];

  for (const child of children) {
    // Get commitments by category
    const { data: commitments } = await supabase
      .from('commitments')
      .select('category, status, completed_on_time')
      .eq('child_id', child.id)
      .in('status', ['completed', 'missed'])
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

    if (!commitments || commitments.length < 5) continue;

    // Group by category
    const categoryStats = new Map<string, { total: number; onTime: number; missed: number }>();

    for (const c of commitments) {
      const cat = c.category || 'other';
      if (!categoryStats.has(cat)) {
        categoryStats.set(cat, { total: 0, onTime: 0, missed: 0 });
      }

      const stats = categoryStats.get(cat)!;
      stats.total++;

      if (c.status === 'missed') {
        stats.missed++;
      } else if (c.completed_on_time === true) {
        stats.onTime++;
      }
    }

    // Find problematic categories (< 40% on-time completion)
    for (const [category, stats] of categoryStats) {
      if (stats.total < 3) continue;

      const onTimeRate = (stats.onTime / stats.total) * 100;

      if (onTimeRate < 40) {
        patterns.push({
          type: 'category_based',
          severity: onTimeRate < 20 ? 'critical' : 'warning',
          title: `${child.name}: ${category} completion issues`,
          description: `Only ${Math.round(onTimeRate)}% of ${category} commitments completed on time (${stats.onTime}/${stats.total})`,
          affectedChildren: [child.name],
          recommendation: `Break down ${category} tasks into smaller steps or provide additional support/structure.`,
          confidence: Math.min(100, (stats.total / 10) * 100),
        });
      }
    }
  }

  return patterns;
}

/**
 * Detect declining reliability trends
 */
async function detectTrendPatterns(
  userId: string,
  children: Array<{ id: string; name: string }>
): Promise<DetectedPattern[]> {
  const supabase = await createClient();
  const patterns: DetectedPattern[] = [];

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7) + '-01';

  for (const child of children) {
    // Get stats for current and last month
    const { data: stats } = await supabase
      .from('commitment_stats')
      .select('*')
      .eq('child_id', child.id)
      .in('month', [currentMonth, lastMonthStr])
      .order('month', { ascending: true });

    if (!stats || stats.length < 2) continue;

    const [last, current] = stats;
    const decline = (last.reliability_score || 0) - (current.reliability_score || 0);

    if (decline > 15) {
      patterns.push({
        type: 'behavioral',
        severity: decline > 30 ? 'critical' : 'warning',
        title: `${child.name}: Declining reliability`,
        description: `Reliability dropped from ${Math.round(last.reliability_score)}% to ${Math.round(current.reliability_score)}% (${Math.round(decline)}% decline)`,
        affectedChildren: [child.name],
        recommendation: `Schedule a check-in with ${child.name} to understand what's changed. Consider external stressors (school, friends, etc.).`,
        confidence: 90,
      });
    }
  }

  return patterns;
}

/**
 * Detect weekend vs weekday performance differences
 */
async function detectDayOfWeekPatterns(
  userId: string,
  children: Array<{ id: string; name: string }>
): Promise<DetectedPattern[]> {
  const supabase = await createClient();
  const patterns: DetectedPattern[] = [];

  for (const child of children) {
    const { data: commitments } = await supabase
      .from('commitments')
      .select('due_date, status, completed_on_time')
      .eq('child_id', child.id)
      .in('status', ['completed', 'missed'])
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

    if (!commitments || commitments.length < 10) continue;

    const weekdayStats = { total: 0, onTime: 0 };
    const weekendStats = { total: 0, onTime: 0 };

    for (const c of commitments) {
      const day = new Date(c.due_date).getDay();
      const isWeekend = day === 0 || day === 6;

      const stats = isWeekend ? weekendStats : weekdayStats;
      stats.total++;

      if (c.status === 'completed' && c.completed_on_time === true) {
        stats.onTime++;
      }
    }

    if (weekdayStats.total >= 5 && weekendStats.total >= 3) {
      const weekdayRate = (weekdayStats.onTime / weekdayStats.total) * 100;
      const weekendRate = (weekendStats.onTime / weekendStats.total) * 100;
      const diff = Math.abs(weekdayRate - weekendRate);

      if (diff > 25) {
        const better = weekdayRate > weekendRate ? 'weekdays' : 'weekends';
        const worse = weekdayRate > weekendRate ? 'weekends' : 'weekdays';

        patterns.push({
          type: 'time_based',
          severity: 'info',
          title: `${child.name}: ${better} vs ${worse} performance gap`,
          description: `${Math.round(weekdayRate)}% on-time on weekdays vs ${Math.round(weekendRate)}% on weekends`,
          affectedChildren: [child.name],
          recommendation: `Adjust commitment scheduling - ${child.name} performs better on ${better}.`,
          confidence: 80,
        });
      }
    }
  }

  return patterns;
}

/**
 * Generate AI-powered insights from patterns
 */
export async function generateInsights(
  patterns: DetectedPattern[],
  userId: string
): Promise<string> {
  if (patterns.length === 0) {
    return 'Great job! No concerning patterns detected. Keep up the consistent approach.';
  }

  const supabase = await createClient();

  // Get children names
  const { data: children } = await supabase
    .from('children')
    .select('name')
    .eq('user_id', userId);

  const childrenNames = children?.map((c) => c.name).join(', ') || 'your children';

  // Prepare data for Claude
  const patternsData = patterns
    .slice(0, 5) // Top 5 patterns
    .map((p) => ({
      type: p.type,
      severity: p.severity,
      title: p.title,
      description: p.description,
      children: p.affectedChildren,
    }));

  const prompt = `You are a family accountability coach. Based on the following patterns detected in commitment tracking for ${childrenNames}, provide a brief, actionable summary with 2-3 key insights and recommendations.

Patterns detected:
${JSON.stringify(patternsData, null, 2)}

Provide a concise summary (2-3 paragraphs max) that:
1. Highlights the most important pattern(s)
2. Suggests 1-2 concrete action steps
3. Ends on an encouraging note

Keep it brief, actionable, and parent-friendly.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : 'Unable to generate insights at this time.';
  } catch (error) {
    console.error('Error generating insights:', error);
    return patterns[0]?.recommendation || 'Check back later for insights.';
  }
}
