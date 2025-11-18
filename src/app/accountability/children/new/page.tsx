'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createChild } from '@/lib/services/accountability';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🧑', '👨', '👩', '🙂', '😊', '🌟'];

export default function NewChildPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    avatar: '👦',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createChild({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        avatar: formData.avatar,
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
