'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Loader2,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, isWithinInterval, addDays } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

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
  start_time: string;
  end_time?: string;
  all_day: boolean;
  category?: string;
  source_type: string;
  color?: string;
  location?: string;
}

interface Commitment {
  id: string;
  commitment_text: string;
  due_date: string;
  status: string;
  child: { name: string };
}

interface Consequence {
  id: string;
  restriction_item: string;
  expires_at?: string;
  child: { name: string };
}

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadDashboard();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setErrors([]);
    const errorList: string[] = [];

    try {
      await Promise.all([
        loadWeather().catch(e => errorList.push(`Weather: ${e.message}`)),
        loadEvents().catch(e => errorList.push(`Events: ${e.message}`)),
        loadAccountability().catch(e => errorList.push(`Accountability: ${e.message}`)),
      ]);
    } finally {
      setErrors(errorList);
      setLoading(false);
    }
  }

  async function loadWeather() {
    const response = await fetch('/api/weather');
    if (!response.ok) {
      if (response.status === 400) {
        return; // No location set, skip silently
      }
      throw new Error('Failed to load weather');
    }
    const data = await response.json();
    setWeather(data.weather);
  }

  async function loadEvents() {
    const now = new Date();
    const weekFromNow = addDays(now, 7);

    const response = await fetch(
      `/api/calendar/events?start=${now.toISOString()}&end=${weekFromNow.toISOString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to load events');
    }

    const data = await response.json();
    const allEvents = data.events || [];

    // Filter events for today
    const todaysEvents = allEvents.filter((e: CalendarEvent) => {
      try {
        return isToday(parseISO(e.start_time));
      } catch {
        return false;
      }
    });

    // Get next 5 upcoming events (not today)
    const upcoming = allEvents
      .filter((e: CalendarEvent) => {
        try {
          const eventDate = parseISO(e.start_time);
          return !isToday(eventDate) && isWithinInterval(eventDate, { start: now, end: weekFromNow });
        } catch {
          return false;
        }
      })
      .slice(0, 5);

    setTodayEvents(todaysEvents);
    setUpcomingEvents(upcoming);
  }

  async function loadAccountability() {
    const response = await fetch('/api/accountability/dashboard');
    if (!response.ok) {
      throw new Error('Failed to load accountability');
    }

    const data = await response.json();

    // Get active commitments due soon
    const now = new Date();
    const activeCommitments = (data.commitments || [])
      .filter((c: Commitment) => c.status === 'active')
      .sort((a: Commitment, b: Commitment) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 5);

    // Get active consequences
    const activeConsequences = (data.consequences || [])
      .filter((c: Consequence) => {
        // Only show if not expired
        if (!c.expires_at) return true;
        return !isPast(parseISO(c.expires_at));
      })
      .slice(0, 5);

    setCommitments(activeCommitments);
    setConsequences(activeConsequences);
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle'))
      return <CloudRain className="h-12 w-12 text-blue-500" />;
    if (cond.includes('snow'))
      return <CloudSnow className="h-12 w-12 text-blue-300" />;
    if (cond.includes('cloud'))
      return <Cloud className="h-12 w-12 text-gray-400" />;
    return <Sun className="h-12 w-12 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your family hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Images */}
      <div className="fixed -left-24 top-1/4 opacity-20 pointer-events-none z-0">
        <Image
          src="/images/cottletiger.JPG"
          alt="Cottle Tiger"
          width={400}
          height={400}
          className="object-contain transform -rotate-12"
        />
      </div>
      <div className="fixed -right-24 bottom-1/4 opacity-20 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max"
          width={400}
          height={400}
          className="object-contain transform rotate-12"
        />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Family Command Center
          </h1>
          <p className="text-gray-600 text-xl">
            {format(new Date(), 'EEEE, MMMM d, yyyy • h:mm a')}
          </p>
          <Button onClick={loadDashboard} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Some data couldn't load:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    {errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Weather & Today */}
          <div className="space-y-6">
            {/* Weather Widget */}
            {weather ? (
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-6xl font-black text-gray-900">
                        {Math.round(weather.currentTemp)}°
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {weather.location}
                      </div>
                    </div>
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <p className="text-gray-700 font-medium">{weather.condition}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Feels like:</span>
                      <span className="font-semibold">{Math.round(weather.feelsLike)}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-semibold">{weather.humidity}%</span>
                    </div>
                  </div>

                  {/* 3-Day Forecast */}
                  {weather.forecast.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-semibold mb-2">3-Day Forecast</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {weather.forecast.slice(0, 3).map((day, idx) => (
                          <div key={idx} className="text-center bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-600 font-medium">
                              {idx === 0 ? 'Today' : format(parseISO(day.date), 'EEE')}
                            </div>
                            <img
                              src={day.conditionIcon}
                              alt={day.condition}
                              className="h-8 w-8 mx-auto my-1"
                            />
                            <div className="text-sm font-bold">
                              {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather Alerts */}
                  {weather.alerts.length > 0 && (
                    <div className="pt-3 border-t">
                      {weather.alerts.map((alert, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm bg-red-50 p-2 rounded">
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
            ) : (
              <Card className="shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Weather not configured</p>
                  <Link href="/calendar/settings">
                    <Button variant="link" size="sm">Set location</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Today's Events */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Today's Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">Nothing scheduled today</p>
                ) : (
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                      >
                        <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {event.all_day
                              ? 'All day'
                              : format(parseISO(event.start_time), 'h:mm a')}
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

          {/* Middle Column - Upcoming Events */}
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No upcoming events this week</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => {
                      const eventDate = parseISO(event.start_time);
                      return (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-300 transition-colors"
                        >
                          <p className="font-semibold text-sm text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {isTomorrow(eventDate)
                              ? 'Tomorrow'
                              : format(eventDate, 'EEE, MMM d')}
                            {' • '}
                            {event.all_day ? 'All day' : format(eventDate, 'h:mm a')}
                          </p>
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Active Commitments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commitments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No active commitments</p>
                ) : (
                  <div className="space-y-2">
                    {commitments.map((commitment) => {
                      const dueDate = parseISO(commitment.due_date);
                      const isOverdue = isPast(dueDate);
                      return (
                        <div
                          key={commitment.id}
                          className={`p-3 rounded-lg border-2 ${
                            isOverdue ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'
                          }`}
                        >
                          <p className="font-semibold text-sm text-gray-900">{commitment.child.name}</p>
                          <p className="text-xs text-gray-700 mb-1">{commitment.commitment_text}</p>
                          <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                            {isOverdue ? '⚠️ Overdue' : `Due ${format(dueDate, 'MMM d, h:mm a')}`}
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  Active Consequences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consequences.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-600 font-semibold">All clear!</p>
                    <p className="text-xs text-gray-500 mt-1">No active consequences</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {consequences.map((consequence) => (
                      <div key={consequence.id} className="p-3 rounded-lg bg-red-50 border-2 border-red-300">
                        <p className="font-semibold text-sm text-gray-900">{consequence.child.name}</p>
                        <p className="text-xs text-gray-700 mb-1">{consequence.restriction_item}</p>
                        {consequence.expires_at && (
                          <p className="text-xs text-red-600 font-medium">
                            Until {format(parseISO(consequence.expires_at), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/calendar">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </Link>
                <Link href="/accountability">
                  <Button variant="outline" className="w-full justify-start hover:bg-purple-50">
                    <Target className="h-4 w-4 mr-2" />
                    Accountability
                  </Button>
                </Link>
                <Link href="/gifts">
                  <Button variant="outline" className="w-full justify-start hover:bg-pink-50">
                    <Gift className="h-4 w-4 mr-2" />
                    Gifts
                  </Button>
                </Link>
                <Link href="/emails">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50">
                    📧 School Emails
                  </Button>
                </Link>
                <Link href="/calendar/settings">
                  <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                    ⚙️ Calendar Settings
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
