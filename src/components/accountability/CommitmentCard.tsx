import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import type { Commitment } from '@/types/accountability';
import { format, formatDistance, isPast } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle, Target } from 'lucide-react';

interface CommitmentCardProps {
  commitment: Commitment;
  onComplete?: (id: string, onTime: boolean) => void;
  onMissed?: (id: string) => void;
  onExtend?: (id: string) => void;
  showActions?: boolean;
}

export function CommitmentCard({
  commitment,
  onComplete,
  onMissed,
  onExtend,
  showActions = true,
}: CommitmentCardProps) {
  const isActive = commitment.status === 'active';
  const isCompleted = commitment.status === 'completed';
  const isMissed = commitment.status === 'missed';
  const dueDate = new Date(commitment.due_date);
  const isPastDue = isPast(dueDate) && isActive;

  const getCategoryIcon = () => {
    switch (commitment.category) {
      case 'homework':
        return '📚';
      case 'chores':
        return '🧹';
      case 'responsibilities':
        return '🎯';
      case 'behavior':
        return '🌟';
      default:
        return '📋';
    }
  };

  const getCategoryColor = () => {
    switch (commitment.category) {
      case 'homework':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'chores':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'responsibilities':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'behavior':
        return 'bg-pink-100 text-pink-700 border-pink-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDueDateText = () => {
    if (isCompleted) {
      return format(dueDate, 'MMM d, yyyy h:mm a');
    }

    if (isMissed) {
      return `Was due ${formatDistance(dueDate, new Date(), { addSuffix: true })}`;
    }

    if (isPastDue) {
      return `Overdue by ${formatDistance(dueDate, new Date())}`;
    }

    const now = new Date();
    if (dueDate < now) {
      return format(dueDate, 'MMM d, yyyy h:mm a');
    }

    return `Due ${formatDistance(dueDate, now, { addSuffix: true })}`;
  };

  const wasOnTime = commitment.completed_on_time === true;
  const wasLate = commitment.completed_on_time === false;

  return (
    <Card
      className={`p-4 ${
        isActive && isPastDue
          ? 'border-red-300 bg-red-50/30'
          : isActive
          ? 'border-blue-300 bg-blue-50/30'
          : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{getCategoryIcon()}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">
                  {commitment.child?.name || 'Unknown Child'}
                </h3>
                <StatusBadge status={commitment.status} type="commitment" />
                <Badge variant="outline" className={getCategoryColor()}>
                  {commitment.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-900 mt-1 font-medium">
                {commitment.commitment_text}
              </p>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className="pl-11 flex items-center gap-2 text-sm">
          {isCompleted && wasOnTime && <CheckCircle className="h-4 w-4 text-green-600" />}
          {isCompleted && wasLate && <Clock className="h-4 w-4 text-yellow-600" />}
          {isMissed && <XCircle className="h-4 w-4 text-red-600" />}
          {isActive && !isPastDue && <Target className="h-4 w-4 text-blue-600" />}
          {isPastDue && <AlertCircle className="h-4 w-4 text-red-600" />}
          <span
            className={`${
              isPastDue
                ? 'text-red-600 font-medium'
                : isCompleted && wasOnTime
                ? 'text-green-600'
                : 'text-gray-600'
            }`}
          >
            {getDueDateText()}
          </span>
        </div>

        {/* Completion Info */}
        {isCompleted && (
          <div className="pl-11">
            <Badge
              variant="outline"
              className={wasOnTime ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}
            >
              {wasOnTime ? '✓ Completed On Time' : '⏰ Completed Late'}
            </Badge>
            {commitment.completed_at && (
              <p className="text-xs text-gray-500 mt-1">
                Completed {format(new Date(commitment.completed_at), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        )}

        {/* Related Consequence */}
        {commitment.related_consequence_id && (
          <div className="pl-11">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Triggered a consequence
            </Badge>
          </div>
        )}

        {/* Extension Info */}
        {commitment.extension_requested_at && (
          <div className="pl-11">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              <Clock className="h-3 w-3 mr-1" />
              Extension requested
            </Badge>
            {commitment.extension_reason && (
              <p className="text-sm text-gray-600 mt-1 italic">{commitment.extension_reason}</p>
            )}
          </div>
        )}

        {/* Notes */}
        {commitment.notes && (
          <div className="pl-11 text-sm text-gray-600 italic bg-gray-50 rounded p-2">
            {commitment.notes}
          </div>
        )}

        {/* Timestamps */}
        <div className="pl-11 text-xs text-gray-500">
          <p>Created {format(new Date(commitment.created_at), 'MMM d, yyyy h:mm a')}</p>
          {commitment.verified_by && (
            <p className="mt-1">Verified by parent</p>
          )}
        </div>

        {/* Actions */}
        {showActions && isActive && (
          <div className="pl-11 flex gap-2 flex-wrap pt-2 border-t">
            {onComplete && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onComplete(commitment.id, !isPastDue)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
                {onMissed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMissed(commitment.id)}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Mark Missed
                  </Button>
                )}
              </>
            )}
            {onExtend && !isPastDue && (
              <Button size="sm" variant="outline" onClick={() => onExtend(commitment.id)}>
                <Clock className="h-4 w-4 mr-1" />
                Request Extension
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
