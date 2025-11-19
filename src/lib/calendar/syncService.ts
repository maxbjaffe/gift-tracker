/**
 * Calendar Sync Service
 * Syncs iCal feeds and updates the database
 */

import { createClient } from '@supabase/supabase-js';
import { fetchAndParseIcal, ParsedEvent } from './icalParser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface SyncResult {
  subscriptionId: string;
  subscriptionName: string;
  success: boolean;
  eventsAdded: number;
  eventsUpdated: number;
  eventsRemoved: number;
  error?: string;
}

/**
 * Sync a single calendar subscription
 */
export async function syncCalendarSubscription(
  subscriptionId: string,
  userId: string
): Promise<SyncResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('calendar_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      throw new Error(`Subscription not found: ${subError?.message}`);
    }

    if (!subscription.is_active) {
      return {
        subscriptionId,
        subscriptionName: subscription.name,
        success: true,
        eventsAdded: 0,
        eventsUpdated: 0,
        eventsRemoved: 0,
        error: 'Subscription is inactive',
      };
    }

    // Fetch and parse the iCal feed
    console.log(`[Sync] Fetching calendar: ${subscription.name}`);
    const parsedCalendar = await fetchAndParseIcal(subscription.ical_url);

    // Get existing events for this subscription
    const { data: existingEvents } = await supabase
      .from('calendar_events')
      .select('id, external_id')
      .eq('user_id', userId)
      .eq('source_type', 'ical')
      .eq('source_id', subscriptionId);

    const existingEventMap = new Map(
      existingEvents?.map(e => [e.external_id, e.id]) || []
    );

    const currentExternalIds = new Set(parsedCalendar.events.map(e => e.externalId));

    let eventsAdded = 0;
    let eventsUpdated = 0;
    let eventsRemoved = 0;

    // Insert or update events
    for (const event of parsedCalendar.events) {
      const existingEventId = existingEventMap.get(event.externalId);

      const eventData = {
        user_id: userId,
        source_type: 'ical' as const,
        source_id: subscriptionId,
        external_id: event.externalId,
        title: event.title,
        description: event.description,
        location: event.location,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime?.toISOString(),
        all_day: event.allDay,
        recurrence_rule: event.recurrenceRule,
        category: inferCategory(event),
        color: subscription.color,
        is_cancelled: event.status === 'CANCELLED',
        metadata: event.metadata,
      };

      if (existingEventId) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', existingEventId);

        if (updateError) {
          console.error('Error updating event:', updateError);
        } else {
          eventsUpdated++;
        }
      } else {
        // Insert new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error('Error inserting event:', insertError);
        } else {
          eventsAdded++;
        }
      }
    }

    // Remove events that are no longer in the feed
    for (const [externalId, eventId] of existingEventMap) {
      if (!currentExternalIds.has(externalId)) {
        const { error: deleteError } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', eventId);

        if (deleteError) {
          console.error('Error deleting event:', deleteError);
        } else {
          eventsRemoved++;
        }
      }
    }

    // Update subscription sync status
    await supabase
      .from('calendar_subscriptions')
      .update({
        last_synced_at: new Date().toISOString(),
        sync_status: 'success',
        sync_error: null,
      })
      .eq('id', subscriptionId);

    console.log(
      `[Sync] ${subscription.name}: +${eventsAdded} ~${eventsUpdated} -${eventsRemoved}`
    );

    return {
      subscriptionId,
      subscriptionName: subscription.name,
      success: true,
      eventsAdded,
      eventsUpdated,
      eventsRemoved,
    };
  } catch (error) {
    console.error(`[Sync] Error syncing subscription ${subscriptionId}:`, error);

    // Update subscription with error status
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from('calendar_subscriptions')
      .update({
        sync_status: 'error',
        sync_error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', subscriptionId);

    return {
      subscriptionId,
      subscriptionName: 'Unknown',
      success: false,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsRemoved: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync all active calendar subscriptions for a user
 */
export async function syncAllUserCalendars(userId: string): Promise<SyncResult[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all active subscriptions for the user
  const { data: subscriptions, error } = await supabase
    .from('calendar_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !subscriptions) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  // Sync each subscription
  const results: SyncResult[] = [];
  for (const sub of subscriptions) {
    const result = await syncCalendarSubscription(sub.id, userId);
    results.push(result);
  }

  return results;
}

/**
 * Sync all calendar subscriptions (for cron job)
 */
export async function syncAllCalendars(): Promise<SyncResult[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all active subscriptions
  const { data: subscriptions, error } = await supabase
    .from('calendar_subscriptions')
    .select('id, user_id')
    .eq('is_active', true);

  if (error || !subscriptions) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  console.log(`[Sync] Starting sync for ${subscriptions.length} subscriptions`);

  // Sync each subscription
  const results: SyncResult[] = [];
  for (const sub of subscriptions) {
    const result = await syncCalendarSubscription(sub.id, sub.user_id);
    results.push(result);
  }

  const totalAdded = results.reduce((sum, r) => sum + r.eventsAdded, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.eventsUpdated, 0);
  const totalRemoved = results.reduce((sum, r) => sum + r.eventsRemoved, 0);
  const failed = results.filter(r => !r.success).length;

  console.log(
    `[Sync] Complete: ${results.length} calendars, +${totalAdded} ~${totalUpdated} -${totalRemoved}, ${failed} failed`
  );

  return results;
}

/**
 * Infer event category from title and description
 */
function inferCategory(event: ParsedEvent): string {
  const text = `${event.title} ${event.description || ''}`.toLowerCase();

  // School-related keywords
  if (
    text.includes('school') ||
    text.includes('class') ||
    text.includes('homework') ||
    text.includes('test') ||
    text.includes('exam') ||
    text.includes('pta') ||
    text.includes('teacher')
  ) {
    return 'school';
  }

  // Sports keywords
  if (
    text.includes('practice') ||
    text.includes('game') ||
    text.includes('tournament') ||
    text.includes('sport') ||
    text.includes('soccer') ||
    text.includes('basketball') ||
    text.includes('baseball')
  ) {
    return 'sports';
  }

  // Birthday keywords
  if (text.includes('birthday') || text.includes('bday')) {
    return 'birthday';
  }

  // Work keywords
  if (text.includes('meeting') || text.includes('work') || text.includes('office')) {
    return 'work';
  }

  // Default to family
  return 'family';
}
