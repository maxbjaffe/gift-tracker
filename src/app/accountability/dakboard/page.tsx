'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fetchAccountabilityDashboard } from '@/lib/services/accountability';
import type { AccountabilityDashboard } from '@/types/accountability';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format, differenceInDays, differenceInHours } from 'date-fns';
import { Shield, Target, Clock, CheckCircle2, AlertCircle, TrendingDown } from 'lucide-react';
import { filterActiveConsequences, filterActiveCommitments } from '@/lib/utils/date-filters';

export default function DAKBoardView() {
  const [dashboard, setDashboard] = useState<AccountabilityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboard();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadDashboard();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const data = await fetchAccountabilityDashboard();
      setDashboard(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const expiresDate = new Date(expiresAt);
    if (isPast(expiresDate)) return { text: 'Expired', color: 'text-gray-400' };

    const distance = formatDistanceToNow(expiresDate, { addSuffix: false });

    // Color code based on time remaining
    const hoursRemaining = (expiresDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursRemaining < 2) return { text: distance, color: 'text-red-400' };
    if (hoursRemaining < 12) return { text: distance, color: 'text-orange-400' };
    return { text: distance, color: 'text-blue-400' };
  };

  const getCommitmentDueTime = (dueDate: string) => {
    const due = new Date(dueDate);
    if (isPast(due)) return { text: 'Overdue', color: 'text-red-400', urgent: true };
    if (isToday(due)) return { text: `Today ${format(due, 'h:mm a')}`, color: 'text-orange-400', urgent: true };
    if (isTomorrow(due)) return { text: `Tomorrow ${format(due, 'h:mm a')}`, color: 'text-yellow-400', urgent: false };
    return { text: format(due, 'EEE h:mm a'), color: 'text-blue-400', urgent: false };
  };

  const getProgressData = (createdAt: string, expiresAt: string | null) => {
    if (!expiresAt) return null;

    const now = new Date();
    const startDate = new Date(createdAt);
    const endDate = new Date(expiresAt);

    const totalDuration = differenceInHours(endDate, startDate);
    const elapsed = differenceInHours(now, startDate);
    const remaining = differenceInHours(endDate, now);

    if (totalDuration <= 0 || isPast(endDate)) return null;

    const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const daysRemaining = differenceInDays(endDate, now);
    const hoursRemaining = remaining % 24;

    return {
      percentage,
      daysRemaining,
      hoursRemaining,
      isAlmostOver: percentage >= 75,
    };
  };

  const getChildStatus = (childId: string) => {
    // Filter out expired consequences in real-time
    const allConsequences = dashboard?.activeConsequences.filter(c => c.child_id === childId) || [];
    const consequences = filterActiveConsequences(allConsequences);
    const allCommitments = dashboard?.activeCommitments.filter(c => c.child_id === childId) || [];
    const commitments = filterActiveCommitments(allCommitments);
    const stats = dashboard?.recentStats.find(s => s.child_id === childId);

    if (consequences.length === 0 && commitments.length === 0) {
      return { emoji: '✅', text: 'All Clear', color: 'text-green-400' };
    }
    if (consequences.length > 0) {
      return { emoji: '🚫', text: `${consequences.length} Restriction${consequences.length > 1 ? 's' : ''}`, color: 'text-red-400' };
    }
    if (commitments.length > 0) {
      return { emoji: '📝', text: `${commitments.length} Commitment${commitments.length > 1 ? 's' : ''}`, color: 'text-blue-400' };
    }
    return { emoji: '✅', text: 'All Clear', color: 'text-green-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!dashboard || dashboard.children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
        <Card className="bg-gray-800 border-gray-700 p-12 text-center">
          <p className="text-white text-3xl">No children added yet</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            Family Accountability
          </h1>
          <p className="text-gray-400 text-xl">
            Last updated {format(lastUpdate, 'h:mm a')}
          </p>
        </div>

        {/* All Clear Message */}
        {dashboard.activeConsequences.length === 0 && dashboard.activeCommitments.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-16 text-center">
            <CheckCircle2 className="h-32 w-32 text-green-400 mx-auto mb-6" />
            <h2 className="text-6xl font-bold text-white mb-4">All Clear!</h2>
            <p className="text-3xl text-gray-400">
              No active restrictions or commitments
            </p>
          </Card>
        )}

        {/* Children Status - Side by Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboard.children.map((child) => {
          // Filter out expired consequences and commitments in real-time
          const childConsequences = filterActiveConsequences(
            dashboard.activeConsequences.filter(c => c.child_id === child.id)
          );
          const childCommitments = filterActiveCommitments(
            dashboard.activeCommitments.filter(c => c.child_id === child.id)
          );

          // Skip if this child has nothing active
          if (childConsequences.length === 0 && childCommitments.length === 0) {
            return null;
          }

          return (
            <Card key={child.id} className="bg-gray-800 border-gray-700 p-6">
              {/* Child Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: child.avatar_color || '#6B7280' }}
                >
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{child.name}</h2>
                  <p className="text-gray-400 text-lg">Age {child.age}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Active Restrictions */}
                {childConsequences.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Restrictions ({childConsequences.length})
                    </h3>
                    <div className="space-y-2">
                      {childConsequences.map((consequence) => {
                        const progressData = getProgressData(consequence.created_at, consequence.expires_at);
                        const timeRemaining = consequence.expires_at && !progressData
                          ? getTimeRemaining(consequence.expires_at)
                          : null;

                        return (
                          <Card key={consequence.id} className="bg-gray-700 border-gray-600 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">🚫</span>
                                    <span className="text-xl text-red-400 font-semibold truncate">
                                      {consequence.restriction_item}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-sm ml-8 truncate">
                                    {consequence.reason}
                                  </p>
                                </div>
                                {timeRemaining && (
                                  <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1 justify-end">
                                      <Clock className="h-4 w-4 text-gray-400" />
                                      <span className={`text-lg font-bold ${timeRemaining.color}`}>
                                        {timeRemaining.text}
                                      </span>
                                    </div>
                                    <p className="text-gray-500 text-xs">remaining</p>
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar */}
                              {progressData && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <TrendingDown className={`h-4 w-4 ${progressData.isAlmostOver ? 'text-green-400' : 'text-orange-400'}`} />
                                      <span className={`font-bold ${progressData.isAlmostOver ? 'text-green-400' : 'text-gray-300'}`}>
                                        {progressData.daysRemaining > 0 ? (
                                          <>
                                            {progressData.daysRemaining} day{progressData.daysRemaining !== 1 ? 's' : ''} {progressData.hoursRemaining > 0 && `${progressData.hoursRemaining}h`} left
                                          </>
                                        ) : progressData.hoursRemaining > 0 ? (
                                          `${progressData.hoursRemaining} hours left`
                                        ) : (
                                          'Almost done!'
                                        )}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-bold">
                                      {Math.round(progressData.percentage)}%
                                    </span>
                                  </div>

                                  {/* Visual Progress Bar */}
                                  <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                      className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                                        progressData.isAlmostOver
                                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                                          : progressData.percentage >= 50
                                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                          : 'bg-gradient-to-r from-red-400 to-red-600'
                                      }`}
                                      style={{ width: `${progressData.percentage}%` }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                                    </div>
                                  </div>

                                  {progressData.isAlmostOver && (
                                    <div className="text-sm text-green-400 font-bold flex items-center gap-1">
                                      <span>🎉</span>
                                      <span>Almost there!</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Commitments */}
                {childCommitments.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Commitments ({childCommitments.length})
                    </h3>
                    <div className="space-y-2">
                      {childCommitments.map((commitment) => {
                        const dueInfo = getCommitmentDueTime(commitment.due_date);

                        return (
                          <Card key={commitment.id} className="bg-gray-700 border-gray-600 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📝</span>
                                  <p className="text-base text-gray-300 font-medium truncate">
                                    {commitment.commitment_text}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className={`text-lg font-bold ${dueInfo.color}`}>
                                  {dueInfo.text}
                                </div>
                                {dueInfo.urgent && (
                                  <div className="flex items-center gap-1 justify-end">
                                    <AlertCircle className="h-4 w-4 text-orange-400" />
                                    <span className="text-orange-400 text-xs font-semibold">URGENT</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
}
