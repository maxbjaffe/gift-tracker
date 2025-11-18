'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchChild, updateChild } from '@/lib/services/accountability';
import type { Child } from '@/types/accountability';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🧑', '👨', '👩', '🙂', '😊', '🌟'];

export default function EditChildPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    avatar: '👦',
  });

  useEffect(() => {
    loadChild();
  }, [childId]);

  async function loadChild() {
    try {
      const data = await fetchChild(childId);
      if (data) {
        setChild(data);
        setFormData({
          name: data.name,
          age: data.age?.toString() || '',
          avatar: data.avatar || '👦',
        });
      } else {
        toast.error('Child not found');
        router.push('/accountability/children');
      }
    } catch (error) {
      console.error('Error loading child:', error);
      toast.error('Failed to load child');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateChild(childId, {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        avatar: formData.avatar,
      });

      toast.success(`${formData.name} updated successfully!`);
      router.push('/accountability/children');
    } catch (error) {
      console.error('Error updating child:', error);
      toast.error('Failed to update child');
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

  if (!child) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/accountability/children">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Children
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit {child.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Update child's information
          </p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter child's name"
                required
                className="mt-1"
              />
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="18"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
                className="mt-1"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <Label>Avatar</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar })}
                    className={`
                      text-4xl p-3 rounded-lg border-2 transition-all
                      ${formData.avatar === avatar
                        ? 'border-purple-500 bg-purple-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving || !formData.name}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/accountability/children')}
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
