/**
 * AI Email Analysis Service
 * Uses Claude AI to analyze school emails and extract structured data
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import type { SchoolEmail, EmailCategory, EmailPriority } from '@/types/email';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface EmailAnalysisResult {
  category: EmailCategory;
  priority: EmailPriority;
  action_required: boolean;
  summary: string;
  confidence_score: number;
  extracted_events?: Array<{
    title: string;
    description?: string;
    event_type: string;
    start_date?: string;
    end_date?: string;
    all_day: boolean;
    location?: string;
  }>;
  extracted_actions?: Array<{
    action_type: string;
    action_text: string;
    due_date?: string;
    priority: EmailPriority;
  }>;
  child_mentions?: Array<{
    child_name: string;
    relevance_type: 'primary' | 'mentioned' | 'shared' | 'class_wide';
    confidence: number;
    reasoning: string;
  }>;
}

/**
 * AI Email Analysis Service
 */
export class AIAnalysisService {
  /**
   * Get past email-child associations to help AI learn patterns
   */
  static async getPastAssociations(userId: string): Promise<string> {
    const supabase = await createClient();

    // Get recent emails with manual child associations (limit to 50 most recent)
    const { data: associations } = await supabase
      .from('email_child_relevance')
      .select(`
        email:school_emails(from_address, from_name, subject),
        child:children(name),
        relevance_type,
        manually_set
      `)
      .eq('user_id', userId)
      .eq('manually_set', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!associations || associations.length === 0) {
      return '';
    }

    // Build learning examples string
    let learningStr = '\n\nPAST ASSOCIATIONS (learn from these patterns):\n';
    for (const assoc of associations) {
      if (assoc.email && assoc.child) {
        learningStr += `- "${(assoc.email as any).subject}" from ${(assoc.email as any).from_name || (assoc.email as any).from_address} → ${(assoc.child as any).name} (${assoc.relevance_type})\n`;
      }
    }

    return learningStr;
  }

  /**
   * Analyze a single email with Claude AI
   */
  static async analyzeEmail(email: SchoolEmail, userId: string): Promise<EmailAnalysisResult> {
    const supabase = await createClient();

    console.log(`[AI Analysis] Starting analysis for email ${email.id}, user ${userId}`);

    // Load children for this user dynamically
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('name, age, grade, notes')
      .eq('user_id', userId);

    if (childrenError) {
      console.error('[AI Analysis] Error loading children:', childrenError);
      throw new Error(`Failed to load children: ${childrenError.message}`);
    }

    if (!children || children.length === 0) {
      console.error('[AI Analysis] No children found for user');
      throw new Error('No children found for user. Please add children first.');
    }

    console.log(`[AI Analysis] Loaded ${children.length} children for user`);

    // Build children description
    let childrenDesc = '';
    for (const child of children) {
      childrenDesc += `- ${child.name}`;
      if (child.grade) childrenDesc += ` (${child.grade})`;
      if (child.notes) childrenDesc += `, ${child.notes}`;
      childrenDesc += '\n';
    }

    // Get past associations for learning
    const pastAssociations = await this.getPastAssociations(userId);

    const prompt = `You are analyzing a school email for a family with ${children.length} ${children.length === 1 ? 'child' : 'children'}:
${childrenDesc}${pastAssociations}

Analyze this email and extract structured information:

FROM: ${email.from_name || email.from_address}
SUBJECT: ${email.subject}
DATE: ${new Date(email.received_at).toLocaleDateString()}

EMAIL BODY:
${email.body_text || email.body_html || '(No content)'}

Please analyze and return a JSON object with:
{
  "category": one of: school_notice, homework, event, permission, grade, behavior, sports, transportation, fundraising, other
  "priority": "high", "medium", or "low"
  "action_required": true/false (does this require parent action?)
  "summary": "1-2 sentence summary of the email"
  "confidence_score": 0.0-1.0 (how confident are you in this analysis)
  "extracted_events": [
    {
      "title": "event name",
      "description": "event details",
      "event_type": "assignment, test, school_event, sports, meeting, holiday, deadline, other",
      "start_date": "YYYY-MM-DD" or "YYYY-MM-DD HH:mm" if time known,
      "end_date": optional end date,
      "all_day": true/false,
      "location": optional location
    }
  ],
  "extracted_actions": [
    {
      "action_type": "deadline, rsvp, permission_form, payment, task, reminder, other",
      "action_text": "description of what needs to be done",
      "due_date": "YYYY-MM-DD" or "YYYY-MM-DD HH:mm" if known,
      "priority": "high", "medium", or "low"
    }
  ],
  "child_mentions": [
    {
      "child_name": one of: ${children.map(c => `"${c.name}"`).join(', ')},
      "relevance_type": "primary" (email is about this child), "mentioned" (child mentioned), "shared" (applies to multiple kids), or "class_wide" (whole class/grade),
      "confidence": 0.0-1.0,
      "reasoning": "why you think this email relates to this child"
    }
  ]
}

Use the past associations to learn patterns - if you see similar senders, subjects, or content, apply the same child associations. But always use your judgment - the past associations are hints, not rules.

Return ONLY the JSON object, no other text.`;

    try {
      console.log(`[AI Analysis] Calling Claude API for email: ${email.subject}`);

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      console.log(`[AI Analysis] Got response from Claude, parsing JSON...`);

      // Parse JSON response
      const analysis: EmailAnalysisResult = JSON.parse(responseText);

      console.log('[AI Analysis] Analysis complete:', {
        subject: email.subject,
        category: analysis.category,
        priority: analysis.priority,
        confidence: analysis.confidence_score,
      });

      return analysis;
    } catch (error) {
      console.error('[AI Analysis] Error analyzing email with AI:', error);
      console.error('[AI Analysis] Email details:', {
        id: email.id,
        subject: email.subject,
        from: email.from_address,
      });
      throw error;
    }
  }

