'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Calendar,
  Target,
  Ban,
  CheckCircle2,
  MapPin,
  Loader2,
  Sparkles,
  Smile,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, isWithinInterval, addDays } from 'date-fns';
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

function DashboardKioskContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get today's quote and joke (rotates daily)
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  const todayJoke = DAILY_JOKES[dayOfYear % DAILY_JOKES.length];

  useEffect(() => {
    if (!token) {
      setError('No kiosk token provided in URL');
      setLoading(false);
      return;
    }

    verifyAndLoadData();

    // Auto-refresh every 2 minutes
    const refreshInterval = setInterval(verifyAndLoadData, 2 * 60 * 1000);
    // Update clock every second
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(clockInterval);
    };
  }, [token]);

  async function verifyAndLoadData() {
    try {
      if (!token) return;

      // Verify token
      const verifyResponse = await fetch(`/api/kiosk/verify?token=${encodeURIComponent(token)}`);
      if (!verifyResponse.ok) {
        const verifyData = await verifyResponse.json().catch(() => ({ error: 'Invalid response' }));
        setError(verifyData.error || `Invalid token (${verifyResponse.status})`);
        setLoading(false);
        return;
      }

      await loadDashboard();
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(`Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  }

  async function loadDashboard() {
    try {
      await Promise.all([
        loadWeather().catch(e => console.error('Weather error:', e)),
        loadEvents().catch(e => console.error('Events error:', e)),
        loadAccountability().catch(e => console.error('Accountability error:', e)),
      ]);
    } catch (error) {
      console.error('Dashboard load error:', error);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please use the kiosk URL from your account settings.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600 font-bold">Loading Family Command Center...</div>
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
        {/* Header with Live Clock */}
        <div className="mb-8 text-center">
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Family Command Center
          </h1>
          <div className="text-5xl font-black text-gray-800">
            {format(currentTime, 'h:mm:ss a')}
          </div>
          <p className="text-3xl text-gray-600 mt-2 font-bold">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Weather, Quote, Joke */}
          <div className="space-y-6">
            {/* Weather Widget */}
            {weather ? (
              <Card className="shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-6xl font-black text-transparent bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text">
                        {Math.round(weather.currentTemp)}°
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {weather.location}
                      </div>
                    </div>
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <p className="text-gray-700 font-bold">{weather.condition}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Feels like:</span>
                      <span className="font-bold">{Math.round(weather.feelsLike)}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-bold">{weather.humidity}%</span>
                    </div>
                  </div>

                  {/* 3-Day Forecast */}
                  {weather.forecast.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-bold mb-2">3-Day Forecast</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {weather.forecast.slice(0, 3).map((day, idx) => (
                          <div key={idx} className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 font-bold">
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
                        <div key={idx} className="flex items-start gap-2 text-sm bg-red-50 p-2 rounded-lg border-2 border-red-300">
                          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-red-900">{alert.event}</p>
                            <p className="text-red-700 text-xs">{alert.headline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Quote of the Day */}
            <Card className="shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-50 border-4 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                  <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-black text-xl">
                    Quote of the Day
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-lg font-bold italic text-gray-800 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    "{todayQuote.text}"
                  </p>
                  <p className="text-base text-purple-700 font-black text-right">
                    — {todayQuote.author}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Joke of the Day */}
            <Card className="shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-50 border-4 border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-6 w-6 text-orange-600 animate-bounce" />
                  <span className="text-transparent bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text font-black text-xl">
                    Joke of the Day
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-base font-bold text-gray-800">
                    {todayJoke.setup}
                  </p>
                  <div className="p-4 bg-white rounded-xl border-l-8 border-orange-500 shadow-md">
                    <p className="text-lg font-black text-orange-700">
                      {todayJoke.punchline}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Calendar Events */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card className="shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 border-3 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-black text-xl">Today's Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 font-semibold">Nothing scheduled today! 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 hover:scale-105 transition-transform"
                      >
                        <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-700 font-bold">
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

            {/* This Week */}
            <Card className="shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 border-3 border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-black text-xl">This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 font-semibold">No upcoming events this week</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => {
                      const eventDate = parseISO(event.start_time);
                      return (
                        <div
                          key={event.id}
                          className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:scale-105 transition-all"
                        >
                          <p className="font-black text-sm text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-700 font-bold">
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Accountability (Commitments & Consequences) */}
          <div className="space-y-6">
            {/* Active Commitments */}
            <Card className="shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 border-3 border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  <span className="font-black text-xl">Active Commitments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {commitments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 font-semibold">No active commitments</p>
                ) : (
                  <div className="space-y-3">
                    {commitments.map((commitment) => {
                      const dueDate = parseISO(commitment.due_date);
                      const isOverdue = isPast(dueDate);
                      return (
                        <div
                          key={commitment.id}
                          className={`p-4 rounded-xl border-3 hover:scale-105 transition-transform ${
                            isOverdue
                              ? 'bg-gradient-to-r from-red-100 to-orange-100 border-red-400'
                              : 'bg-gradient-to-r from-green-100 to-teal-100 border-green-400'
                          }`}
                        >
                          <p className="font-black text-sm text-gray-900">{commitment.child.name}</p>
                          <p className="text-xs text-gray-700 mb-1 font-bold">{commitment.commitment_text}</p>
                          <p className={`text-xs font-black ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverdue ? '⚠️ Overdue!' : `📅 Due ${format(dueDate, 'MMM d, h:mm a')}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Consequences */}
            <Card className="shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 border-3 border-red-300">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-6 w-6" />
                  <span className="font-black text-xl">Active Consequences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {consequences.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3 animate-bounce" />
                    <p className="text-lg text-green-600 font-black">All clear! 🎉</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">No active consequences</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consequences.map((consequence) => (
                      <div key={consequence.id} className="p-4 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 border-3 border-red-400 hover:scale-105 transition-transform">
                        <p className="font-black text-sm text-gray-900">{consequence.child.name}</p>
                        <p className="text-xs text-gray-700 mb-1 font-bold">{consequence.restriction_item}</p>
                        {consequence.expires_at && (
                          <p className="text-xs text-red-600 font-black">
                            ⏰ Until {format(parseISO(consequence.expires_at), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DashboardKioskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600 font-bold">Loading...</div>
      </div>
    }>
      <DashboardKioskContent />
    </Suspense>
  );
}
