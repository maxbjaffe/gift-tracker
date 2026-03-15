'use client'

import { ReactNode } from 'react'
import type { GiftWithRecipients } from '@/types/database.types'

interface SectionItemProps {
  gift: GiftWithRecipients
  borderColor: string
  onClick?: () => void
  rightAction?: ReactNode
  compact?: boolean
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    idea: { label: 'Idea', className: 'bg-blue-100 text-blue-700' },
    purchased: { label: 'Purchased', className: 'bg-green-100 text-green-700' },
    wrapped: { label: 'Wrapped', className: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Given', className: 'bg-emerald-100 text-emerald-700' },
    given: { label: 'Given', className: 'bg-emerald-100 text-emerald-700' },
  }
  const c = config[status] || config.idea
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

export function SectionItem({ gift, borderColor, onClick, rightAction, compact }: SectionItemProps) {
  const status = gift.status || 'idea'
  const recipients = gift.recipients || []
  const price = gift.current_price

  return (
    <button
      onClick={onClick}
      className={`w-full text-left ${compact ? 'px-3 py-2' : 'px-3.5 py-3'} bg-white/70 rounded-lg border-l-4 transition-all duration-150 hover:bg-white hover:shadow-sm ${borderColor}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'} text-gray-900 line-clamp-1`}>
            {gift.name}
          </span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={status} />
            {recipients.length > 1 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-200 text-orange-800 font-semibold" title={recipients.map(r => r.name).join(', ')}>
                For {recipients.length}: {recipients.map(r => r.name).join(', ')}
              </span>
            ) : recipients.length === 1 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                {recipients[0].name}
              </span>
            )}
            {price != null && price > 0 && (
              <span className="text-[10px] text-gray-500 font-medium">
                ${price.toFixed(0)}
              </span>
            )}
          </div>
        </div>
        {rightAction && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {rightAction}
          </div>
        )}
      </div>
    </button>
  )
}
