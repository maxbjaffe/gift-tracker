'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Settings } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  allDay: boolean;
  category?: string;
  location?: string;
  color?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  async function loadEvents() {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await fetch(
        `/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              {format(currentMonth, 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/calendar/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            Previous Month
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            Next Month
          </Button>
        </div>

        {/* Events List View (Simple for now) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Events this Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No events this month. Add calendar subscriptions in{' '}
                <Link href="/calendar/settings" className="text-blue-600 underline">
                  Settings
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(eventsByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dayEvents]) => (
                    <div key={date}>
                      <h3 className="font-semibold text-lg mb-2">
                        {format(new Date(date), 'EEEE, MMMM d')}
                      </h3>
                      <div className="space-y-2 ml-4">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white border"
                            style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-gray-600">
                                {event.allDay
                                  ? 'All day'
                                  : `${format(new Date(event.startTime), 'h:mm a')}${
                                      event.endTime
                                        ? ` - ${format(new Date(event.endTime), 'h:mm a')}`
                                        : ''
                                    }`}
                                {event.location && ` • ${event.location}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
