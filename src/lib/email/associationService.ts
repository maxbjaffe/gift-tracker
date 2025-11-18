/**
 * AI Association Service
 * Uses Claude AI to analyze emails and create intelligent associations
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import type {
  SchoolEmail,
  EmailCategory,
  EmailPriority,
  CalendarEvent,
  EventType,
} from '@/types/email';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface EmailAnalysis {
  category: EmailCategory;
  priority: EmailPriority;
  action_required: boolean;
  confidence_score: number;
  summary: string;
  extracted_events?: Array<{
    title: string;
    description?: string;
    event_type: EventType;
    start_date: string;
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
    relevance_type: string;
    reasoning: string;
  }>;
}

export class AIAssociationService {
  /**
   * Analyze email using Claude AI
   */
  static async analyzeEmail(email: SchoolEmail, children: any[]): Promise<EmailAnalysis> {
    const emailContent = `
Subject: ${email.subject}
From: ${email.from_name || email.from_address}
Date: ${email.received_at}

Body:
${email.body_text || email.body_html?.replace(/<[^>]*>/g, '') || ''}
    `.trim();

    const childrenList = children.map(c => c.name).join(', ');

    const prompt = `You are an AI assistant helping parents manage school-related emails. Analyze the following email and provide structured information.

Children in family: ${childrenList || 'None specified'}

Email:
${emailContent}

Please analyze this email and return a JSON object with:
1. category: One of [school_notice, homework, event, permission, grade, behavior, sports, transportation, fundraising, other]
2. priority: One of [high, medium, low]
3. action_required: boolean - does this email require the parent to do something?
4. confidence_score: number between 0 and 1
5. summary: A brief 1-2 sentence summary
6. extracted_events: Array of events mentioned (if any) with format:
   - title, description, event_type, start_date (ISO), end_date (ISO, optional), all_day (boolean), location
7. extracted_actions: Array of action items (if any) with format:
   - action_type [deadline, rsvp, permission_form, payment, task, reminder, other], action_text, due_date (ISO, optional), priority
8. child_mentions: Array of which children this email relates to (if any) with format:
   - child_name, relevance_type [primary, mentioned, shared, class_wide], reasoning

Return ONLY valid JSON, no additional text.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      // Parse JSON response
      const analysis: EmailAnalysis = JSON.parse(responseText);

      return analysis;
    } catch (error) {
      console.error('Error analyzing email with AI:', error);

      // Return default analysis on error
      return {
        category: 'other',
        priority: 'medium',
        action_required: false,
        confidence_score: 0,
        summary: 'Error analyzing email',
      };
    }
  }

  /**
   * Process email and create all associations
   */
  static async processEmail(emailId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    try {
      // Get email
      const { data: email, error: emailError } = await supabase
        .from('school_emails')
        .select('*')
        .eq('id', emailId)
        .single();

      if (emailError || !email) {
        throw new Error('Email not found');
      }

      // Get user's children
      const { data: children } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', userId);

      // Analyze email with AI
      const analysis = await this.analyzeEmail(email, children || []);

      // Update email with AI analysis
      await supabase
        .from('school_emails')
        .update({
          ai_category: analysis.category,
          ai_priority: analysis.priority,
          ai_action_required: analysis.action_required,
          ai_confidence_score: analysis.confidence_score,
          ai_summary: analysis.summary,
          ai_processed_at: new Date().toISOString(),
        })
        .eq('id', emailId);

      // Create calendar events if any
      if (analysis.extracted_events && analysis.extracted_events.length > 0) {
        for (const eventData of analysis.extracted_events) {
          await this.createEventAssociation(emailId, userId, eventData);
        }
      }

      // Create action items if any
      if (analysis.extracted_actions && analysis.extracted_actions.length > 0) {
        for (const actionData of analysis.extracted_actions) {
          await supabase.from('email_actions').insert({
            email_id: emailId,
            user_id: userId,
            action_type: actionData.action_type,
            action_text: actionData.action_text,
            due_date: actionData.due_date,
            priority: actionData.priority,
          });
        }
      }

      // Create child associations if any
      if (analysis.child_mentions && analysis.child_mentions.length > 0 && children) {
        for (const mention of analysis.child_mentions) {
          const child = children.find(c =>
            c.name.toLowerCase() === mention.child_name.toLowerCase()
          );

          if (child) {
            await supabase.from('email_child_relevance').insert({
              email_id: emailId,
              child_id: child.id,
              user_id: userId,
              relevance_type: mention.relevance_type,
              ai_reasoning: mention.reasoning,
              extracted_child_name: mention.child_name,
              ai_confidence: analysis.confidence_score,
              is_verified: false,
              is_rejected: false,
            });
          }
        }
      }

      console.log(`Processed email ${emailId} successfully`);
    } catch (error) {
      console.error('Error processing email:', error);
      throw error;
    }
  }

  /**
   * Create calendar event and association
   */
  private static async createEventAssociation(
    emailId: string,
    userId: string,
    eventData: any
  ): Promise<void> {
    const supabase = await createClient();

    try {
      // Create calendar event
      const { data: event, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.event_type,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          all_day: eventData.all_day,
          location: eventData.location,
          source: 'email',
          source_email_id: emailId,
          is_confirmed: false, // Requires user confirmation
        })
        .select()
        .single();

      if (eventError) {
        console.error('Error creating event:', eventError);
        return;
      }

      // Create association
      await supabase.from('email_event_associations').insert({
        email_id: emailId,
        event_id: event.id,
        user_id: userId,
        association_type: 'creates_event',
        ai_confidence: 0.8,
        ai_reasoning: 'Event extracted from email content',
        is_verified: false,
      });

      console.log(`Created event ${event.id} from email ${emailId}`);
    } catch (error) {
      console.error('Error in createEventAssociation:', error);
    }
  }

  /**
   * Process multiple emails in batch
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
      } catch (error: any) {
        failed++;
        errors.push(`Email ${emailId}: ${error.message}`);
      }
    }

    return { processed, failed, errors };
  }

  /**
   * Find similar existing events for an email
   */
  static async findSimilarEvents(
    email: SchoolEmail,
    userId: string
  ): Promise<CalendarEvent[]> {
    const supabase = await createClient();

    // Simple keyword matching - could be enhanced with vector search
    const keywords = email.subject
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3);

    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${keywords[0]}%`); // Simple matching

    return events || [];
  }

  /**
   * Submit user feedback on classification
   */
  static async submitFeedback(
    emailId: string,
    userId: string,
    fieldName: string,
    aiValue: string,
    userValue: string,
    feedbackText?: string
  ): Promise<void> {
    const supabase = await createClient();

    // Get email details for ML training
    const { data: email } = await supabase
      .from('school_emails')
      .select('subject, from_address')
      .eq('id', emailId)
      .single();

    await supabase.from('email_classification_feedback').insert({
      email_id: emailId,
      user_id: userId,
      field_name: fieldName,
      ai_value: aiValue,
      user_value: userValue,
      feedback_text: feedbackText,
      email_subject: email?.subject,
      email_from: email?.from_address,
    });

    console.log(`Feedback submitted for email ${emailId}`);
  }

  /**
   * Verify or reject an association
   */
  static async verifyAssociation(
    associationId: string,
    associationType: 'event' | 'child',
    isVerified: boolean,
    feedback?: string
  ): Promise<void> {
    const supabase = await createClient();

    const tableName = associationType === 'event'
      ? 'email_event_associations'
      : 'email_child_relevance';

    await supabase
      .from(tableName)
      .update({
        is_verified: isVerified,
        is_rejected: !isVerified,
        user_feedback: feedback,
      })
      .eq('id', associationId);

    console.log(`Association ${associationId} ${isVerified ? 'verified' : 'rejected'}`);
  }
}
