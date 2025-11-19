'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Sparkles, RefreshCw } from 'lucide-react';
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

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  display_order: number;
  isCompleted: boolean;
}

interface ChildChecklistData {
  checklist: ChecklistItem[];
  stats: {
    total: number;
    completed: number;
    remaining: number;
    isComplete: boolean;
  };
}

export default function KioskChecklistPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [children, setChildren] = useState<Child[]>([]);
  const [childrenData, setChildrenData] = useState<Map<string, ChildChecklistData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyTokenAndLoadData();
    } else {
      setError('No kiosk token provided');
      setLoading(false);
    }
  }, [token]);

  async function verifyTokenAndLoadData() {
    try {
      setLoading(true);
      setError(null);

      // Verify token and get user ID
      const verifyResponse = await fetch(`/api/kiosk/verify?token=${token}`);
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || 'Invalid token');
        setLoading(false);
        return;
      }

      setUserId(verifyData.userId);
      await loadData(verifyData.userId);
    } catch (error) {
      console.error('Error verifying token:', error);
      setError('Failed to verify kiosk token');
      setLoading(false);
    }
  }

  async function loadData(uid: string) {
    try {
      // Load children with token auth
      const childrenResponse = await fetch(`/api/kiosk/children?token=${token}`);
      const childrenDataResponse = await childrenResponse.json();

      if (childrenResponse.ok && childrenDataResponse.children) {
        setChildren(childrenDataResponse.children);

        // Load checklist data for each child
        const dataMap = new Map<string, ChildChecklistData>();

        for (const child of childrenDataResponse.children) {
          const checklistResponse = await fetch(
            `/api/kiosk/checklist/${child.id}?token=${token}`
          );
          const checklistData = await checklistResponse.json();

          if (checklistResponse.ok) {
            dataMap.set(child.id, {
              checklist: checklistData.checklist || [],
              stats: checklistData.stats,
            });
          }
        }

        setChildrenData(dataMap);
      }
    } catch (error) {
      console.error('Error loading checklist data:', error);
      setError('Failed to load checklist data');
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(childId: string, itemId: string, isCurrentlyCompleted: boolean) {
    try {
      if (isCurrentlyCompleted) {
        await fetch(
          `/api/kiosk/checklist/completions?token=${token}&child_id=${childId}&item_id=${itemId}`,
          { method: 'DELETE' }
        );
      } else {
        await fetch(`/api/kiosk/checklist/completions?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ child_id: childId, item_id: itemId }),
        });
      }

      // Reload data
      if (userId) {
        await loadData(userId);
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update checklist');
    }
  }

  const allComplete =
    children.length > 0 &&
    children.every((child) => childrenData.get(child.id)?.stats.isComplete);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please use the kiosk URL from your account settings.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Morning Checklist
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => userId && loadData(userId)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
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

        {/* Children Grid */}
        {children.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No children added yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {children.map((child) => {
              const childData = childrenData.get(child.id);
              const stats = childData?.stats || {
                total: 0,
                completed: 0,
                remaining: 0,
                isComplete: false,
              };
              const percentage =
                stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

              return (
                <Card
                  key={child.id}
                  className={`p-6 ${
                    stats.isComplete
                      ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-300'
                      : 'bg-white'
                  }`}
                >
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
                      <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                      {child.age && <p className="text-sm text-gray-600">Age {child.age}</p>}
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
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {childData.checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(child.id, item.id, item.isCompleted)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                            item.isCompleted
                              ? 'bg-green-100 border border-green-300'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {item.isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          {item.icon && (
                            <div className="text-2xl flex-shrink-0">{item.icon}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-sm ${
                                item.isCompleted
                                  ? 'text-green-900 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
