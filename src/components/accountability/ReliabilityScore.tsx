import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import type { CommitmentStats } from '@/types/accountability';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ReliabilityScoreProps {
  stats: CommitmentStats | null;
  showDetails?: boolean;
}

export function ReliabilityScore({ stats, showDetails = false }: ReliabilityScoreProps) {
  if (!stats || stats.total_commitments === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No commitment data yet</p>
      </div>
    );
  }

  const score = stats.reliability_score || 0;
  const total = stats.total_commitments;
  const onTime = stats.completed_on_time;
  const late = stats.completed_late;
  const missed = stats.missed;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    switch (stats.improvement_trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {Math.round(score)}%
        </span>
        {stats.improvement_trend && getTrendIcon()}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Score Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Reliability Score</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {Math.round(score)}%
              </span>
              <span className="text-sm text-gray-500">
                {getScoreLabel(score)}
              </span>
            </div>
          </div>
          {stats.improvement_trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="text-xs text-gray-600 capitalize">
                {stats.improvement_trend}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <Progress value={score} className="h-2" />

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t">
          <div>
            <p className="text-2xl font-bold text-green-600">{onTime}</p>
            <p className="text-xs text-gray-600">On Time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{late}</p>
            <p className="text-xs text-gray-600">Late</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{missed}</p>
            <p className="text-xs text-gray-600">Missed</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {(stats.homework_count > 0 || stats.chores_count > 0 || stats.other_count > 0) && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-gray-600 mb-2">By Category</p>
            <div className="flex gap-2 flex-wrap">
              {stats.homework_count > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  Homework: {stats.homework_count}
                </span>
              )}
              {stats.chores_count > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  Chores: {stats.chores_count}
                </span>
              )}
              {stats.other_count > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  Other: {stats.other_count}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          Total Commitments This Month: {total}
        </div>
      </div>
    </Card>
  );
}
