'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, Save, User, Monitor, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [kioskUrl, setKioskUrl] = useState('');
  const [loadingKiosk, setLoadingKiosk] = useState(false);

  useEffect(() => {
    loadProfile();
    loadKioskUrl();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to access settings');
        window.location.href = '/login';
        return;
      }

      setEmail(user.email || '');

      // Get profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, phone_number')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
        return;
      }

      if (profile) {
        setName(profile.name || '');
        setPhoneNumber(profile.phone_number || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadKioskUrl = async () => {
    try {
      const response = await fetch('/api/kiosk/token');
      if (response.ok) {
        const data = await response.json();
        setKioskUrl(data.url);
      }
    } catch (error) {
      console.error('Error loading kiosk URL:', error);
    }
  };

  const regenerateKioskUrl = async () => {
    setLoadingKiosk(true);
    try {
      const response = await fetch('/api/kiosk/token', { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        setKioskUrl(data.url);
        toast.success('Kiosk URL regenerated!');
      } else {
        toast.error('Failed to regenerate kiosk URL');
      }
    } catch (error) {
      console.error('Error regenerating kiosk URL:', error);
      toast.error('Failed to regenerate kiosk URL');
    } finally {
      setLoadingKiosk(false);
    }
  };

  const copyKioskUrl = () => {
    navigator.clipboard.writeText(kioskUrl);
    toast.success('Kiosk URL copied to clipboard!');
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in');
        return;
      }

      // Validate phone number format (E.164)
      if (phoneNumber && !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        toast.error(
          'Please enter a valid phone number in E.164 format (e.g., +14155551234)'
        );
        return;
      }

      // Upsert profile
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            name,
            phone_number: phoneNumber || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                SMS Integration
              </CardTitle>
              <CardDescription>
                Register your phone number to add gifts via text message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+14155551234"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use E.164 format: +[country code][number]
                </p>
              </div>

              {phoneNumber && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    How to add gifts via SMS:
                  </h4>
                  <p className="text-sm text-purple-800 mb-2">
                    Text your gift ideas to: <strong>+1 (401) 592-5209</strong>
                  </p>
                  <p className="text-xs text-purple-700">
                    Example: "AirPods Pro for Sarah - $249"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kiosk/Dakboard Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Dakboard / Kiosk Mode
              </CardTitle>
              <CardDescription>
                Access your checklist dashboard without logging in - perfect for wall-mounted tablets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kiosk URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={kioskUrl}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                    placeholder="Loading..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyKioskUrl}
                    disabled={!kioskUrl}
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(kioskUrl, '_blank')}
                    disabled={!kioskUrl}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This URL allows access to your checklist without logging in. Keep it private!
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  How to use Kiosk Mode:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Open the kiosk URL on your wall-mounted tablet or device</li>
                  <li>Bookmark it for easy access</li>
                  <li>Kids can check off items without needing to log in</li>
                  <li>Perfect for Dakboard or dedicated family dashboard displays</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={regenerateKioskUrl}
                  disabled={loadingKiosk}
                >
                  {loadingKiosk ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Regenerate URL
                </Button>
                <p className="text-xs text-gray-500 self-center">
                  (This will invalidate the old URL)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
