/**
 * AI Email Suggestions API
 * GET /api/children/[id]/suggestions - Get AI-suggested emails for a child
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

    // Get emails not yet associated with this child
    const { data: allEmails } = await supabase
      .from('school_emails')
      .select(`
        id,
        subject,
        from_name,
        from_address,
        body_text,
        ai_category,
        ai_priority,
        ai_summary,
        received_at,
        child_relevance:email_child_relevance(child_id)
      `)
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(100);

    if (!allEmails) {
      return NextResponse.json({ suggestions: [] });
    }

    // Filter out emails already associated with this child
    const unassociated = allEmails.filter(
      email => !email.child_relevance?.some((rel: any) => rel.child_id === params.id)
    );

    // AI-powered suggestions based on child's info
    const suggestions = unassociated
      .map(email => {
        let confidence = 0;
        const reasons: string[] = [];

        // Check for child name mention in subject or body
        const childNameLower = child.name.toLowerCase();
        if (email.subject?.toLowerCase().includes(childNameLower)) {
          confidence += 40;
          reasons.push(`${child.name} mentioned in subject`);
        }
        if (email.body_text?.toLowerCase().includes(childNameLower)) {
          confidence += 30;
          reasons.push(`${child.name} mentioned in email`);
        }

        // Check for grade mention
        if (child.grade) {
          const gradeLower = child.grade.toLowerCase();
          if (
            email.subject?.toLowerCase().includes(gradeLower) ||
            email.body_text?.toLowerCase().includes(gradeLower)
          ) {
            confidence += 25;
            reasons.push(`Grade ${child.grade} mentioned`);
          }
        }

        // Check for teacher mention
        if (child.teacher) {
          const teacherName = child.teacher.toLowerCase();
          if (
            email.from_name?.toLowerCase().includes(teacherName) ||
            email.from_address?.toLowerCase().includes(teacherName)
          ) {
            confidence += 35;
            reasons.push(`From ${child.name}'s teacher`);
          }
        }

        // Check interests match (if available)
        if (child.interests && Array.isArray(child.interests)) {
          for (const interest of child.interests) {
            const interestLower = interest.toLowerCase();
            if (
              email.subject?.toLowerCase().includes(interestLower) ||
              email.body_text?.toLowerCase().includes(interestLower)
            ) {
              confidence += 15;
              reasons.push(`Related to interest: ${interest}`);
              break; // Only count first match
            }
          }
        }

        // Category-based scoring
        if (email.ai_category === 'homework' || email.ai_category === 'grade') {
          confidence += 10;
          reasons.push('Homework/grade related');
        }

        return {
          email,
          confidence: Math.min(confidence, 100),
          reasons,
        };
      })
      .filter(s => s.confidence > 20) // Only show if confidence > 20%
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Top 20 suggestions

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Error in GET /api/children/[id]/suggestions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