  /**
   * Save AI analysis results to database
   */
  static async saveAnalysis(emailId: string, userId: string, analysis: EmailAnalysisResult): Promise<void> {
    const supabase = await createClient();

    try {
      // Update email with AI analysis
      const { error: emailError } = await supabase
        .from('school_emails')
        .update({
          ai_category: analysis.category,
          ai_priority: analysis.priority,
          ai_action_required: analysis.action_required,
          ai_summary: analysis.summary,
          ai_confidence_score: analysis.confidence_score,
          ai_processed_at: new Date().toISOString(),
        })
        .eq('id', emailId);

      if (emailError) {
        console.error('Error updating email with AI analysis:', emailError);
        throw emailError;
      }

      // Save extracted actions
      if (analysis.extracted_actions && analysis.extracted_actions.length > 0) {
        const actions = analysis.extracted_actions.map(action => ({
          email_id: emailId,
          user_id: userId,
          action_type: action.action_type,
          action_text: action.action_text,
          due_date: action.due_date || null,
          priority: action.priority,
        }));

        const { error: actionsError } = await supabase
          .from('email_actions')
          .insert(actions);

        if (actionsError) {
          console.error('Error saving email actions:', actionsError);
        }
      }

      // Save extracted events
      if (analysis.extracted_events && analysis.extracted_events.length > 0) {
        const events = analysis.extracted_events.map(event => ({
          user_id: userId,
          title: event.title,
          description: event.description,
          event_type: event.event_type,
          start_date: event.start_date,
          end_date: event.end_date,
          all_day: event.all_day,
          location: event.location,
          source: 'email' as const,
          source_email_id: emailId,
        }));

        const { data: savedEvents, error: eventsError } = await supabase
          .from('calendar_events')
          .insert(events)
          .select();

        if (eventsError) {
          console.error('Error saving calendar events:', eventsError);
        } else if (savedEvents) {
          // Create email-event associations
          const associations = savedEvents.map(event => ({
            email_id: emailId,
            event_id: event.id,
            user_id: userId,
            association_type: 'creates_event' as const,
            ai_confidence: analysis.confidence_score,
          }));

          await supabase.from('email_event_associations').insert(associations);
        }
      }

      // Save child mentions
      if (analysis.child_mentions && analysis.child_mentions.length > 0) {
        // First, get the children IDs by name
        const { data: children } = await supabase
          .from('children')
          .select('id, name')
          .eq('user_id', userId);

        if (children) {
          const relevances = [];

          for (const mention of analysis.child_mentions) {
            const child = children.find(c => c.name.toLowerCase() === mention.child_name.toLowerCase());

            if (child) {
              relevances.push({
                email_id: emailId,
                child_id: child.id,
                user_id: userId,
                relevance_type: mention.relevance_type,
                ai_confidence: mention.confidence,
                ai_reasoning: mention.reasoning,
                extracted_child_name: mention.child_name,
              });
            }
          }

          if (relevances.length > 0) {
            const { error: relevanceError } = await supabase
              .from('email_child_relevance')
              .insert(relevances);

            if (relevanceError) {
              console.error('Error saving child relevance:', relevanceError);
            }
          }
        }
      }

      console.log('AI analysis saved successfully for email:', emailId);
    } catch (error) {
      console.error('Error saving AI analysis:', error);
      throw error;
    }
  }

  /**
   * Process a single email: analyze and save
   */
  static async processEmail(emailId: string, userId: string): Promise<EmailAnalysisResult> {
    const supabase = await createClient();

    // Get email
    const { data: email, error } = await supabase
      .from('school_emails')
      .select('*')
      .eq('id', emailId)
      .eq('user_id', userId)
      .single();

    if (error || !email) {
      throw new Error('Email not found');
    }

    // Analyze with AI
    const analysis = await this.analyzeEmail(email, userId);

    // Save results
    await this.saveAnalysis(emailId, userId, analysis);

    return analysis;
  }

  /**
   * Batch process multiple emails
   */
  static async processBatch(emailIds: string[], userId: string): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const emailId of emailIds) {
      try {
        await this.processEmail(emailId, userId);
        processed++;

        // Small delay to avoid rate limiting (100ms between emails)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        failed++;
        errors.push(`Email ${emailId}: ${error.message}`);
        console.error(`Failed to process email ${emailId}:`, error);
      }
    }

    return { processed, failed, errors };
  }

  /**
   * Process all unprocessed emails for a user
   */
  static async processAllUnprocessed(userId: string, limit = 10): Promise<{
    processed: number;
    failed: number;
    errors: string[];
    remaining: number;
  }> {
    const supabase = await createClient();

    // Get unprocessed emails
    const { data: emails, error } = await supabase
      .from('school_emails')
      .select('id')
      .eq('user_id', userId)
      .is('ai_processed_at', null)
      .limit(limit);

    if (error || !emails) {
      throw new Error('Failed to fetch unprocessed emails');
    }

    const emailIds = emails.map(e => e.id);
    const result = await this.processBatch(emailIds, userId);

    // Count remaining unprocessed emails
    const { count } = await supabase
      .from('school_emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('ai_processed_at', null);

    return {
      ...result,
      remaining: count || 0,
    };
  }
}
