// src/components/shared/EmptyState.tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="mb-4 text-6xl">{icon}</div>}
      
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
      
      <p className="mb-6 text-gray-600">{description}</p>

      {(actionLabel && actionHref) && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}

      {(actionLabel && onAction) && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  )
}