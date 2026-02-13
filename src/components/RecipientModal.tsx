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
import { SmartTagPicker } from '@/components/ui/SmartTagPicker';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RecipientInput {
  id?: string;
  name: string;
  relationship?: string;
  age_range?: string;
  birthday?: string;
  gender?: string;
  interests?: string | string[];
  notes?: string;
}

interface RecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recipient?: RecipientInput | null;
}

export function RecipientModal({
  isOpen,
  onClose,
  onSuccess,
  recipient = null,
}: RecipientModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string[]>([]);
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Reset form when recipient changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (recipient) {
        setName(recipient.name || '');
        setRelationship(recipient.relationship ? [recipient.relationship] : []);
        setAgeRange(recipient.age_range ? [recipient.age_range] : []);
        setBirthday(recipient.birthday || '');
        setGender(recipient.gender ? [recipient.gender] : []);
        setInterests(
          Array.isArray(recipient.interests)
            ? recipient.interests
            : recipient.interests
              ? recipient.interests.split(',').map((s) => s.trim()).filter(Boolean)
              : []
        );
        setNotes(recipient.notes || '');
      } else {
        setName('');
        setRelationship([]);
        setAgeRange([]);
        setBirthday('');
        setGender([]);
        setInterests([]);
        setNotes('');
      }
    }
  }, [isOpen, recipient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to continue');
        return;
      }

      const recipientData = {
        user_id: user.id,
        name: name.trim(),
        relationship: relationship[0] || null,
        age_range: ageRange[0] || null,
        birthday: birthday || null,
        gender: gender[0] || null,
        interests: interests.length > 0 ? interests : null,
        notes: notes.trim() || null,
      };

      if (recipient?.id) {
        const { error } = await supabase
          .from('recipients')
          .update(recipientData)
          .eq('id', recipient.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Recipient updated successfully');
      } else {
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sarah"
              required
              disabled={loading}
            />
          </div>

          <SmartTagPicker
            label="Relationship"
            values={relationship}
            onChange={setRelationship}
            enumType="relationship"
            singleSelect
            placeholder="e.g., Sister, Friend"
            color="pink"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                disabled={loading}
              />
            </div>
            <SmartTagPicker
              label="Life Stage"
              values={ageRange}
              onChange={setAgeRange}
              enumType="life_stage"
              singleSelect
              placeholder="Select..."
              color="blue"
            />
          </div>

          <SmartTagPicker
            label="Gender"
            values={gender}
            onChange={setGender}
            enumType="gender"
            singleSelect
            placeholder="Select..."
            color="teal"
          />

          <SmartTagPicker
            label="Interests"
            values={interests}
            onChange={setInterests}
            allInterests
            placeholder="Search interests..."
            color="purple"
          />

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              disabled={loading || !name.trim()}
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
