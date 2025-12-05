'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';

interface BulkRecipient {
  name: string;
  relationship: string;
  birthday: string;
  age_range: string;
}

interface BulkRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMPTY_RECIPIENT: BulkRecipient = {
  name: '',
  relationship: '',
  birthday: '',
  age_range: '',
};

export function BulkRecipientModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkRecipientModalProps) {
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<BulkRecipient[]>([
    { ...EMPTY_RECIPIENT },
    { ...EMPTY_RECIPIENT },
    { ...EMPTY_RECIPIENT },
  ]);

  const handleClose = () => {
    setRecipients([
      { ...EMPTY_RECIPIENT },
      { ...EMPTY_RECIPIENT },
      { ...EMPTY_RECIPIENT },
    ]);
    onClose();
  };

  const handleAddRow = () => {
    setRecipients([...recipients, { ...EMPTY_RECIPIENT }]);
  };

  const handleRemoveRow = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const handleChange = (
    index: number,
    field: keyof BulkRecipient,
    value: string
  ) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty rows (only name is required)
    const validRecipients = recipients.filter((r) => r.name.trim());

    if (validRecipients.length === 0) {
      toast.error('Add at least one recipient with a name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/recipients/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients: validRecipients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add recipients');
      }

      toast.success(`Added ${data.count} recipient${data.count > 1 ? 's' : ''}`);

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: any) {
      console.error('Error saving recipients:', error);
      toast.error(error.message || 'Failed to save recipients');
    } finally {
      setLoading(false);
    }
  };

  const validCount = recipients.filter((r) => r.name.trim()).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Multiple Recipients</DialogTitle>
          <DialogDescription>
            Quickly add several people at once. Only name is required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_32px] gap-2 text-sm font-medium text-gray-600">
            <div>
              Name <span className="text-red-500">*</span>
            </div>
            <div>Relationship</div>
            <div className="w-[100px]">Age</div>
            <div className="w-[130px]">Birthday</div>
            <div></div>
          </div>

          {/* Recipient rows */}
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_auto_auto_32px] gap-2 items-center"
              >
                <Input
                  value={recipient.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  placeholder="Name"
                  disabled={loading}
                  className="h-9"
                />
                <Input
                  value={recipient.relationship}
                  onChange={(e) =>
                    handleChange(index, 'relationship', e.target.value)
                  }
                  placeholder="e.g., Sister"
                  disabled={loading}
                  className="h-9"
                />
                <Input
                  value={recipient.age_range}
                  onChange={(e) =>
                    handleChange(index, 'age_range', e.target.value)
                  }
                  placeholder="e.g., 25"
                  disabled={loading}
                  className="h-9 w-[100px]"
                />
                <Input
                  type="date"
                  value={recipient.birthday}
                  onChange={(e) =>
                    handleChange(index, 'birthday', e.target.value)
                  }
                  disabled={loading}
                  className="h-9 w-[130px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRow(index)}
                  disabled={loading || recipients.length === 1}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add row button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Row
          </Button>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <span className="text-sm text-gray-500">
              {validCount} recipient{validCount !== 1 ? 's' : ''} to add
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || validCount === 0}
                className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>Add {validCount > 0 ? validCount : ''} Recipient{validCount !== 1 ? 's' : ''}</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
