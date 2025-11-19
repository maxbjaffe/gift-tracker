'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowLeft, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { ChildAvatar } from '@/components/ChildAvatar';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  display_order: number;
  isCompleted: boolean;
}

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_type: string | null;
  avatar_data: string | null;
  avatar_background: string | null;
}

export default function ChildChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [child, setChild] = useState<Child | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, remaining: 0, isComplete: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [childId]);

  async function loadData() {
    try {
      setLoading(true);

      // Load child info
      const childResponse = await fetch(`/api/accountability/children/${childId}`);
      const childData = await childResponse.json();
      if (childResponse.ok) {
        setChild(childData);
      }

      // Load checklist
      const checklistResponse = await fetch(`/api/accountability/checklist/${childId}`);
      const checklistData = await checklistResponse.json();

      if (checklistResponse.ok) {
        setItems(checklistData.checklist || []);
        setStats(checklistData.stats);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
      toast.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(item: ChecklistItem) {
    const wasComplete = stats.isComplete;

    try {
      if (item.isCompleted) {
        // Uncheck
        await fetch(
          `/api/accountability/checklist/completions?child_id=${childId}&item_id=${item.id}`,
          { method: 'DELETE' }
        );
      } else {
        // Check
        await fetch('/api/accountability/checklist/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ child_id: childId, item_id: item.id }),
        });
      }

      // Reload to get fresh data
      await loadData();

      // Check if we just completed everything
      if (!wasComplete && stats.isComplete) {
        // Show confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('🎉 All done! Great job!');
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update checklist');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600 mb-4">Child not found</p>
          <Button onClick={() => router.push('/accountability/checklist')}>
            Back to Checklist
          </Button>
        </Card>
      </div>
    );
  }

  const percentage = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/accountability/checklist">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to All Checklists
            </Link>
          </Button>

          {/* Child Info Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <ChildAvatar
                name={child.name}
                avatarType={child.avatar_type}
                avatarData={child.avatar_data}
                avatarBackground={child.avatar_background}
                size="xl"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {child.name}'s Checklist
                </h1>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Progress */}
            {stats.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {stats.completed}/{stats.total} complete
                  </span>
                </div>
                <Progress value={percentage} className="h-4" />
              </div>
            )}
          </Card>

          {/* Success Message */}
          {stats.isComplete && stats.total > 0 && (
            <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border-green-300 mb-6">
              <div className="text-center">
                <Sparkles className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Amazing Job, {child.name}! 🎉
                </h2>
                <p className="text-green-700 text-lg">
                  You're all ready for school! Have a great day!
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Checklist Items */}
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No checklist items yet</p>
            <p className="text-sm text-gray-500">
              Ask your parent to add some items to your checklist
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card
                key={item.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  item.isCompleted
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => toggleItem(item)}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    ) : (
                      <Circle className="h-12 w-12 text-gray-300" />
                    )}
                  </div>

                  {/* Icon */}
                  {item.icon && (
                    <div className="text-4xl flex-shrink-0">
                      {item.icon}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${
                      item.isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {item.description}
                      </p>
                    )}
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
