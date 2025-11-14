'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Gift, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AssignGiftsDialogProps {
  recipientId: string;
  recipientName: string;
  onAssignmentComplete?: () => void;
}

interface GiftOption {
  id: string;
  name: string;
  category: string | null;
  current_price: number | null;
  status: string;
  isAssigned: boolean;
}

export default function AssignGiftsDialog({
  recipientId,
  recipientName,
  onAssignmentComplete,
}: AssignGiftsDialogProps) {
  const [open, setOpen] = useState(false);
  const [gifts, setGifts] = useState<GiftOption[]>([]);
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadGifts();
    }
  }, [open, recipientId]);

  const loadGifts = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get all gifts for the current user
      const { data: allGifts, error: giftsError } = await supabase
        .from('gifts')
        .select('id, name, category, current_price, status')
        .order('created_at', { ascending: false });

      if (giftsError) throw giftsError;

      // Get currently assigned gift IDs for this recipient
      const { data: assignments, error: assignError } = await supabase
        .from('gift_recipients')
        .select('gift_id')
        .eq('recipient_id', recipientId);

      if (assignError) throw assignError;

      const assignedGiftIds = new Set(assignments?.map((a) => a.gift_id) || []);

      // Mark which gifts are already assigned
      const giftsWithStatus = (allGifts || []).map((gift) => ({
        ...gift,
        isAssigned: assignedGiftIds.has(gift.id),
      }));

      setGifts(giftsWithStatus);

      // Pre-select already assigned gifts
      setSelectedGiftIds(Array.from(assignedGiftIds));
    } catch (error) {
      console.error('Error loading gifts:', error);
      toast.error('Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  const toggleGift = (giftId: string) => {
    setSelectedGiftIds((prev) =>
      prev.includes(giftId) ? prev.filter((id) => id !== giftId) : [...prev, giftId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    try {
      // Get currently assigned gifts
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('gift_recipients')
        .select('id, gift_id')
        .eq('recipient_id', recipientId);

      if (fetchError) throw fetchError;

      const currentGiftIds = new Set(currentAssignments?.map((a) => a.gift_id) || []);
      const newGiftIds = new Set(selectedGiftIds);

      // Determine what to add and what to remove
      const toAdd = selectedGiftIds.filter((id) => !currentGiftIds.has(id));
      const toRemove = currentAssignments
        ?.filter((a) => !newGiftIds.has(a.gift_id))
        .map((a) => a.id) || [];

      // Add new assignments
      if (toAdd.length > 0) {
        const newAssignments = toAdd.map((giftId) => ({
          gift_id: giftId,
          recipient_id: recipientId,
        }));

        const { error: insertError } = await supabase
          .from('gift_recipients')
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      // Remove unselected assignments
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('gift_recipients')
          .delete()
          .in('id', toRemove);

        if (deleteError) throw deleteError;
      }

      toast.success(`Gift assignments updated for ${recipientName}`);
      setOpen(false);
      onAssignmentComplete?.();
    } catch (error) {
      console.error('Error saving gift assignments:', error);
      toast.error('Failed to update gift assignments');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Gifts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Gifts to {recipientName}</DialogTitle>
          <DialogDescription>
            Select which gifts you want to associate with this recipient
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading gifts...</div>
        ) : gifts.length === 0 ? (
          <div className="py-8 text-center">
            <Gift className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4">No gifts in your collection yet</p>
            <Button onClick={() => (window.location.href = '/gifts/new')}>
              Create Your First Gift
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => toggleGift(gift.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedGiftIds.includes(gift.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedGiftIds.includes(gift.id)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedGiftIds.includes(gift.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{gift.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          {gift.category && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">
                              {gift.category}
                            </span>
                          )}
                          {gift.current_price && (
                            <span className="font-semibold text-green-600">
                              ${gift.current_price.toFixed(2)}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-xs capitalize ${
                              gift.status === 'purchased'
                                ? 'bg-green-100 text-green-700'
                                : gift.status === 'idea'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {gift.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {saving ? 'Saving...' : `Save Assignments (${selectedGiftIds.length} selected)`}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
