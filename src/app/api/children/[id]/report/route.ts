/**
 * Child Monthly Report API
 * GET /api/children/[id]/report - Generate monthly activity report for a child
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range from query params (default to last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get all emails associated with this child
    const { data: emailAssociations } = await supabase
      .from('email_child_relevance')
      .select(`
        email_id,
        relevance_type,
        is_verified,
        created_at,
        email:school_emails(
          id,
          subject,
          from_name,
          from_address,
          body_text,
          ai_category,
          ai_priority,
          ai_summary,
          received_at,
          is_read
        )
      `)
      .eq('child_id', params.id);

    // Filter by date range in JavaScript (can't filter on nested relations in Supabase)
    const filteredAssociations = (emailAssociations as any[])?.filter((a: any) => {
      if (!a.email?.received_at) return false;
      return new Date(a.email.received_at) >= startDate;
    }) || [];

    const emails = filteredAssociations.map((a: any) => a.email).filter(Boolean);

    // Calculate statistics
    const totalEmails = emails.length;
    const unreadEmails = emails.filter((e: any) => !e.is_read).length;
    const verifiedAssociations = filteredAssociations.filter((a: any) => a.is_verified).length;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    emails.forEach((email: any) => {
      const category = email.ai_category || 'uncategorized';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Priority breakdown
    const priorityBreakdown: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };
    emails.forEach((email: any) => {
      const priority = email.ai_priority || 'low';
      priorityBreakdown[priority] = (priorityBreakdown[priority] || 0) + 1;
    });

    // Top senders
    const senderCounts: Record<string, { name: string; email: string; count: number }> = {};
    emails.forEach((email: any) => {
      const senderEmail = email.from_address || 'unknown';
      if (!senderCounts[senderEmail]) {
        senderCounts[senderEmail] = {
          name: email.from_name || senderEmail,
          email: senderEmail,
          count: 0,
        };
      }
      senderCounts[senderEmail].count++;
    });
    const topSenders = Object.values(senderCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Weekly activity (last 4 weeks)
    const weeklyActivity: { week: string; count: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const count = emails.filter((e: any) => {
        const date = new Date(e.received_at);
        return date >= weekStart && date < weekEnd;
      }).length;
      weeklyActivity.unshift({
        week: `Week ${4 - i}`,
        count,
      });
    }

    // Recent highlights (high priority unread emails)
    const highlights = emails
      .filter((e: any) => !e.is_read && e.ai_priority === 'high')
      .sort((a: any, b: any) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, 5)
      .map((e: any) => ({
        id: e.id,
        subject: e.subject,
        from_name: e.from_name,
        summary: e.ai_summary,
        category: e.ai_category,
        received_at: e.received_at,
      }));

    // Activity trends
    const homeworkCount = emails.filter((e: any) => e.ai_category === 'homework').length;
    const gradeCount = emails.filter((e: any) => e.ai_category === 'grade').length;
    const eventCount = emails.filter((e: any) => e.ai_category === 'event').length;

    // Compare to previous period
    const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
    const { data: previousEmails } = await supabase
      .from('email_child_relevance')
      .select(`email:school_emails(id, received_at)`)
      .eq('child_id', params.id);

    // Filter by date range in JavaScript
    const previousCount = (previousEmails as any[])?.filter((e: any) => {
      if (!e.email?.received_at) return false;
      const date = new Date(e.email.received_at);
      return date >= previousPeriodStart && date < startDate;
    }).length || 0;
    const trend = previousCount === 0
      ? 0
      : Math.round(((totalEmails - previousCount) / previousCount) * 100);

    return NextResponse.json({
      child: {
        id: (child as any).id,
        name: (child as any).name,
        grade: (child as any).grade,
        teacher: (child as any).teacher,
      },
      period: {
        days,
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      summary: {
        totalEmails,
        unreadEmails,
        verifiedAssociations,
        trend, // % change from previous period
      },
      categoryBreakdown,
      priorityBreakdown,
      topSenders,
      weeklyActivity,
      highlights,
      activityCounts: {
        homework: homeworkCount,
        grades: gradeCount,
        events: eventCount,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/children/[id]/report:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
