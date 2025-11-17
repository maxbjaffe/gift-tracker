import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import type { Consequence } from '@/types/accountability';
import { format, formatDistance } from 'date-fns';
import { Ban, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ConsequenceCardProps {
  consequence: Consequence;
  onLift?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onExtend?: (id: string) => void;
  showActions?: boolean;
}

export function ConsequenceCard({
  consequence,
  onLift,
  onConfirm,
  onExtend,
  showActions = true,
}: ConsequenceCardProps) {
  const isActive = consequence.status === 'active';
  const isPending = consequence.status === 'pending_confirmation';
  const isExpired = consequence.status === 'expired';
  const isLifted = consequence.status === 'lifted';

  const getExpirationText = () => {
    if (!consequence.expires_at) return 'No expiration';

    const expiresDate = new Date(consequence.expires_at);
    const now = new Date();

    if (expiresDate < now && isActive) {
      return 'Expired';
    }

    if (isExpired || isLifted) {
      return format(expiresDate, 'MMM d, yyyy');
    }

    return `Expires ${formatDistance(expiresDate, now, { addSuffix: true })}`;
  };

  const getRestrictionIcon = () => {
    switch (consequence.restriction_type) {
      case 'device':
        return '📱';
      case 'activity':
        return '🎮';
      case 'privilege':
        return '✨';
      case 'location':
        return '📍';
      default:
        return '🚫';
    }
  };

  const getSeverityColor = () => {
    switch (consequence.severity) {
      case 'major':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'minor':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className={`p-4 ${isActive ? 'border-red-300 bg-red-50/30' : ''}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{getRestrictionIcon()}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">
                  {consequence.child?.name || 'Unknown Child'}
                </h3>
                <StatusBadge status={consequence.status} type="consequence" />
                <Badge variant="outline" className={getSeverityColor()}>
                  {consequence.severity}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{consequence.restriction_item}</span> restricted
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="pl-11">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Reason:</span> {consequence.reason}
          </p>
        </div>

        {/* Expiration Info */}
        {consequence.expires_at && (
          <div className="pl-11 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={`${isActive ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {getExpirationText()}
            </span>
          </div>
        )}

        {/* Related Commitment */}
        {consequence.related_commitment_id && (
          <div className="pl-11">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Triggered by missed commitment
            </Badge>
          </div>
        )}

        {/* Notes */}
        {consequence.notes && (
          <div className="pl-11 text-sm text-gray-600 italic bg-gray-50 rounded p-2">
            {consequence.notes}
          </div>
        )}

        {/* Timestamps */}
        <div className="pl-11 text-xs text-gray-500 space-y-1">
          <p>Created {format(new Date(consequence.created_at), 'MMM d, yyyy h:mm a')}</p>
          {consequence.confirmed_at && (
            <p>Confirmed {format(new Date(consequence.confirmed_at), 'MMM d, yyyy h:mm a')}</p>
          )}
          {consequence.lifted_at && (
            <p>Lifted {format(new Date(consequence.lifted_at), 'MMM d, yyyy h:mm a')}</p>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="pl-11 flex gap-2 flex-wrap pt-2 border-t">
            {isPending && onConfirm && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onConfirm(consequence.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirm
              </Button>
            )}
            {isActive && onLift && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLift(consequence.id)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Lift Restriction
              </Button>
            )}
            {isActive && onExtend && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExtend(consequence.id)}
              >
                <Clock className="h-4 w-4 mr-1" />
                Extend
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
