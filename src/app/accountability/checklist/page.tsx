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

export default function ChecklistDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
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
      const childrenData = await childrenResponse.json();

      if (childrenResponse.ok && childrenData.children) {
        setChildren(childrenData.children);

        // Load checklist stats for each child
        const statsMap = new Map<string, ChecklistStats>();

        for (const child of childrenData.children) {
          const checklistResponse = await fetch(`/api/accountability/checklist/${child.id}`);
          const checklistData = await checklistResponse.json();

          if (checklistResponse.ok) {
            statsMap.set(child.id, checklistData.stats);
          }
        }

        setProgress(statsMap);
      }
    } catch (error) {
      console.error('Error loading checklist data:', error);
      toast.error('Failed to load checklist data');
    } finally {
      setLoading(false);
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

        {/* Children Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => {
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
                <Link key={child.id} href={`/accountability/checklist/${child.id}`}>
                  <Card className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                    stats.isComplete
                      ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-300'
                      : 'bg-white'
                  }`}>
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-4 mb-4">
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
                      {stats.isComplete && (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      )}
                    </div>

                    {/* Progress */}
                    {stats.total > 0 ? (
                      <>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">
                              {stats.completed}/{stats.total}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                        </div>
                        <p className="text-sm text-gray-600">
                          {stats.isComplete ? (
                            <span className="text-green-600 font-semibold">
                              ✓ All done!
                            </span>
                          ) : (
                            <span>
                              {stats.remaining} item{stats.remaining !== 1 ? 's' : ''} remaining
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No checklist items yet
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
