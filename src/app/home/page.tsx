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
  Sparkles,
  Smile,
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

// Kid-friendly quotes that rotate daily
const DAILY_QUOTES = [
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "Winnie the Pooh" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go!", author: "Dr. Seuss" },
  { text: "You're off to great places! Today is your day! Your mountain is waiting, so get on your way!", author: "Dr. Seuss" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "In every job that must be done, there is an element of fun.", author: "Mary Poppins" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Do or do not. There is no try.", author: "Yoda" },
  { text: "Why fit in when you were born to stand out?", author: "Dr. Seuss" },
  { text: "A person's a person, no matter how small.", author: "Dr. Seuss" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss" },
  { text: "Life is like riding a bicycle. To keep your balance, you must keep moving.", author: "Albert Einstein" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Be kind whenever possible. It is always possible.", author: "Dalai Lama" },
];

// Kid-friendly jokes that rotate daily
const DAILY_JOKES = [
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
  { setup: "What do you call a dinosaur that crashes his car?", punchline: "Tyrannosaurus Wrecks!" },
  { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems!" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese!" },
  { setup: "Why can't a bicycle stand up by itself?", punchline: "Because it's two tired!" },
  { setup: "What did one wall say to the other wall?", punchline: "I'll meet you at the corner!" },
  { setup: "Why did the cookie go to the doctor?", punchline: "Because it felt crumbly!" },
  { setup: "What do you call a sleeping bull?", punchline: "A bulldozer!" },
  { setup: "Why did the student eat his homework?", punchline: "Because the teacher said it was a piece of cake!" },
  { setup: "What's orange and sounds like a parrot?", punchline: "A carrot!" },
  { setup: "How do you organize a space party?", punchline: "You planet!" },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
  { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved!" },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
];

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Get today's quote and joke (rotates daily)
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  const todayJoke = DAILY_JOKES[dayOfYear % DAILY_JOKES.length];

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

            {/* Quote of the Day */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Quote of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-lg font-medium italic text-gray-800 leading-relaxed">
                    "{todayQuote.text}"
                  </p>
                  <p className="text-sm text-purple-700 font-semibold text-right">
                    — {todayQuote.author}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Joke of the Day */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-orange-600" />
                  Joke of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-base font-medium text-gray-800">
                    {todayJoke.setup}
                  </p>
                  <div className="p-3 bg-white rounded-lg border-l-4 border-orange-400">
                    <p className="text-base font-bold text-orange-700">
                      {todayJoke.punchline}
                    </p>
                  </div>
                </div>
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
