'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchChildren, deleteChild } from '@/lib/services/accountability';
import type { Child } from '@/types/accountability';
import { toast } from 'sonner';
import { UserPlus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      const data = await fetchChildren();
      setChildren(data);
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all their consequences and commitments.`)) {
      return;
    }

    try {
      await deleteChild(id);
      toast.success(`${name} deleted successfully`);
      loadChildren();
    } catch (error) {
      toast.error('Failed to delete child');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/accountability">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Manage Children
            </h1>
            <p className="text-gray-600 mt-1">
              Add, edit, or remove children from your accountability system
            </p>
          </div>
          <Button
            onClick={() => router.push('/accountability/children/new')}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>

        {/* Children List */}
        {children.length === 0 ? (
          <Card className="p-12 text-center">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No children yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add your first child to start tracking accountability
            </p>
            <Button
              onClick={() => router.push('/accountability/children/new')}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <Card key={child.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar
                    type={child.avatar_type as 'preset' | 'emoji' | null}
                    data={child.avatar_data ?? undefined}
                    background={child.avatar_background ?? undefined}
                    name={child.name}
                    size="lg"
                    showBorder
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                    {child.age && (
                      <p className="text-sm text-gray-600">Age: {child.age}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Added {new Date(child.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/accountability/children/${child.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(child.id, child.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
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
