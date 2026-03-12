'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import type { GiftWithRecipients } from '@/types/database.types'
import { SectionItem } from './SectionItem'

interface BucketCardProps {
  title: string
  icon: LucideIcon
  gradientClasses: string
  borderColor: string
  items: GiftWithRecipients[]
  onItemClick?: (gift: GiftWithRecipients) => void
}

export function BucketCard({
  title,
  icon: Icon,
  gradientClasses,
  borderColor,
  items,
  onItemClick,
}: BucketCardProps) {
  const [collapsed, setCollapsed] = useState(true)

  if (items.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-white/60">
        <div className={`px-4 py-3 flex items-center gap-2.5 ${gradientClasses}`}>
          <Icon className="w-5 h-5 text-white/90" />
          <h3 className="text-sm font-semibold text-white flex-1">{title}</h3>
          <span className="text-xs font-medium text-white/70 bg-white/20 px-2 py-0.5 rounded-full">0</span>
        </div>
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          Nothing here yet
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white/60">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full px-4 py-3 flex items-center gap-2.5 ${gradientClasses}`}
      >
        <Icon className="w-5 h-5 text-white/90" />
        <h3 className="text-sm font-semibold text-white flex-1 text-left">{title}</h3>
        <span className="text-xs font-medium text-white/70 bg-white/20 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronUp className="w-4 h-4 text-white/70" />
        )}
      </button>

      {collapsed && items.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 truncate border-b border-gray-100">
          {items[0].name}{items.length > 1 ? ` + ${items.length - 1} more` : ''}
        </div>
      )}

      {!collapsed && (
        <div className="px-3 py-2 space-y-1.5">
          {items.map((gift) => (
            <SectionItem
              key={gift.id}
              gift={gift}
              borderColor={borderColor}
              onClick={onItemClick ? () => onItemClick(gift) : undefined}
              compact
            />
          ))}
        </div>
      )}
    </div>
  )
}
