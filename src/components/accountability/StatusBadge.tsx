import { Badge } from '@/components/ui/badge';
import type { ConsequenceStatus, CommitmentStatus } from '@/types/accountability';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ConsequenceStatus | CommitmentStatus;
  type: 'consequence' | 'commitment';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (type === 'consequence') {
      switch (status as ConsequenceStatus) {
        case 'active':
          return { label: 'Active', className: 'bg-red-100 text-red-700 border-red-300' };
        case 'pending_confirmation':
          return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
        case 'lifted':
          return { label: 'Lifted', className: 'bg-green-100 text-green-700 border-green-300' };
        case 'expired':
          return { label: 'Expired', className: 'bg-gray-100 text-gray-700 border-gray-300' };
        case 'extended':
          return { label: 'Extended', className: 'bg-orange-100 text-orange-700 border-orange-300' };
        default:
          return { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
      }
    } else {
      switch (status as CommitmentStatus) {
        case 'active':
          return { label: 'Active', className: 'bg-blue-100 text-blue-700 border-blue-300' };
        case 'completed':
          return { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-300' };
        case 'missed':
          return { label: 'Missed', className: 'bg-red-100 text-red-700 border-red-300' };
        case 'extended':
          return { label: 'Extended', className: 'bg-purple-100 text-purple-700 border-purple-300' };
        case 'cancelled':
          return { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 border-gray-300' };
        default:
          return { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
