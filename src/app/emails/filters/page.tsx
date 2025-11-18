/**
 * Email Filters Management Page
 * Create and manage saved email filter presets
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Filter, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EmailFilter {
  id: string;
  filter_name: string;
  filter_config: {
    category?: string;
    priority?: string;
    child_id?: string;
    is_read?: boolean;
    is_starred?: boolean;
    is_archived?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

interface Child {
  id: string;
  name: string;
}

export default function FiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<EmailFilter[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [filterName, setFilterName] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [childId, setChildId] = useState<string>('all');
  const [readStatus, setReadStatus] = useState<string>('all');

  useEffect(() => {
    loadFilters();
    loadChildren();
  }, []);

  async function loadFilters() {
    try {
      const response = await fetch('/api/email/filters');
      const data = await response.json();

      if (response.ok) {
        setFilters(data.filters || []);
      } else {
        toast.error('Failed to load filters');
      }
    } catch (error) {
      console.error('Error loading filters:', error);
      toast.error('Failed to load filters');
    } finally {
      setLoading(false);
    }
  }

  async function loadChildren() {
    try {
      const response = await fetch('/api/accountability/children');
      const data = await response.json();
      if (response.ok) {
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  }

  async function handleCreateFilter() {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name');
      return;
    }

    try {
      const filter_config: any = {};

      if (category !== 'all') filter_config.category = category;
      if (priority !== 'all') filter_config.priority = priority;
      if (childId !== 'all') filter_config.child_id = childId;
      if (readStatus === 'unread') filter_config.is_read = false;
      if (readStatus === 'read') filter_config.is_read = true;

      const response = await fetch('/api/email/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter_name: filterName,
          filter_config,
          is_active: true,
        }),
      });

      if (response.ok) {
        toast.success('Filter created successfully!');
        setShowCreateForm(false);
        resetForm();
        loadFilters();
      } else {
        toast.error('Failed to create filter');
      }
    } catch (error) {
      console.error('Error creating filter:', error);
      toast.error('Failed to create filter');
    }
  }

  async function handleDeleteFilter(id: string) {
    try {
      const response = await fetch(`/api/email/filters/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Filter deleted');
        loadFilters();
      } else {
        toast.error('Failed to delete filter');
      }
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast.error('Failed to delete filter');
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/email/filters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        toast.success(currentStatus ? 'Filter deactivated' : 'Filter activated');
        loadFilters();
      } else {
        toast.error('Failed to update filter');
      }
    } catch (error) {
      console.error('Error updating filter:', error);
      toast.error('Failed to update filter');
    }
  }

  function applyFilter(filter: EmailFilter) {
    // Build query params from filter config
    const params = new URLSearchParams();

    if (filter.filter_config.category) params.set('category', filter.filter_config.category);
    if (filter.filter_config.priority) params.set('priority', filter.filter_config.priority);
    if (filter.filter_config.child_id) params.set('child_id', filter.filter_config.child_id);
    if (filter.filter_config.is_read !== undefined) {
      params.set('is_read', filter.filter_config.is_read.toString());
    }
    if (filter.filter_config.is_starred !== undefined) {
      params.set('is_starred', filter.filter_config.is_starred.toString());
    }
    if (filter.filter_config.is_archived !== undefined) {
      params.set('is_archived', filter.filter_config.is_archived.toString());
    }

    router.push(`/emails?${params.toString()}`);
  }

  function resetForm() {
    setFilterName('');
    setCategory('all');
    setPriority('all');
    setChildId('all');
    setReadStatus('all');
  }

  function getFilterDescription(config: EmailFilter['filter_config']): string {
    const parts: string[] = [];

    if (config.category) parts.push(`Category: ${config.category}`);
    if (config.priority) parts.push(`Priority: ${config.priority}`);
    if (config.child_id) {
      const child = children.find(c => c.id === config.child_id);
      parts.push(`Child: ${child?.name || 'Unknown'}`);
    }
    if (config.is_read !== undefined) parts.push(config.is_read ? 'Read' : 'Unread');
    if (config.is_starred) parts.push('Starred');
    if (config.is_archived) parts.push('Archived');

    return parts.length > 0 ? parts.join(' • ') : 'No filters set';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading filters...</div>
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
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Emails
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Saved Filters
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage your email filter presets
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Filter
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4">Create New Filter</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Riley's Homework"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Category</SelectItem>
                      <SelectItem value="homework">📚 Homework</SelectItem>
                      <SelectItem value="event">📅 Event</SelectItem>
                      <SelectItem value="permission">📝 Permission</SelectItem>
                      <SelectItem value="grade">📊 Grade</SelectItem>
                      <SelectItem value="behavior">⭐ Behavior</SelectItem>
                      <SelectItem value="sports">⚽ Sports</SelectItem>
                      <SelectItem value="transportation">🚌 Transportation</SelectItem>
                      <SelectItem value="fundraising">💰 Fundraising</SelectItem>
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
                      <SelectItem value="all">Any Priority</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Child</label>
                  <Select value={childId} onValueChange={setChildId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Child</SelectItem>
                      {children.map(child => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Read Status</label>
                  <Select value={readStatus} onValueChange={setReadStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="unread">Unread Only</SelectItem>
                      <SelectItem value="read">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateFilter}>
                  <Check className="h-4 w-4 mr-2" />
                  Create Filter
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filters List */}
        {filters.length === 0 ? (
          <Card className="p-12 text-center">
            <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No saved filters yet</p>
            <p className="text-gray-400 mb-6">
              Create custom filter presets to quickly find the emails you need
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Filter
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filters.map((filter) => (
              <Card key={filter.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{filter.filter_name}</h3>
                      {filter.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{getFilterDescription(filter.filter_config)}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => applyFilter(filter)}>
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(filter.id, filter.is_active)}
                    >
                      {filter.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFilter(filter.id)}
                      title="Delete filter"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
