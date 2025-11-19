'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, RefreshCw, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarSubscription {
  id: string;
  name: string;
  description?: string;
  ical_url: string;
  color: string;
  is_active: boolean;
  last_synced_at?: string;
  sync_status: 'pending' | 'success' | 'error';
  sync_error?: string;
}

export default function CalendarSettingsPage() {
  const [subscriptions, setSubscriptions] = useState<CalendarSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState('');
  const [newCalendar, setNewCalendar] = useState({
    name: '',
    ical_url: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([loadSubscriptions(), loadWeatherLocation()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubscriptions() {
    const response = await fetch('/api/calendar/subscriptions');
    if (response.ok) {
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    }
  }

  async function loadWeatherLocation() {
    const response = await fetch('/api/weather');
    if (response.ok) {
      const data = await response.json();
      setWeatherLocation(data.weather?.location || '');
    }
  }

  async function addCalendar() {
    if (!newCalendar.name || !newCalendar.ical_url) {
      toast.error('Name and iCal URL are required');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/calendar/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCalendar),
      });

      if (response.ok) {
        toast.success('Calendar added! Syncing events...');
        setNewCalendar({ name: '', ical_url: '', color: '#3b82f6' });
        await loadSubscriptions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add calendar');
      }
    } catch (error) {
      toast.error('Failed to add calendar');
    } finally {
      setAdding(false);
    }
  }

  async function deleteCalendar(id: string) {
    if (!confirm('Are you sure you want to delete this calendar?')) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar/subscriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Calendar deleted');
        await loadSubscriptions();
      } else {
        toast.error('Failed to delete calendar');
      }
    } catch (error) {
      toast.error('Failed to delete calendar');
    }
  }

  async function syncCalendar(id: string) {
    toast.info('Syncing calendar...');
    try {
      const response = await fetch(`/api/calendar/subscriptions/${id}/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Synced! +${data.result.eventsAdded} ~${data.result.eventsUpdated} -${data.result.eventsRemoved}`
        );
        await loadSubscriptions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to sync calendar');
      }
    } catch (error) {
      toast.error('Failed to sync calendar');
    }
  }

  async function syncAllCalendars() {
    toast.info('Syncing all calendars...');
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `All synced! +${data.summary.eventsAdded} ~${data.summary.eventsUpdated} -${data.summary.eventsRemoved}`
        );
        await loadSubscriptions();
      } else {
        toast.error('Failed to sync calendars');
      }
    } catch (error) {
      toast.error('Failed to sync calendars');
    }
  }

  async function updateWeatherLocation() {
    if (!weatherLocation) {
      toast.error('Please enter a location');
      return;
    }

    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: weatherLocation }),
      });

      if (response.ok) {
        toast.success('Weather location updated!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update location');
      }
    } catch (error) {
      toast.error('Failed to update location');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Calendar & Weather Settings
          </h1>
          <p className="text-gray-600">Manage your calendar subscriptions and weather location</p>
        </div>

        <div className="space-y-6">
          {/* Weather Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Weather Location
              </CardTitle>
              <CardDescription>
                Set your location for weather forecasts and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="City, State or ZIP code"
                    value={weatherLocation}
                    onChange={(e) => setWeatherLocation(e.target.value)}
                  />
                </div>
                <Button onClick={updateWeatherLocation}>
                  Update Location
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Examples: "Bronxville, NY", "10708", "New York City"
              </p>
            </CardContent>
          </Card>

          {/* Add New Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Calendar Subscription
              </CardTitle>
              <CardDescription>
                Subscribe to an iCal feed (public URL only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Calendar Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Riley's Calendar"
                  value={newCalendar.name}
                  onChange={(e) => setNewCalendar({ ...newCalendar, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="url">iCal URL (Webcal or HTTPS)</Label>
                <Input
                  id="url"
                  placeholder="https://p71-caldav.icloud.com/published/..."
                  value={newCalendar.ical_url}
                  onChange={(e) => setNewCalendar({ ...newCalendar, ical_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newCalendar.color}
                    onChange={(e) => setNewCalendar({ ...newCalendar, color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={newCalendar.color}
                    onChange={(e) => setNewCalendar({ ...newCalendar, color: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <Button onClick={addCalendar} disabled={adding} className="w-full">
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding & Syncing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Calendar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Subscriptions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Calendar Subscriptions</CardTitle>
                  <CardDescription>
                    {subscriptions.length} calendar{subscriptions.length !== 1 ? 's' : ''} connected
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={syncAllCalendars}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No calendars added yet. Add one above to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-white"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{sub.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{sub.ical_url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {sub.sync_status === 'success' && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Synced {sub.last_synced_at && new Date(sub.last_synced_at).toLocaleString()}
                            </div>
                          )}
                          {sub.sync_status === 'error' && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="h-3 w-3" />
                              Error: {sub.sync_error}
                            </div>
                          )}
                          {sub.sync_status === 'pending' && (
                            <div className="text-xs text-gray-500">Pending sync...</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncCalendar(sub.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCalendar(sub.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
