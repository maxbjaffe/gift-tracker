'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ChevronDown, ChevronUp, Gift as GiftIcon } from 'lucide-react'
import { groupGiftsByStashProfile, type StashProfileType } from '@/lib/dashboard/stash-data'
import { BucketCard } from './BucketCard'
import Avatar from '@/components/Avatar'
import type { GiftWithRecipients, Recipient } from '@/types/database.types'
import type { UpcomingOccasion } from '@/lib/dashboard/readiness-score'
import Link from 'next/link'

interface StashOverviewProps {
  gifts: GiftWithRecipients[]
  recipients: Recipient[]
  occasions: UpcomingOccasion[]
}

const BUCKET_GRADIENT: Record<StashProfileType, { gradient: string; border: string; icon: typeof Package }> = {
  specific:   { gradient: 'bg-gradient-to-r from-orange-500 to-amber-500', border: 'border-orange-400', icon: GiftIcon },
  kids_party: { gradient: 'bg-gradient-to-r from-purple-500 to-pink-500', border: 'border-purple-400', icon: GiftIcon },
  teacher:    { gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',   border: 'border-blue-400',   icon: GiftIcon },
  host:       { gradient: 'bg-gradient-to-r from-amber-500 to-yellow-500', border: 'border-amber-400', icon: GiftIcon },
  general:    { gradient: 'bg-gradient-to-r from-teal-500 to-emerald-500', border: 'border-teal-400',  icon: Package },
}

interface PersonCoverage {
  recipientId: string
  recipientName: string
  recipient: Recipient | null
  occasionName: string
  daysUntil: number
  covered: boolean
  gifts: GiftWithRecipients[]
}

export function StashOverview({ gifts, recipients, occasions }: StashOverviewProps) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  const recipientMap = useMemo(
    () => Object.fromEntries(recipients.map(r => [r.id, r])),
    [recipients]
  )

  // Per-person coverage: for each non-holiday upcoming occasion, check if they have purchased/wrapped gifts
  const coverage = useMemo<PersonCoverage[]>(() => {
    return occasions
      .filter(o => o.recipientId !== '__holiday__')
      .map(o => {
        const readyGifts = o.assignedGifts.filter(g =>
          g.status === 'purchased' || g.status === 'wrapped'
        )
        return {
          recipientId: o.recipientId,
          recipientName: o.recipientName,
          recipient: recipientMap[o.recipientId] || null,
          occasionName: o.occasionType === 'birthday' ? 'Birthday' : o.occasionName.split(' — ')[1] || o.occasionName,
          daysUntil: o.daysUntil,
          covered: readyGifts.length > 0,
          gifts: readyGifts,
        }
      })
  }, [occasions, recipientMap])

  const onHandGifts = useMemo(
    () => gifts.filter(g => g.status === 'purchased' || g.status === 'wrapped'),
    [gifts]
  )

  const groups = useMemo(
    () => groupGiftsByStashProfile(onHandGifts, recipients),
    [onHandGifts, recipients]
  )

  const totalCount = onHandGifts.length
  const coveredCount = coverage.filter(c => c.covered).length
  const uncoveredCount = coverage.filter(c => !c.covered).length

  return (
    <div className="bg-white/60 rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Your Stash</h2>
        </div>
        <span className="bg-orange-100 text-orange-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
          {totalCount} on hand
        </span>
      </div>

      {/* Per-person coverage rows */}
      {coverage.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {coverage.map((person, i) => (
            <div
              key={`${person.recipientId}-${i}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${person.covered ? 'bg-green-50/80' : 'bg-amber-50/80'}`}
            >
              {person.recipient ? (
                <Avatar
                  type={person.recipient.avatar_type as any}
                  data={person.recipient.avatar_data || undefined}
                  background={person.recipient.avatar_background || undefined}
                  name={person.recipientName}
                  size="xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                  {person.recipientName[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">{person.recipientName}</span>
                <span className="text-xs text-gray-400 ml-1.5">{person.occasionName} &middot; {person.daysUntil}d</span>
              </div>
              {person.covered ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs font-medium text-green-700">{person.gifts[0].name}</span>
                  {person.gifts.length > 1 && (
                    <span className="text-[10px] text-green-600">+{person.gifts.length - 1}</span>
                  )}
                  <span className="text-green-600 text-sm">&#10003;</span>
                </div>
              ) : (
                <Link
                  href={`/chat?prefix=${encodeURIComponent(`Gift ideas for ${person.recipientName}'s ${person.occasionName}: `)}`}
                  className="text-xs font-medium text-amber-700 hover:text-amber-900 flex-shrink-0"
                >
                  Find a gift &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary line */}
      {coverage.length > 0 && (
        <div className="mt-2.5 text-xs text-gray-500">
          {uncoveredCount === 0
            ? `All ${coveredCount} upcoming occasions covered`
            : `${coveredCount} covered, ${uncoveredCount} still need a gift`}
        </div>
      )}

      {/* Empty stash warning */}
      {totalCount === 0 && coverage.length === 0 && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-sm text-amber-800 flex-1">Your stash is empty — stock up for surprise moments!</span>
          <Link href="/stash" className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">
            Browse &rarr;
          </Link>
        </div>
      )}

      {/* Expandable bucket detail */}
      {groups.length > 0 && (
        <>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-giftstash-orange transition-colors"
          >
            {showAll ? 'Hide details' : 'See all stash items'}
            {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showAll && (
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
