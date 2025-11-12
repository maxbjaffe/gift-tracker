// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'idea' | 'purchased' | 'wrapped' | 'delivered'

const statusConfig: Record<Status, { label: string; className: string; icon: string }> = {
  idea: {
    label: 'Idea',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
    icon: '💡',
  },
  purchased: {
    label: 'Purchased',
    className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
    icon: '🛒',
  },
  wrapped: {
    label: 'Wrapped',
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200',
    icon: '🎁',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200',
    icon: '✅',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status as Status] || statusConfig.idea

  return (
    <Badge className={cn(config.className, 'border', className)} variant="secondary">
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  )
}