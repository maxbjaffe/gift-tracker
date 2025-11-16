'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Recipient {
  id?: string;
  name: string;
  relationship?: string;
  age?: number;
  birthday?: string;
  interests?: string;
  notes?: string;
}

interface RecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recipient?: Recipient | null;
}

export function RecipientModal({
  isOpen,
  onClose,
  onSuccess,
  recipient = null,
}: RecipientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Recipient>({
    name: '',
    relationship: '',
    age: undefined,
    birthday: '',
    interests: '',
    notes: '',
  });

  // Reset form when recipient changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (recipient) {
        setFormData({
          id: recipient.id,
          name: recipient.name || '',
          relationship: recipient.relationship || '',
          age: recipient.age,
          birthday: recipient.birthday || '',
          interests: recipient.interests || '',
          notes: recipient.notes || '',
        });
      } else {
        setFormData({
          name: '',
          relationship: '',
          age: undefined,
          birthday: '',
          interests: '',
          notes: '',
        });
      }
    }
  }, [isOpen, recipient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to continue');
        return;
      }

      // Prepare data
      const recipientData = {
        user_id: user.id,
        name: formData.name.trim(),
        relationship: formData.relationship?.trim() || null,
        age: formData.age || null,
        birthday: formData.birthday || null,
        interests: formData.interests?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      if (recipient?.id) {
        // Update existing recipient
        const { error } = await supabase
          .from('recipients')
          .update(recipientData)
          .eq('id', recipient.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Recipient updated successfully');
      } else {
        // Create new recipient
        const { error } = await supabase.from('recipients').insert(recipientData);

        if (error) throw error;
        toast.success('Recipient added successfully');
      }

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error saving recipient:', error);
      toast.error('Failed to save recipient');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof Recipient,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recipient ? 'Edit Recipient' : 'Add New Recipient'}
          </DialogTitle>
          <DialogDescription>
            {recipient
              ? 'Update recipient information'
              : 'Add someone you want to buy gifts for'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Sarah"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={formData.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              placeholder="e.g., Sister, Friend, Colleague"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) =>
                  handleChange('age', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="e.g., 25"
                min="0"
                max="150"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleChange('birthday', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="interests">Interests</Label>
            <Textarea
              id="interests"
              value={formData.interests}
              onChange={(e) => handleChange('interests', e.target.value)}
              placeholder="e.g., Reading, Photography, Cooking"
              rows={2}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional notes or preferences"
              rows={3}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>{recipient ? 'Update' : 'Add'} Recipient</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
