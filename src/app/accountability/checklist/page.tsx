'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Settings, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ChildAvatar } from '@/components/ChildAvatar';
import { toast } from 'sonner';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_type: string | null;
  avatar_data: string | null;
  avatar_background: string | null;
}

interface ChecklistStats {
  total: number;
  completed: number;
  remaining: number;
  isComplete: boolean;
}

interface ChildProgress {
  child: Child;
  stats: ChecklistStats;
}

interface ChecklistItemData {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  display_order: number;
  isCompleted: boolean;
}

interface ChildChecklistData {
  checklist: ChecklistItemData[];
  stats: ChecklistStats;
}

export default function ChecklistDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenData, setChildrenData] = useState<Map<string, ChildChecklistData>>(new Map());
  const [progress, setProgress] = useState<Map<string, ChecklistStats>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load children
      const childrenResponse = await fetch('/api/accountability/children');
      const childrenDataResponse = await childrenResponse.json();

      if (childrenResponse.ok && childrenDataResponse.children) {
        setChildren(childrenDataResponse.children);

        // Load checklist data for each child
        const statsMap = new Map<string, ChecklistStats>();
        const dataMap = new Map<string, ChildChecklistData>();

        for (const child of childrenDataResponse.children) {
          const checklistResponse = await fetch(`/api/accountability/checklist/${child.id}`);
          const checklistData = await checklistResponse.json();

          if (checklistResponse.ok) {
            statsMap.set(child.id, checklistData.stats);
            dataMap.set(child.id, {
              checklist: checklistData.checklist || [],
              stats: checklistData.stats
            });
          }
        }

        setProgress(statsMap);
        setChildrenData(dataMap);
      }
    } catch (error) {
      console.error('Error loading checklist data:', error);
      toast.error('Failed to load checklist data');
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(childId: string, itemId: string, isCurrentlyCompleted: boolean) {
    try {
      if (isCurrentlyCompleted) {
        // Uncheck
        await fetch(
          `/api/accountability/checklist/completions?child_id=${childId}&item_id=${itemId}`,
          { method: 'DELETE' }
        );
      } else {
        // Check
        await fetch('/api/accountability/checklist/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ child_id: childId, item_id: itemId }),
        });
      }

      // Reload data to update all displays
      await loadData();
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update checklist');
    }
  }

  const allComplete = children.length > 0 && children.every(child =>
    progress.get(child.id)?.isComplete
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Background Tiger Watermark */}
      <div className="fixed bottom-0 right-0 opacity-10 pointer-events-none z-0">
        <Image
          src="/images/cottletiger.JPG"
          alt="Cottle Tiger Background"
          width={500}
          height={500}
          className="object-contain"
        />
      </div>
      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href="/accountability">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Morning Checklist
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/accountability/checklist/manage">
                <Settings className="h-4 w-4 mr-2" />
                Manage Items
              </Link>
            </Button>
          </div>

          {/* All Complete Message */}
          {allComplete && children.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900">
                    Everyone's Ready! 🎉
                  </h3>
                  <p className="text-green-700">
                    All checklists are complete. Have a great day at school!
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Dakboard-style Children Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : children.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No children added yet</p>
            <Button asChild>
              <Link href="/accountability/children/new">Add Your First Child</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {children.map(child => {
              const childData = childrenData.get(child.id);
              const stats = progress.get(child.id) || {
                total: 0,
                completed: 0,
                remaining: 0,
                isComplete: false,
              };
              const percentage = stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;

              return (
                <Card key={child.id} className={`p-6 ${
                  stats.isComplete
                    ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-300'
                    : 'bg-white'
                }`}>
                  {/* Child Header */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <ChildAvatar
                      name={child.name}
                      avatarType={child.avatar_type}
                      avatarData={child.avatar_data}
                      avatarBackground={child.avatar_background}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {child.name}
                      </h3>
                      {child.age && (
                        <p className="text-sm text-gray-600">Age {child.age}</p>
                      )}
                    </div>
                    {stats.isComplete && stats.total > 0 && (
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  {stats.total > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Progress</span>
                        <span className="font-bold text-gray-900">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                      {stats.isComplete && (
                        <p className="text-green-600 font-semibold text-sm mt-2">
                          ✓ All done! 🎉
                        </p>
                      )}
                    </div>
                  )}

                  {/* Checklist Items */}
                  {!childData || childData.checklist.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <p>No checklist items yet</p>
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/accountability/checklist/manage">Add Items</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {childData.checklist.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(child.id, item.id, item.isCompleted)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                            item.isCompleted
                              ? 'bg-green-100 border border-green-300'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {/* Checkbox Icon */}
                          <div className="flex-shrink-0">
                            {item.isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-400" />
                            )}
                          </div>

                          {/* Item Icon */}
                          {item.icon && (
                            <div className="text-2xl flex-shrink-0">
                              {item.icon}
                            </div>
                          )}

                          {/* Item Title */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${
                              item.isCompleted
                                ? 'text-green-900 line-through'
                                : 'text-gray-900'
                            }`}>
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View Details Link */}
                  {childData && childData.checklist.length > 0 && (
                    <Button variant="link" asChild className="w-full mt-4">
                      <Link href={`/accountability/checklist/${child.id}`}>
                        Open Full Checklist →
                      </Link>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
