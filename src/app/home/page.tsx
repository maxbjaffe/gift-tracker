'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Calendar,
  Gift,
  Target,
  Ban,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import Link from 'next/link';

interface WeatherData {
  location: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    conditionIcon: string;
    chanceOfRain: number;
  }>;
  alerts: Array<{
    headline: string;
    severity: string;
    event: string;
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  allDay: boolean;
  category?: string;
  sourceType: string;
  color?: string;
  location?: string;
}

interface Commitment {
  id: string;
  commitmentText: string;
  dueDate: string;
  status: string;
  child: { name: string };
}

interface Consequence {
  id: string;
  restrictionItem: string;
  expiresAt?: string;
  child: { name: string };
}

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      await Promise.all([
        loadWeather(),
        loadEvents(),
        loadAccountability(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeather() {
    try {
      const response = await fetch('/api/weather');
      if (response.ok) {
        const data = await response.json();
        setWeather(data.weather);
      }
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  }

  async function loadEvents() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const response = await fetch(
        `/api/calendar/events?start=${today.toISOString()}&end=${weekFromNow.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        const allEvents = data.events || [];

        // Separate today's events from upcoming
        const today = new Date();
        const todaysEvents = allEvents.filter((e: CalendarEvent) =>
          isToday(new Date(e.startTime))
        );
        const upcoming = allEvents.filter((e: CalendarEvent) =>
          !isToday(new Date(e.startTime))
        ).slice(0, 5); // Next 5 events

        setTodayEvents(todaysEvents);
        setUpcomingEvents(upcoming);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  async function loadAccountability() {
    try {
      const response = await fetch('/api/accountability/dashboard');
      if (response.ok) {
        const data = await response.json();

        // Get active commitments due soon
        const activeCommitments = data.commitments?.filter(
          (c: Commitment) => c.status === 'active'
        ).slice(0, 5) || [];

        // Get active consequences
        const activeConsequences = data.consequences?.filter(
          (c: Consequence) => c.status === 'active'
        ).slice(0, 5) || [];

        setCommitments(activeCommitments);
        setConsequences(activeConsequences);
      }
    } catch (error) {
      console.error('Error loading accountability:', error);
    }
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain className="h-16 w-16" />;
    if (cond.includes('snow')) return <CloudSnow className="h-16 w-16" />;
    if (cond.includes('cloud')) return <Cloud className="h-16 w-16" />;
    return <Sun className="h-16 w-16" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your family hub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Family Command Center
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <Button onClick={loadDashboard} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Weather & Today */}
          <div className="space-y-6">
            {/* Weather Widget */}
            {weather && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getWeatherIcon(weather.condition)}
                    <div>
                      <div className="text-5xl font-bold">{Math.round(weather.currentTemp)}°F</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {weather.location}
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription>{weather.condition}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Feels like:</span>
                      <span className="font-medium">{Math.round(weather.feelsLike)}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-medium">{weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind:</span>
                      <span className="font-medium">{Math.round(weather.windSpeed)} mph</span>
                    </div>
                  </div>

                  {/* 3-Day Forecast */}
                  {weather.forecast.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">3-Day Forecast</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {weather.forecast.slice(0, 3).map((day, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-xs text-gray-600">
                              {idx === 0 ? 'Today' : format(new Date(day.date), 'EEE')}
                            </div>
                            <img
                              src={day.conditionIcon}
                              alt={day.condition}
                              className="h-8 w-8 mx-auto"
                            />
                            <div className="text-sm font-medium">
                              {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather Alerts */}
                  {weather.alerts.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      {weather.alerts.map((alert, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-900">{alert.event}</p>
                            <p className="text-red-700 text-xs">{alert.headline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No events today</p>
                ) : (
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-2 p-2 rounded bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {event.allDay
                              ? 'All day'
                              : format(new Date(event.startTime), 'h:mm a')}
                            {event.location && ` • ${event.location}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Upcoming Events & Birthdays */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => {
                      const eventDate = new Date(event.startTime);
                      return (
                        <div key={event.id} className="flex items-start gap-2 p-2 rounded bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-gray-600">
                              {isTomorrow(eventDate)
                                ? 'Tomorrow'
                                : format(eventDate, 'EEE, MMM d')}
                              {' • '}
                              {event.allDay ? 'All day' : format(eventDate, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link href="/calendar">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Full Calendar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Active Commitments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Active Commitments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commitments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No active commitments</p>
                ) : (
                  <div className="space-y-2">
                    {commitments.map((commitment) => {
                      const dueDate = new Date(commitment.dueDate);
                      const isOverdue = isPast(dueDate);
                      return (
                        <div
                          key={commitment.id}
                          className={`p-2 rounded border ${
                            isOverdue ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <p className="font-medium text-sm">{commitment.child.name}</p>
                          <p className="text-xs text-gray-700">{commitment.commitmentText}</p>
                          <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                            {isOverdue ? 'Overdue' : `Due ${format(dueDate, 'MMM d, h:mm a')}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link href="/accountability">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Accountability
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Consequences & Quick Actions */}
          <div className="space-y-6">
            {/* Active Consequences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  Active Consequences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consequences.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-600 font-medium">All clear!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {consequences.map((consequence) => (
                      <div key={consequence.id} className="p-2 rounded bg-red-50 border border-red-200">
                        <p className="font-medium text-sm">{consequence.child.name}</p>
                        <p className="text-xs text-gray-700">{consequence.restrictionItem}</p>
                        {consequence.expiresAt && (
                          <p className="text-xs text-red-600">
                            Until {format(new Date(consequence.expiresAt), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </Link>
                <Link href="/accountability">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Accountability
                  </Button>
                </Link>
                <Link href="/gifts">
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-2" />
                    Gifts
                  </Button>
                </Link>
                <Link href="/emails">
                  <Button variant="outline" className="w-full justify-start">
                    📧 School Emails
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
