'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Ban } from 'lucide-react';
import type { Child, RestrictionType, Severity } from '@/types/accountability';

interface CreateConsequenceDialogProps {
  children?: Child[];
  onSuccess?: () => void;
  defaultChildId?: string;
}

export function CreateConsequenceDialog({ children = [], onSuccess, defaultChildId }: CreateConsequenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [childId, setChildId] = useState(defaultChildId || '');
  const [restrictionType, setRestrictionType] = useState<RestrictionType>('device');
  const [restrictionItem, setRestrictionItem] = useState('');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState<number>(3);
  const [severity, setSeverity] = useState<Severity>('medium');
  const [requireConfirmation, setRequireConfirmation] = useState(true);

  const resetForm = () => {
    setChildId(defaultChildId || '');
    setRestrictionType('device');
    setRestrictionItem('');
    setReason('');
    setDurationDays(3);
    setSeverity('medium');
    setRequireConfirmation(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!childId || !restrictionItem || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Calculate expiration date
      let expires_at: string | null = null;
      if (durationDays > 0) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + durationDays);
        expires_at = expirationDate.toISOString();
      }

      const response = await fetch('/api/accountability/consequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          restriction_type: restrictionType,
          restriction_item: restrictionItem,
          reason,
          duration_days: durationDays,
          expires_at,
          severity,
          status: requireConfirmation ? 'pending_confirmation' : 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create consequence');
      }

      const child = children.find(c => c.id === childId);
      toast.success(`✓ Consequence created for ${child?.name || 'child'}!`);

      resetForm();
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating consequence:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create consequence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Consequence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ban className="h-5 w-5 text-red-600" />
            Create New Consequence
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

          {/* Restriction Type */}
          <div className="space-y-2">
            <Label htmlFor="restrictionType">Restriction Type</Label>
            <Select value={restrictionType} onValueChange={(val) => setRestrictionType(val as RestrictionType)}>
              <SelectTrigger id="restrictionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="device">📱 Device (iPad, Phone, etc.)</SelectItem>
                <SelectItem value="activity">🎮 Activity (Games, Sports, etc.)</SelectItem>
                <SelectItem value="privilege">✨ Privilege (Friends, Outings, etc.)</SelectItem>
                <SelectItem value="location">📍 Location (Room, Area, etc.)</SelectItem>
                <SelectItem value="other">🚫 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Restriction Item */}
          <div className="space-y-2">
            <Label htmlFor="restrictionItem">What to restrict? *</Label>
            <Input
              id="restrictionItem"
              placeholder="e.g., iPad, TV, Xbox, Friends, Playdates..."
              value={restrictionItem}
              onChange={(e) => setRestrictionItem(e.target.value)}
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Why is this consequence being given?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={2}
            />
          </div>

          {/* Duration & Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(val) => setSeverity(val as Severity)}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">🟡 Minor</SelectItem>
                  <SelectItem value="medium">🟠 Medium</SelectItem>
                  <SelectItem value="major">🔴 Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Partner Confirmation */}
          <div className="flex items-center space-x-2 pt-2 pb-2 border-t">
            <Checkbox
              id="confirmation"
              checked={requireConfirmation}
              onCheckedChange={(checked) => setRequireConfirmation(checked as boolean)}
            />
            <Label
              htmlFor="confirmation"
              className="text-sm font-normal cursor-pointer"
            >
              Require partner confirmation before activating
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
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
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? 'Creating...' : 'Create Consequence'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
