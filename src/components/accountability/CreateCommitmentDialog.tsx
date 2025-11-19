'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Target } from 'lucide-react';
import type { Child, CommitmentCategory } from '@/types/accountability';

interface CreateCommitmentDialogProps {
  children?: Child[];
  onSuccess?: () => void;
  defaultChildId?: string;
}

export function CreateCommitmentDialog({ children = [], onSuccess, defaultChildId }: CreateCommitmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [childId, setChildId] = useState(defaultChildId || '');
  const [commitmentText, setCommitmentText] = useState('');
  const [category, setCategory] = useState<CommitmentCategory>('homework');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const resetForm = () => {
    setChildId(defaultChildId || '');
    setCommitmentText('');
    setCategory('homework');
    setDueDate('');
    setDueTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!childId || !commitmentText || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO string
      const dueDateTimeStr = dueTime
        ? `${dueDate}T${dueTime}:00`
        : `${dueDate}T17:00:00`; // Default to 5pm if no time specified

      const dueDatetime = new Date(dueDateTimeStr).toISOString();

      const response = await fetch('/api/accountability/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          commitment_text: commitmentText,
          category,
          due_date: dueDatetime,
          status: 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create commitment');
      }

      const child = children.find(c => c.id === childId);
      toast.success(`✓ Commitment created for ${child?.name || 'child'}!`);

      resetForm();
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating commitment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create commitment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Commitment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-blue-600" />
            Create New Commitment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Child Selector */}
          <div className="space-y-2">
            <Label htmlFor="child">Child *</Label>
            <Select value={childId} onValueChange={setChildId} required>
              <SelectTrigger id="child">
                <SelectValue placeholder="Select a child..." />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commitment Text */}
          <div className="space-y-2">
            <Label htmlFor="commitment">What needs to be done? *</Label>
            <Textarea
              id="commitment"
              placeholder="e.g., Finish math homework, Clean room, Practice piano..."
              value={commitmentText}
              onChange={(e) => setCommitmentText(e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as CommitmentCategory)}>
              <SelectTrigger id="category">
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

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Commitment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
