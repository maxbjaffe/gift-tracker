'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchConsequence,
  fetchChildren,
  updateConsequence,
} from '@/lib/services/accountability';
import type { Consequence, Child, RestrictionType, Severity } from '@/types/accountability';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function EditConsequencePage() {
  const router = useRouter();
  const params = useParams();
  const consequenceId = params.id as string;

  const [consequence, setConsequence] = useState<Consequence | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    child_id: '',
    restriction_type: '' as RestrictionType,
    restriction_item: '',
    reason: '',
    duration_days: '',
    severity: 'medium' as Severity,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [consequenceId]);

  async function loadData() {
    try {
      const [consequenceData, childrenData] = await Promise.all([
        fetchConsequence(consequenceId),
        fetchChildren(),
      ]);

      if (consequenceData) {
        setConsequence(consequenceData);
        setFormData({
          child_id: consequenceData.child_id,
          restriction_type: consequenceData.restriction_type,
          restriction_item: consequenceData.restriction_item,
          reason: consequenceData.reason,
          duration_days: consequenceData.duration_days?.toString() || '',
          severity: consequenceData.severity,
          notes: consequenceData.notes || '',
        });
      } else {
        toast.error('Consequence not found');
        router.push('/accountability/consequences');
      }

      setChildren(childrenData);
    } catch (error) {
      logger.error('Error loading data:', error);
      toast.error('Failed to load consequence');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Calculate new expiration date if duration changed
      let expires_at = consequence?.expires_at;
      if (formData.duration_days) {
        const expirationDate = new Date(consequence?.created_at || new Date());
        expirationDate.setDate(expirationDate.getDate() + parseInt(formData.duration_days));
        expires_at = expirationDate.toISOString();
      }

      await updateConsequence(consequenceId, {
        child_id: formData.child_id,
        restriction_type: formData.restriction_type,
        restriction_item: formData.restriction_item,
        reason: formData.reason,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
        expires_at: expires_at ?? undefined,
        severity: formData.severity,
        notes: formData.notes || undefined,
      });

      toast.success('Consequence updated successfully!');
      router.push('/accountability/consequences');
    } catch (error) {
      logger.error('Error updating consequence:', error);
      toast.error('Failed to update consequence');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!consequence) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/accountability/consequences">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Consequences
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit Consequence
          </h1>
          <p className="text-gray-600 mt-1">
            Update consequence details
          </p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child Selection */}
            <div>
              <Label htmlFor="child_id">Child *</Label>
              <Select
                value={formData.child_id}
                onValueChange={(value) => setFormData({ ...formData, child_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Restriction Type */}
            <div>
              <Label htmlFor="restriction_type">Restriction Type *</Label>
              <Select
                value={formData.restriction_type}
                onValueChange={(value) => setFormData({ ...formData, restriction_type: value as RestrictionType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="device">📱 Device</SelectItem>
                  <SelectItem value="activity">🎮 Activity</SelectItem>
                  <SelectItem value="privilege">✨ Privilege</SelectItem>
                  <SelectItem value="location">📍 Location</SelectItem>
                  <SelectItem value="other">🚫 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Restriction Item */}
            <div>
              <Label htmlFor="restriction_item">What's Being Restricted? *</Label>
              <Input
                id="restriction_item"
                type="text"
                value={formData.restriction_item}
                onChange={(e) => setFormData({ ...formData, restriction_item: e.target.value })}
                placeholder="e.g., iPad, Xbox, TV"
                required
                className="mt-1"
              />
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Why is this restriction being applied?"
                required
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Duration and Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_days">Duration (days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  placeholder="Optional"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite</p>
              </div>

              <div>
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value as Severity })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional context or details"
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving || !formData.child_id || !formData.restriction_type || !formData.restriction_item || !formData.reason}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/accountability/consequences')}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
