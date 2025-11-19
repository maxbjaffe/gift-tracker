'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChildAvatar } from '@/components/ChildAvatar';
import { Ban, Target, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { format, formatDistance, differenceInHours, isPast } from 'date-fns';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_type: string | null;
  avatar_data: string | null;
  avatar_background: string | null;
}

interface Consequence {
  id: string;
  child_id: string;
  child: { id: string; name: string };
  restriction_type: string;
  restriction_item: string;
  reason: string;
  severity: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

interface Commitment {
  id: string;
  child_id: string;
  child: { id: string; name: string };
  commitment_text: string;
  category: string;
  due_date: string;
  status: string;
  completed_at: string | null;
  completed_on_time: boolean | null;
}

interface AccountabilityData {
  children: Child[];
  consequences: Consequence[];
  commitments: Commitment[];
}

function AccountabilityKioskContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [data, setData] = useState<AccountabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!token) {
      setError('No kiosk token provided in URL');
      setLoading(false);
      return;
    }

    loadData();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(loadData, 30000);

    // Update time every second for countdown timers
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
  }, [token]);

  async function loadData() {
    try {
      if (!token) return;

      const response = await fetch(`/api/kiosk/accountability?token=${encodeURIComponent(token)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load' }));
        setError(errorData.error || `Failed to load (${response.status})`);
        setLoading(false);
        return;
      }

      const accountabilityData = await response.json();
      setData(accountabilityData);
      setError(null);
    } catch (error) {
      console.error('Error loading accountability data:', error);
      setError(`Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  const getRestrictionIcon = (type: string) => {
    switch (type) {
      case 'device': return '📱';
      case 'activity': return '🎮';
      case 'privilege': return '✨';
      case 'location': return '📍';
      default: return '🚫';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'homework': return '📚';
      case 'chores': return '🧹';
      case 'responsibilities': return '🎯';
      case 'behavior': return '🌟';
      default: return '📋';
    }
  };

  const getProgressData = (consequence: Consequence) => {
    if (!consequence.expires_at) return null;

    const now = currentTime;
    const startDate = new Date(consequence.created_at);
    const endDate = new Date(consequence.expires_at);

    const totalDuration = differenceInHours(endDate, startDate);
    const elapsed = differenceInHours(now, startDate);
    const remaining = differenceInHours(endDate, now);

    if (totalDuration <= 0) return null;

    const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return {
      percentage,
      remaining,
      isAlmostOver: percentage >= 75,
    };
  };

  const getTimeRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = currentTime;

    if (isPast(due)) {
      return {
        text: `Overdue by ${formatDistance(due, now)}`,
        isOverdue: true,
      };
    }

    return {
      text: formatDistance(due, now, { addSuffix: true }),
      isOverdue: false,
    };
  };

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

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Group commitments by child
  const commitmentsByChild = data.children.map(child => ({
    child,
    commitments: data.commitments.filter(c => c.child_id === child.id),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
      {/* AI Max on margins */}
      <div className="fixed -left-32 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max Left"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>
      <div className="fixed -right-32 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max Right"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Family Accountability
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                {format(currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active Consequences */}
        {data.consequences.length > 0 && (
          <Card className="p-6 mb-6 border-red-300 bg-red-50/50">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">Active Consequences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.consequences.map(consequence => {
                const progressData = getProgressData(consequence);
                const child = data.children.find(c => c.id === consequence.child_id);

                return (
                  <Card key={consequence.id} className="p-4 bg-white border-red-200">
                    <div className="flex items-start gap-3 mb-3">
                      {child && (
                        <ChildAvatar
                          name={child.name}
                          avatarType={child.avatar_type}
                          avatarData={child.avatar_data}
                          avatarBackground={child.avatar_background}
                          size="md"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {consequence.child.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl">{getRestrictionIcon(consequence.restriction_type)}</span>
                          <span className="font-semibold text-red-700">
                            {consequence.restriction_item}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {consequence.reason}
                    </p>

                    {progressData && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={`font-medium ${progressData.isAlmostOver ? 'text-green-600' : 'text-orange-600'}`}>
                            {progressData.remaining > 24 ? (
                              `${Math.ceil(progressData.remaining / 24)} days left`
                            ) : progressData.remaining > 0 ? (
                              `${progressData.remaining} hours left`
                            ) : (
                              'Almost done!'
                            )}
                          </span>
                          <span className="text-gray-500">
                            {Math.round(progressData.percentage)}%
                          </span>
                        </div>
                        <Progress value={progressData.percentage} className="h-3" />
                        {progressData.isAlmostOver && (
                          <p className="text-xs text-green-600 font-medium">
                            🎉 Almost there!
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {/* Today's Commitments */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Commitments</h2>
          </div>

          {commitmentsByChild.every(({ commitments }) => commitments.length === 0) ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">No commitments for today</p>
              <p className="text-sm mt-2">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {commitmentsByChild.map(({ child, commitments }) => {
                if (commitments.length === 0) return null;

                return (
                  <div key={child.id} className="space-y-3">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200">
                      <ChildAvatar
                        name={child.name}
                        avatarType={child.avatar_type}
                        avatarData={child.avatar_data}
                        avatarBackground={child.avatar_background}
                        size="md"
                      />
                      <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                      <span className="text-sm text-gray-500">
                        {commitments.filter(c => c.status === 'completed').length}/{commitments.length} completed
                      </span>
                    </div>

                    <div className="space-y-2 pl-12">
                      {commitments.map(commitment => {
                        const timeInfo = getTimeRemaining(commitment.due_date);
                        const isCompleted = commitment.status === 'completed';

                        return (
                          <div
                            key={commitment.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                              isCompleted
                                ? 'bg-green-50 border-green-300'
                                : timeInfo.isOverdue
                                ? 'bg-red-50 border-red-300'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <span className="text-2xl flex-shrink-0">
                              {getCategoryIcon(commitment.category)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-base ${isCompleted ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                                {commitment.commitment_text}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                      Completed {commitment.completed_on_time ? 'on time' : 'late'}
                                    </span>
                                  </>
                                ) : timeInfo.isOverdue ? (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600 font-medium">{timeInfo.text}</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span className="text-blue-600 font-medium">Due {timeInfo.text}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AccountabilityKioskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    }>
      <AccountabilityKioskContent />
    </Suspense>
  );
}
