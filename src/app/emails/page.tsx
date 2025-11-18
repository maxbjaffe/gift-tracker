/**
 * Email Dashboard Page
 * Main page for viewing and managing school emails
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmailList } from '@/components/email/EmailList';
import type { SchoolEmail, EmailCategory, EmailPriority } from '@/types/email';
import { Mail, Search, Filter, RefreshCw, Settings, Inbox, Star, Archive } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EmailsPage() {
  const [emails, setEmails] = useState<SchoolEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [filter, setFilter] = useState<string>('unread');

  useEffect(() => {
    loadEmails();
  }, [category, priority, filter]);

  async function loadEmails() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (category !== 'all') params.append('category', category);
      if (priority !== 'all') params.append('priority', priority);

      // Filter presets
      if (filter === 'unread') params.append('is_read', 'false');
      if (filter === 'starred') params.append('is_starred', 'true');
      if (filter === 'archived') params.append('is_archived', 'true');

      if (search) params.append('search', search);

      const response = await fetch(`/api/email/messages?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails || []);
      } else {
        toast.error('Failed to load emails');
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    try {
      toast.info('Syncing emails...');
      const response = await fetch('/api/cron/email-sync', {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Emails synced successfully!');
        loadEmails();
      } else {
        toast.error('Failed to sync emails');
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast.error('Failed to sync emails');
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadEmails();
  }

  const stats = {
    total: emails.length,
    unread: emails.filter(e => !e.is_read).length,
    starred: emails.filter(e => e.is_starred).length,
    actionRequired: emails.filter(e => e.ai_action_required).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              School Emails
            </h1>
            <div className="flex gap-2">
              <Button onClick={handleSync} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/emails/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            AI-powered email management for school communications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Inbox className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Starred</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.starred}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Action Needed</p>
                <p className="text-2xl font-bold text-red-600">{stats.actionRequired}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search emails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                <Inbox className="h-4 w-4 mr-1" />
                Unread
              </Button>
              <Button
                variant={filter === 'starred' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('starred')}
              >
                <Star className="h-4 w-4 mr-1" />
                Starred
              </Button>
              <Button
                variant={filter === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('archived')}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archived
              </Button>
            </div>

            {/* Category & Priority Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="homework">📚 Homework</SelectItem>
                    <SelectItem value="event">📅 Event</SelectItem>
                    <SelectItem value="permission">📝 Permission</SelectItem>
                    <SelectItem value="grade">📊 Grade</SelectItem>
                    <SelectItem value="behavior">⭐ Behavior</SelectItem>
                    <SelectItem value="sports">⚽ Sports</SelectItem>
                    <SelectItem value="transportation">🚌 Transportation</SelectItem>
                    <SelectItem value="fundraising">💰 Fundraising</SelectItem>
                    <SelectItem value="other">📧 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Email List */}
        <EmailList
          emails={emails}
          loading={loading}
          emptyMessage={filter === 'unread' ? 'No unread emails' : 'No emails found'}
        />
      </div>
    </div>
  );
}
