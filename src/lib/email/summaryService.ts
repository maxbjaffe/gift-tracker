/**
 * Summary Generation Service
 * Generates AI-powered monthly email summaries
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import type { MonthlySummary, EmailCategory } from '@/types/email';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface SummaryStats {
  totalEmails: number;
  byCategory: Record<string, number>;
  urgentCount: number;
  eventsCount: number;
  actionsCount: number;
}

export class SummaryGenerationService {
  /**
   * Generate monthly summary for a user (all children or specific child)
   */
  static async generateMonthlySummary(
    userId: string,
    year: number,
    month: number,
    childId?: string
  ): Promise<MonthlySummary> {
    const supabase = await createClient();

    try {
      // Get email data for the month
      const startDate = startOfMonth(new Date(year, month - 1, 1));
      const endDate = endOfMonth(startDate);

      let emailsQuery = supabase
        .from('school_emails')
        .select('*, child_relevance:email_child_relevance(*), actions:email_actions(*)')
        .eq('user_id', userId)
        .gte('received_at', startDate.toISOString())
        .lte('received_at', endDate.toISOString());

      // Filter by child if specified
      if (childId) {
        emailsQuery = emailsQuery.eq('email_child_relevance.child_id', childId);
      }

      const { data: emails, error: emailsError } = await emailsQuery;

      if (emailsError) {
        throw emailsError;
      }

      // Calculate statistics
      const stats = this.calculateStats(emails || []);

      // Get events for the month
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString());

      // Generate AI summary
      const summaryText = await this.generateAISummary(
        emails || [],
        events || [],
        stats,
        year,
        month,
        childId
      );

      // Find upcoming deadlines (next month)
      const upcomingDeadlines = this.extractUpcomingDeadlines(emails || []);

      // Check if summary already exists
      const { data: existing } = await supabase
        .from('monthly_summaries')
        .select('id, regenerated_count')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .is('child_id', childId || null)
        .single();

      let summary;

      if (existing) {
        // Update existing summary
        const { data: updated, error: updateError } = await supabase
          .from('monthly_summaries')
          .update({
            summary_text: summaryText,
            total_emails: stats.totalEmails,
            by_category: stats.byCategory,
            urgent_count: stats.urgentCount,
            events_count: stats.eventsCount,
            actions_count: stats.actionsCount,
            upcoming_deadlines: upcomingDeadlines,
            regenerated_count: existing.regenerated_count + 1,
            last_regenerated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        summary = updated;
      } else {
        // Create new summary
        const { data: created, error: createError } = await supabase
          .from('monthly_summaries')
          .insert({
            user_id: userId,
            child_id: childId,
            year,
            month,
            summary_text: summaryText,
            total_emails: stats.totalEmails,
            by_category: stats.byCategory,
            urgent_count: stats.urgentCount,
            events_count: stats.eventsCount,
            actions_count: stats.actionsCount,
            upcoming_deadlines: upcomingDeadlines,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        summary = created;
      }

      return summary;
    } catch (error) {
      console.error('Error generating monthly summary:', error);
      throw error;
    }
  }

  /**
   * Calculate email statistics
   */
  private static calculateStats(emails: any[]): SummaryStats {
    const byCategory: Record<string, number> = {};
    let urgentCount = 0;
    let eventsCount = 0;
    let actionsCount = 0;

    for (const email of emails) {
      // Count by category
      const category = email.ai_category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;

      // Count urgent
      if (email.ai_priority === 'high') {
        urgentCount++;
      }

      // Count actions
      if (email.actions && email.actions.length > 0) {
        actionsCount += email.actions.length;
      }
    }

    return {
      totalEmails: emails.length,
      byCategory,
      urgentCount,
      eventsCount,
      actionsCount,
    };
  }

  /**
   * Generate AI summary using Claude
   */
  private static async generateAISummary(
    emails: any[],
    events: any[],
    stats: SummaryStats,
    year: number,
    month: number,
    childId?: string
  ): Promise<string> {
    const monthName = format(new Date(year, month - 1, 1), 'MMMM yyyy');

    // Prepare email summaries
    const emailSummaries = emails
      .slice(0, 50) // Limit to avoid token limits
      .map(e => ({
        subject: e.subject,
        category: e.ai_category,
        summary: e.ai_summary,
        priority: e.ai_priority,
      }));

    const prompt = `Generate a concise monthly summary for a parent about their child's school emails.

Month: ${monthName}
${childId ? 'Child-specific summary' : 'Summary for all children'}

Statistics:
- Total emails: ${stats.totalEmails}
- By category: ${JSON.stringify(stats.byCategory)}
- Urgent emails: ${stats.urgentCount}
- Action items: ${stats.actionsCount}
- Events: ${events.length}

Recent emails (sample):
${JSON.stringify(emailSummaries, null, 2)}

Recent events:
${JSON.stringify(events.map(e => ({ title: e.title, date: e.start_date })), null, 2)}

Please write a friendly, informative summary that:
1. Highlights key themes and patterns
2. Calls out important deadlines or urgent matters
3. Summarizes the general school activity
4. Is 3-5 paragraphs long
5. Uses a warm, parent-friendly tone

Return ONLY the summary text, no additional formatting.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const summaryText = message.content[0].type === 'text'
        ? message.content[0].text
        : 'Summary generation failed';

      return summaryText;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return `Summary for ${monthName}: ${stats.totalEmails} emails received across ${Object.keys(stats.byCategory).length} categories, with ${stats.urgentCount} urgent items and ${stats.actionsCount} action items.`;
    }
  }

  /**
   * Extract upcoming deadlines from emails
   */
  private static extractUpcomingDeadlines(emails: any[]): Array<{ date: Date; description: string }> {
    const deadlines: Array<{ date: Date; description: string }> = [];
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    for (const email of emails) {
      if (email.actions && email.actions.length > 0) {
        for (const action of email.actions) {
          if (action.due_date) {
            const dueDate = new Date(action.due_date);
            if (dueDate > now && dueDate < threeMonthsFromNow) {
              deadlines.push({
                date: dueDate,
                description: action.action_text,
              });
            }
          }
        }
      }
    }

    // Sort by date
    deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Return top 10
    return deadlines.slice(0, 10);
  }

  /**
   * Generate summaries for all children for a given month
   */
  static async generateAllSummaries(userId: string, year: number, month: number): Promise<MonthlySummary[]> {
    const supabase = await createClient();

    // Get user's children
    const { data: children } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', userId);

    const summaries: MonthlySummary[] = [];

    // Generate overall summary
    const overallSummary = await this.generateMonthlySummary(userId, year, month);
    summaries.push(overallSummary);

    // Generate per-child summaries
    if (children && children.length > 0) {
      for (const child of children) {
        try {
          const childSummary = await this.generateMonthlySummary(
            userId,
            year,
            month,
            child.id
          );
          summaries.push(childSummary);
        } catch (error) {
          console.error(`Error generating summary for child ${child.id}:`, error);
        }
      }
    }

    return summaries;
  }

  /**
   * Get summary for a specific month
   */
  static async getSummary(
    userId: string,
    year: number,
    month: number,
    childId?: string
  ): Promise<MonthlySummary | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('monthly_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .is('child_id', childId || null)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Get all summaries for a user
   */
  static async getAllSummaries(userId: string): Promise<MonthlySummary[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('monthly_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching summaries:', error);
      return [];
    }

    return data || [];
  }
}
