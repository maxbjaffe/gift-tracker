'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Lightbulb, Gift as GiftIcon } from 'lucide-react'
import { groupGiftsByStashProfile, type StashProfileType } from '@/lib/dashboard/stash-data'
import { BucketCard } from './BucketCard'
import type { GiftWithRecipients, Recipient } from '@/types/database.types'
import Link from 'next/link'

interface StashOverviewProps {
  gifts: GiftWithRecipients[]
  recipients: Recipient[]
}

const CHIP_CONFIG: Record<StashProfileType, { emoji: string; label: string; bg: string }> = {
  kids_party: { emoji: '🎈', label: "Kids' Party", bg: 'bg-purple-100 text-purple-700' },
  teacher:    { emoji: '🎓', label: 'Teacher',     bg: 'bg-blue-100 text-blue-700' },
  host:       { emoji: '🏡', label: 'Host',        bg: 'bg-amber-100 text-amber-700' },
  general:    { emoji: '📦', label: 'General',     bg: 'bg-teal-100 text-teal-700' },
  specific:   { emoji: '🎯', label: 'Assigned',    bg: 'bg-orange-100 text-orange-700' },
}

const BUCKET_GRADIENT: Record<StashProfileType, { gradient: string; border: string; icon: typeof Package }> = {
  specific:   { gradient: 'bg-gradient-to-r from-orange-500 to-amber-500', border: 'border-orange-400', icon: GiftIcon },
  kids_party: { gradient: 'bg-gradient-to-r from-purple-500 to-pink-500', border: 'border-purple-400', icon: GiftIcon },
  teacher:    { gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',   border: 'border-blue-400',   icon: GiftIcon },
  host:       { gradient: 'bg-gradient-to-r from-amber-500 to-yellow-500', border: 'border-amber-400', icon: GiftIcon },
  general:    { gradient: 'bg-gradient-to-r from-teal-500 to-emerald-500', border: 'border-teal-400',  icon: Package },
}

export function StashOverview({ gifts, recipients }: StashOverviewProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const onHandGifts = useMemo(
    () => gifts.filter(g => g.status === 'purchased' || g.status === 'wrapped'),
    [gifts]
  )

  const groups = useMemo(
    () => groupGiftsByStashProfile(onHandGifts, recipients),
    [onHandGifts, recipients]
  )

  const totalCount = onHandGifts.length

  return (
    <div className="bg-white/60 rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Your Stash</h2>
        </div>
        <span className="bg-orange-100 text-orange-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
          {totalCount}
        </span>
      </div>

      {/* Chips row */}
      {groups.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {groups.map(group => {
            const config = CHIP_CONFIG[group.profileType]
            return (
              <span
                key={group.profileType}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg}`}
              >
                {config.emoji} {config.label}: {group.gifts.length}
              </span>
            )
          })}
        </div>
      )}

      {/* Status callout */}
      <div className="mt-3">
        {totalCount === 0 ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800 flex-1">Your stash is empty — stock up for surprise moments!</span>
            <Link
              href="/stash"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
            >
              Browse →
            </Link>
          </div>
        ) : totalCount < 5 ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
            <Lightbulb className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">{totalCount} gift{totalCount !== 1 ? 's' : ''} on hand</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-800">You&apos;re covered! {totalCount} gifts ready for any occasion</span>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {groups.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-giftstash-orange transition-colors"
          >
            {expanded ? 'Hide details' : 'See all →'}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              {groups.map(group => {
                const config = BUCKET_GRADIENT[group.profileType]
                return (
                  <BucketCard
                    key={group.profileType}
                    title={group.label}
                    icon={config.icon}
                    gradientClasses={config.gradient}
                    borderColor={config.border}
                    items={group.gifts}
                    onItemClick={(g) => router.push(`/gifts/${g.id}`)}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
