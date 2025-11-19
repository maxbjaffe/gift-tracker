/**
 * iCal Parser Service
 * Fetches and parses .ics calendar feeds from public URLs
 */

import * as ical from 'node-ical';

export interface ParsedEvent {
  externalId: string; // UID from iCal (for deduplication)
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime?: Date;
  allDay: boolean;
  recurrenceRule?: string; // RRULE if present
  status?: string; // CONFIRMED, TENTATIVE, CANCELLED
  organizer?: string;
  attendees?: string[];
  metadata?: Record<string, any>;
}

export interface ParsedCalendar {
  events: ParsedEvent[];
  calendarName?: string;
  timezone?: string;
}

/**
 * Fetch and parse an iCal feed from a URL
 */
export async function fetchAndParseIcal(url: string): Promise<ParsedCalendar> {
  try {
    // Fetch the .ics file
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Family-Hub-Calendar/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
    }

    const icsContent = await response.text();

    // Parse the iCal data
    const parsedData = ical.parseICS(icsContent);

    const events: ParsedEvent[] = [];
    let calendarName: string | undefined;
    let timezone: string | undefined;

    // Process each component in the calendar
    for (const key in parsedData) {
      const component = parsedData[key];

      // Extract calendar metadata
      if (component.type === 'VCALENDAR') {
        calendarName = component['x-wr-calname']?.toString() || component['x-wr-timezone']?.toString();
        timezone = component['x-wr-timezone']?.toString();
      }

      // Extract events
      if (component.type === 'VEVENT') {
        try {
          const event = parseEvent(component);
          if (event) {
            events.push(event);
          }
        } catch (error) {
          console.error('Error parsing individual event:', error);
          // Continue processing other events
        }
      }
    }

    return {
      events,
      calendarName,
      timezone,
    };
  } catch (error) {
    console.error('Error fetching/parsing iCal:', error);
    throw error;
  }
}

/**
 * Parse a single VEVENT component into our event format
 */
function parseEvent(component: any): ParsedEvent | null {
  try {
    // Required fields
    if (!component.uid || !component.start) {
      console.warn('Event missing required fields (uid or start):', component);
      return null;
    }

    // Determine if all-day event
    const allDay = component.start?.dateOnly === true ||
                   (typeof component.start === 'string' && component.start.length === 8); // YYYYMMDD format

    // Parse start time
    const startTime = component.start instanceof Date
      ? component.start
      : new Date(component.start);

    // Parse end time
    let endTime: Date | undefined;
    if (component.end) {
      endTime = component.end instanceof Date
        ? component.end
        : new Date(component.end);
    } else if (component.duration) {
      // Calculate end time from duration
      endTime = new Date(startTime.getTime() + parseDuration(component.duration));
    }

    // Extract recurrence rule
    let recurrenceRule: string | undefined;
    if (component.rrule) {
      recurrenceRule = component.rrule.toString();
    }

    // Parse attendees
    const attendees: string[] = [];
    if (component.attendee) {
      if (Array.isArray(component.attendee)) {
        attendees.push(...component.attendee.map((a: any) => a.val || a));
      } else {
        attendees.push(component.attendee.val || component.attendee);
      }
    }

    return {
      externalId: component.uid,
      title: component.summary || 'Untitled Event',
      description: component.description || undefined,
      location: component.location || undefined,
      startTime,
      endTime,
      allDay,
      recurrenceRule,
      status: component.status || undefined,
      organizer: component.organizer?.val || component.organizer || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      metadata: {
        created: component.created,
        lastModified: component.lastmodified,
        sequence: component.sequence,
        url: component.url,
        categories: component.categories,
      },
    };
  } catch (error) {
    console.error('Error parsing event component:', error);
    return null;
  }
}

/**
 * Parse iCal duration string to milliseconds
 */
function parseDuration(duration: string | number): number {
  if (typeof duration === 'number') {
    return duration;
  }

  // Simple duration parser for common formats
  // Format: P[n]D or PT[n]H[n]M[n]S
  const match = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return 3600000; // Default 1 hour
  }

  const [, days, hours, minutes, seconds] = match;
  let ms = 0;

  if (days) ms += parseInt(days) * 24 * 60 * 60 * 1000;
  if (hours) ms += parseInt(hours) * 60 * 60 * 1000;
  if (minutes) ms += parseInt(minutes) * 60 * 1000;
  if (seconds) ms += parseInt(seconds) * 1000;

  return ms || 3600000; // Default 1 hour if nothing parsed
}

/**
 * Get upcoming events from a parsed calendar
 */
export function getUpcomingEvents(
  parsedCalendar: ParsedCalendar,
  daysAhead: number = 30
): ParsedEvent[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return parsedCalendar.events
    .filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= now && eventStart <= futureDate;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

/**
 * Get events for a specific date range
 */
export function getEventsInRange(
  parsedCalendar: ParsedCalendar,
  startDate: Date,
  endDate: Date
): ParsedEvent[] {
  return parsedCalendar.events
    .filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;

      // Event overlaps with range if:
      // - Event starts before range ends AND
      // - Event ends after range starts
      return eventStart <= endDate && eventEnd >= startDate;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}
