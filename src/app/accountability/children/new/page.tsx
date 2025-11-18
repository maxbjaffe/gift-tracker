'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createChild } from '@/lib/services/accountability';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import AvatarSelector from '@/components/AvatarSelector';
import type { AvatarData } from '@/lib/avatar-utils';
import { generateDefaultAvatar } from '@/lib/avatar-utils';

export default function NewChildPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<AvatarData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  });

  // Auto-generate default avatar when name changes
  useEffect(() => {
    if (formData.name && !avatar) {
      setAvatar(generateDefaultAvatar());
    }
  }, [formData.name, avatar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createChild({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        avatar_type: avatar?.type || null,
        avatar_data: avatar?.data || null,
        avatar_background: avatar?.background || null,
      });

      toast.success(`${formData.name} added successfully!`);
      router.push('/accountability/children');
    } catch (error) {
      console.error('Error creating child:', error);
      toast.error('Failed to add child');
    } finally {
      setLoading(false);
    }
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
            Add New Child
          </h1>
          <p className="text-gray-600 mt-1">
            Add a child to start tracking their accountability
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
            {formData.name && (
              <div>
                <Label>Choose Avatar</Label>
                <div className="mt-2">
                  <AvatarSelector
                    name={formData.name}
                    value={avatar}
                    onChange={setAvatar}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Child'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/accountability/children')}
                disabled={loading}
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
