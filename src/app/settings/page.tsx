'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, Save, User, ArrowLeft, Smartphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isPWAEnabled } from '@/lib/app-config';
import { unregisterAllServiceWorkers, isRunningAsPWA } from '@/components/pwa/PWAProvider';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [clearingPWA, setClearingPWA] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as PWA on client
    setIsPWA(isRunningAsPWA());
  }, []);

  useEffect(() => {
    loadProfile();
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
        .select('name, phone_number, sms_consent')
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
        setSmsConsent(profile.sms_consent || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
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

      // Require consent if phone number is provided
      if (phoneNumber && !smsConsent) {
        toast.error('Please agree to the SMS terms to use SMS features');
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
            sms_consent: phoneNumber ? smsConsent : false,
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
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
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

              {/* SMS Consent Checkbox */}
              {phoneNumber && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        I agree to receive SMS messages from GiftStash
                      </span>
                      <p className="text-gray-600 mt-1">
                        By checking this box, you consent to receive SMS messages from GiftStash for gift tracking confirmations and service updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt-out, HELP for help. See our{' '}
                        <Link href="/sms-terms" className="text-orange-600 hover:underline">
                          SMS Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy#sms" className="text-orange-600 hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {phoneNumber && smsConsent && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    How to add gifts via SMS:
                  </h4>
                  <p className="text-sm text-purple-800 mb-2">
                    Text your gift ideas to: <strong>+1 (401) 592-5209</strong>
                  </p>
                  <p className="text-xs text-purple-700">
                    Example: &quot;AirPods Pro for Sarah - $249&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PWA Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  App Installation (PWA)
                </CardTitle>
                <CardDescription>
                  Install GiftStash as an app on your device for quick access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isPWA ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">
                    {isPWA ? 'Running as installed app' : 'Running in browser'}
                  </span>
                </div>

                {!isPWA && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Install GiftStash
                    </h4>
                    <p className="text-sm text-purple-800 mb-3">
                      Add GiftStash to your home screen for the best experience:
                    </p>
                    <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                      <li><strong>Chrome/Edge:</strong> Click the install icon in the address bar</li>
                      <li><strong>Safari (iOS):</strong> Tap Share, then "Add to Home Screen"</li>
                      <li><strong>Android:</strong> Tap menu, then "Install app" or "Add to Home Screen"</li>
                    </ul>
                  </div>
                )}

                {/* Debug/Troubleshooting section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Troubleshooting</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    If you're experiencing issues with caching or stale data, clear the app cache.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setClearingPWA(true);
                      try {
                        const success = await unregisterAllServiceWorkers();
                        if (success) {
                          toast.success('Cache cleared! The page will reload.');
                          // Give time for the toast to show
                          setTimeout(() => {
                            window.location.reload();
                          }, 1500);
                        } else {
                          toast.info('No service workers to clear');
                        }
                      } catch (error) {
                        toast.error('Failed to clear cache');
                      } finally {
                        setClearingPWA(false);
                      }
                    }}
                    disabled={clearingPWA}
                    className="gap-2"
                  >
                    {clearingPWA ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Clear App Cache
                  </Button>
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
