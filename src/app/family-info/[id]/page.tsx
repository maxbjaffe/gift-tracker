'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  Loader2,
  X,
  Calendar,
  Tag,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface FamilyInfo {
  id: string;
  title: string;
  type: string;
  description: string;
  details: string;
  tags: string[];
  important_dates: Record<string, string>;
  related_contacts: any[];
  status: string;
  security_level: string;
  file_urls: string[];
  created_at: string;
  updated_at: string;
}

export default function FamilyInfoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<FamilyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    loadEntry();
  }, []);

  const loadEntry = async () => {
    setLoading(true);
    try {
      const { id } = await params;
      const response = await fetch(`/api/family-info?id=${id}`);
      const data = await response.json();

      if (response.ok && data.entries && data.entries[0]) {
        const fetchedEntry = data.entries[0];
        setEntry(fetchedEntry);
        setEditForm({
          ...fetchedEntry,
          tags: fetchedEntry.tags?.join(', ') || '',
        });
      } else {
        toast.error('Entry not found');
        router.push('/family-info');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      toast.error('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tagsArray = editForm.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      const response = await fetch('/api/family-info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: entry!.id,
          ...editForm,
          tags: tagsArray,
        }),
      });

      if (response.ok) {
        toast.success('Entry updated successfully!');
        setEditing(false);
        loadEntry();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update entry');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/family-info?id=${entry!.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Entry deleted successfully');
        router.push('/family-info');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/family-info">
              <Button variant="outline" size="lg">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-xl">
          {editing ? (
            // Edit Mode
            <CardContent className="p-6 space-y-6">
              <div>
                <Label>Title</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Type</Label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {['Insurance', 'Contact', 'Financial', 'Healthcare', 'Education', 'Home', 'Auto', 'Legal', 'Other'].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Details</Label>
                <Textarea
                  value={editForm.details || ''}
                  onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </CardContent>
          ) : (
            // View Mode
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 rounded text-sm font-semibold mb-3 bg-purple-100 text-purple-800 border-2 border-purple-300">
                      {entry.type}
                    </div>
                    <CardTitle className="text-3xl">{entry.title}</CardTitle>
                    {entry.description && (
                      <p className="text-gray-600 mt-2">{entry.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {entry.details && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5" />
                      Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none">
                      <ReactMarkdown>{entry.details}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm border border-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold capitalize">{entry.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Security Level</p>
                    <p className="font-semibold capitalize">{entry.security_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold">
                      {new Date(entry.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
