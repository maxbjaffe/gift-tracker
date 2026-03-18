'use client'

import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import type { GiftWithRecipients } from '@/types/database.types'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  idea: { label: 'Idea', className: 'bg-blue-100 text-blue-700' },
  purchased: { label: 'Purchased', className: 'bg-green-100 text-green-700' },
  wrapped: { label: 'Wrapped', className: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Given', className: 'bg-emerald-100 text-emerald-700' },
  given: { label: 'Given', className: 'bg-emerald-100 text-emerald-700' },
}

interface StashGiftCardProps {
  gift: GiftWithRecipients
  showRecipients?: boolean
}

export function StashGiftCard({ gift, showRecipients }: StashGiftCardProps) {
  const router = useRouter()
  const status = gift.status || 'idea'
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.idea
  const price = gift.current_price
  const recipientNames = (gift.recipients || []).map(r => r.name).filter(Boolean)

  return (
    <button
      onClick={() => router.push(`/gifts/${gift.id}`)}
      className="w-full flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
        {gift.image_url ? (
          <img
            src={gift.image_url}
            alt={gift.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-6 h-6 text-gray-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-giftstash-orange transition-colors">
          {gift.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
          {price != null && price > 0 && (
            <span className="text-xs text-gray-500 font-medium">${price.toFixed(0)}</span>
          )}
        </div>
        {showRecipients && recipientNames.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            For: {recipientNames.join(', ')}
          </p>
        )}
      </div>
    </button>
  )
}
