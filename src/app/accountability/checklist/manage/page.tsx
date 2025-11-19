'use client';

import { useEffect, useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Child {
  id: string;
  name: string;
}

interface ChecklistItem {
  id: string;
  child_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  weekdays_only: boolean;
}

const EMOJI_OPTIONS = [
  // Morning hygiene
  '🪥', '🚿', '🧼', '🪮', '🧴', '💧',
  // Getting ready
  '👕', '🧦', '👟', '🎒', '📚', '✏️',
  // Food & meals
  '🍳', '🥣', '🍎', '🥪', '🍌', '🥤',
  // Bedroom & chores
  '🛏️', '🧹', '🧺', '🗑️', '🧽', '🧸',
  // Activities & learning
  '📖', '📝', '🎨', '🎵', '⚽', '🏃',
  // Health & wellness
  '💊', '😴', '🧘', '💪', '☀️', '🌙',
  // Pets & nature
  '🐕', '🐈', '🐠', '🌱', '🌻', '🦜',
  // Special & rewards
  '⭐', '🏆', '✅', '🎁', '🎉', '🚪'
];

export default function ManageChecklistPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '📝',
    weekdays_only: true,
  });

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadItems();
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      const response = await fetch('/api/accountability/children');
      const data = await response.json();

      if (response.ok && data.children) {
        setChildren(data.children);
        if (data.children.length > 0 && !selectedChild) {
          setSelectedChild(data.children[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  }

  async function loadItems() {
    try {
      const response = await fetch(
        `/api/accountability/checklist/items?child_id=${selectedChild}`
      );
      const data = await response.json();

      if (response.ok) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load checklist items');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch('/api/accountability/checklist/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...formData,
          }),
        });

        if (response.ok) {
          toast.success('Item updated!');
          loadItems();
          resetForm();
        } else {
          toast.error('Failed to update item');
        }
      } else {
        // Create new item
        const response = await fetch('/api/accountability/checklist/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            child_id: selectedChild,
            display_order: items.length,
            ...formData,
          }),
        });

        if (response.ok) {
          toast.success('Item added!');
          loadItems();
          resetForm();
        } else {
          toast.error('Failed to add item');
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/accountability/checklist/items?id=${itemId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Item deleted!');
        loadItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      icon: '📝',
      weekdays_only: true,
    });
    setEditingItem(null);
    setDialogOpen(false);
  }

  function startEdit(item: ChecklistItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      icon: item.icon || '📝',
      weekdays_only: item.weekdays_only,
    });
    setDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600 mb-4">No children added yet</p>
          <Button asChild>
            <Link href="/accountability/children/new">Add Your First Child</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const selectedChildName = children.find(c => c.id === selectedChild)?.name || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/accountability/checklist">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Checklists
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Manage Checklist Items
          </h1>
          <p className="text-gray-600 mt-1">
            Add and organize checklist items for each child
          </p>
        </div>

        {/* Child Selector */}
        <Card className="p-6 mb-6">
          <Label htmlFor="child-select" className="mb-2 block">
            Select Child
          </Label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger id="child-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Add Item Button */}
        <div className="mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit' : 'Add'} Checklist Item
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update' : 'Create'} a checklist item for {selectedChildName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Task *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Brush teeth"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2 max-h-64 overflow-y-auto p-2 border rounded">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`text-2xl p-2 rounded border-2 transition-all ${
                          formData.icon === emoji
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="weekdays_only"
                    checked={formData.weekdays_only}
                    onChange={e => setFormData({ ...formData, weekdays_only: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="weekdays_only" className="font-normal">
                    Weekdays only (hide on weekends)
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-2">
              No checklist items yet for {selectedChildName}
            </p>
            <p className="text-sm text-gray-500">
              Click "Add Item" to create their first checklist item
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-gray-400" />

                  {item.icon && (
                    <div className="text-3xl">{item.icon}</div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {item.weekdays_only && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Weekdays only
                        </span>
                      )}
                      {!item.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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
