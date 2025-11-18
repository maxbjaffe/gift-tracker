/**
 * Email Settings Page
 * Manage email accounts and sync settings
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { EmailAccount, EmailProvider } from '@/types/email';
import { Mail, Plus, Trash2, RefreshCw, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EmailSettingsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    email_address: '',
    display_name: '',
    provider: 'gmail' as EmailProvider,
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_username: '',
    imap_password: '',
    use_ssl: true,
    sync_frequency_minutes: 15,
    fetch_since_date: new Date(new Date().getFullYear(), 8, 1).toISOString().split('T')[0], // Sept 1 of current year
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      const response = await fetch('/api/email/accounts');
      const data = await response.json();

      if (response.ok) {
        setAccounts(data.accounts || []);
      } else {
        toast.error('Failed to load email accounts');
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load email accounts');
    } finally {
      setLoading(false);
    }
  }

  function handleProviderChange(provider: EmailProvider) {
    setFormData(prev => ({
      ...prev,
      provider,
      imap_host: provider === 'gmail' ? 'imap.gmail.com' :
                 provider === 'outlook' ? 'outlook.office365.com' :
                 prev.imap_host,
      imap_port: 993,
    }));
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch('/api/email/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imap_username: formData.imap_username || formData.email_address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email account added successfully!');
        setShowAddForm(false);
        loadAccounts();

        // Reset form
        setFormData({
          email_address: '',
          display_name: '',
          provider: 'gmail',
          imap_host: 'imap.gmail.com',
          imap_port: 993,
          imap_username: '',
          imap_password: '',
          use_ssl: true,
          sync_frequency_minutes: 15,
          fetch_since_date: new Date(new Date().getFullYear(), 8, 1).toISOString().split('T')[0],
        });
      } else {
        toast.error(data.error || 'Failed to add email account');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Failed to add email account');
    }
  }

  async function handleSync(accountId: string) {
    try {
      setSyncing(prev => ({ ...prev, [accountId]: true }));
      toast.info('Starting email sync...');

      const response = await fetch(`/api/email/accounts/${accountId}/sync`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Synced ${data.emailsSaved} new emails!`);
        loadAccounts(); // Refresh to show last sync time
      } else {
        toast.error(data.error || 'Failed to sync emails');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync emails');
    } finally {
      setSyncing(prev => ({ ...prev, [accountId]: false }));
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Are you sure you want to delete this email account? This will also delete all fetched emails.')) {
      return;
    }

    try {
      const response = await fetch(`/api/email/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Email account deleted');
        loadAccounts();
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  }

  async function handleToggleActive(accountId: string, isActive: boolean) {
    try {
      const response = await fetch(`/api/email/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        toast.success(`Account ${!isActive ? 'activated' : 'deactivated'}`);
        loadAccounts();
      } else {
        toast.error('Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    }
  }

  function getSyncStatusIcon(status?: string) {
    if (!status) return null;

    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return null;
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/emails">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Emails
            </Link>
          </Button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Email Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your email accounts and sync settings
          </p>
        </div>

        {/* Email Accounts */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Email Accounts</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {/* Add Account Form */}
          {showAddForm && (
            <form onSubmit={handleAddAccount} className="border rounded-lg p-4 mb-4 bg-gray-50">
              <h3 className="font-semibold mb-4">Add Email Account</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email_address">Email Address *</Label>
                    <Input
                      id="email_address"
                      type="email"
                      required
                      value={formData.email_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
                      placeholder="you@school.edu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="School Email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="provider">Email Provider *</Label>
                  <Select value={formData.provider} onValueChange={(v) => handleProviderChange(v as EmailProvider)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Outlook / Office 365</SelectItem>
                      <SelectItem value="other">Other (Custom IMAP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imap_host">IMAP Host *</Label>
                    <Input
                      id="imap_host"
                      required
                      value={formData.imap_host}
                      onChange={(e) => setFormData(prev => ({ ...prev, imap_host: e.target.value }))}
                      placeholder="imap.gmail.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imap_port">IMAP Port *</Label>
                    <Input
                      id="imap_port"
                      type="number"
                      required
                      value={formData.imap_port}
                      onChange={(e) => setFormData(prev => ({ ...prev, imap_port: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imap_password">Password / App Password *</Label>
                  <Input
                    id="imap_password"
                    type="password"
                    required
                    value={formData.imap_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, imap_password: e.target.value }))}
                    placeholder="Your email password or app-specific password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For Gmail: Use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">App Password</a>, not your regular password
                  </p>
                </div>

                <div>
                  <Label htmlFor="fetch_since_date">Fetch Emails Since *</Label>
                  <Input
                    id="fetch_since_date"
                    type="date"
                    required
                    value={formData.fetch_since_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, fetch_since_date: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only emails from this date forward will be fetched (e.g., start of school year)
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit">Add Account</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Account List */}
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No email accounts configured</p>
              <p className="text-sm">Add an account to start syncing emails</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{account.display_name || account.email_address}</h3>
                        {getSyncStatusIcon(account.last_sync_status)}
                      </div>
                      <p className="text-sm text-gray-600">{account.email_address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Provider: {account.provider} •
                        {account.last_sync_at ? ` Last sync: ${new Date(account.last_sync_at).toLocaleString()}` : ' Never synced'}
                      </p>
                      {account.last_sync_error && (
                        <p className="text-xs text-red-600 mt-1">Error: {account.last_sync_error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-2">
                        <Label htmlFor={`active-${account.id}`} className="text-sm">Active</Label>
                        <Switch
                          id={`active-${account.id}`}
                          checked={account.is_active}
                          onCheckedChange={() => handleToggleActive(account.id, account.is_active)}
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(account.id)}
                        disabled={syncing[account.id]}
                      >
                        {syncing[account.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">📧 Automatic Sync</h3>
            <p className="text-sm text-gray-600">
              Active accounts sync automatically every 15 minutes via cron job
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">🔒 Security</h3>
            <p className="text-sm text-gray-600">
              Passwords are encrypted before storage. Use app-specific passwords for Gmail.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
