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
  fetchCommitment,
  fetchChildren,
  updateCommitment,
} from '@/lib/services/accountability';
import type { Commitment, Child, CommitmentCategory } from '@/types/accountability';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EditCommitmentPage() {
  const router = useRouter();
  const params = useParams();
  const commitmentId = params.id as string;

  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    child_id: '',
    commitment_text: '',
    due_date: '',
    category: 'other' as CommitmentCategory,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [commitmentId]);

  async function loadData() {
    try {
      const [commitmentData, childrenData] = await Promise.all([
        fetchCommitment(commitmentId),
        fetchChildren(),
      ]);

      if (commitmentData) {
        setCommitment(commitmentData);

        // Format the due_date for the datetime-local input
        const dueDate = new Date(commitmentData.due_date);
        const formattedDate = format(dueDate, "yyyy-MM-dd'T'HH:mm");

        setFormData({
          child_id: commitmentData.child_id,
          commitment_text: commitmentData.commitment_text,
          due_date: formattedDate,
          category: commitmentData.category,
          notes: commitmentData.notes || '',
        });
      } else {
        toast.error('Commitment not found');
        router.push('/accountability/commitments');
      }

      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load commitment');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateCommitment(commitmentId, {
        child_id: formData.child_id,
        commitment_text: formData.commitment_text,
        due_date: new Date(formData.due_date).toISOString(),
        category: formData.category,
        notes: formData.notes || undefined,
      });

      toast.success('Commitment updated successfully!');
      router.push('/accountability/commitments');
    } catch (error) {
      console.error('Error updating commitment:', error);
      toast.error('Failed to update commitment');
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

  if (!commitment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/accountability/commitments">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Commitments
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit Commitment
          </h1>
          <p className="text-gray-600 mt-1">
            Update commitment details
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

            {/* Commitment Text */}
            <div>
              <Label htmlFor="commitment_text">Commitment *</Label>
              <Textarea
                id="commitment_text"
                value={formData.commitment_text}
                onChange={(e) => setFormData({ ...formData, commitment_text: e.target.value })}
                placeholder="What needs to be done?"
                required
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Due Date and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due_date">Due Date & Time *</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CommitmentCategory })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homework">📚 Homework</SelectItem>
                    <SelectItem value="chores">🧹 Chores</SelectItem>
                    <SelectItem value="responsibilities">🎯 Responsibilities</SelectItem>
                    <SelectItem value="behavior">🌟 Behavior</SelectItem>
                    <SelectItem value="other">📋 Other</SelectItem>
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
                disabled={saving || !formData.child_id || !formData.commitment_text || !formData.due_date}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/accountability/commitments')}
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
