// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'idea' | 'researching' | 'purchased' | 'wrapped' | 'given'

const statusConfig: Record<Status, { label: string; className: string }> = {
  idea: {
    label: 'Idea',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  researching: {
    label: 'Researching',
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  purchased: {
    label: 'Purchased',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  wrapped: {
    label: 'Wrapped',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  given: {
    label: 'Given',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as Status] || statusConfig.idea

  return (
    <Badge className={cn(config.className, className)} variant="secondary">
      {config.label}
    </Badge>
  )
}