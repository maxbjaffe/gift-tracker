'use client'

import { useRouter } from 'next/navigation'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { getUpcomingOccasions, type UpcomingOccasion, type GiftStatus } from '@/lib/dashboard/readiness-score'
import { CalendarDays, Gift, ArrowRight } from 'lucide-react'

const STATUS_CONFIG: Record<GiftStatus, { label: string; className: string }> = {
  none: { label: 'No Gift', className: 'bg-red-100 text-red-700' },
  idea: { label: 'Idea', className: 'bg-blue-100 text-blue-700' },
  purchased: { label: 'Purchased', className: 'bg-green-100 text-green-700' },
  wrapped: { label: 'Wrapped', className: 'bg-purple-100 text-purple-700' },
  given: { label: 'Given', className: 'bg-emerald-100 text-emerald-700' },
}

const OCCASION_BADGE: Record<string, { emoji: string; className: string }> = {
  birthday: { emoji: '🎂', className: 'bg-purple-100 text-purple-700' },
  holiday: { emoji: '🎄', className: 'bg-red-100 text-red-700' },
  custom: { emoji: '📅', className: 'bg-gray-100 text-gray-700' },
}

function groupByWeek(occasions: UpcomingOccasion[]): { label: string; occasions: UpcomingOccasion[] }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const groups: { label: string; occasions: UpcomingOccasion[] }[] = []

  // Overdue
  const overdue = occasions.filter(o => o.daysUntil < 0)
  if (overdue.length > 0) {
    groups.push({ label: 'Overdue', occasions: overdue })
  }

  // This week
  const thisWeek = occasions.filter(o => o.daysUntil >= 0 && o.daysUntil <= 7)
  if (thisWeek.length > 0) {
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    groups.push({
      label: `This Week (${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      occasions: thisWeek,
    })
  }

  // Group remaining by week
  let weekStart = 8
  while (weekStart <= 150) {
    const weekEnd = weekStart + 6
    const weekOccasions = occasions.filter(o => o.daysUntil >= weekStart && o.daysUntil <= weekEnd)
    if (weekOccasions.length > 0) {
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() + weekStart)
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + weekEnd)
      groups.push({
        label: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        occasions: weekOccasions,
      })
    }
    weekStart += 7
  }

  return groups
}

function OccasionRow({ occasion }: { occasion: UpcomingOccasion }) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[occasion.giftStatus]
  const badge = OCCASION_BADGE[occasion.occasionType] || OCCASION_BADGE.custom

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/70 rounded-lg hover:bg-white hover:shadow-sm transition-all">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {occasion.occasionType === 'holiday' ? badge.emoji : occasion.recipientName[0]}
      </div>

      {/* Name + occasion */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{occasion.recipientName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.className}`}>
            {badge.emoji} {occasion.occasionType === 'birthday' ? 'Birthday' : occasion.occasionType === 'holiday' ? 'Holiday' : 'Event'}
          </span>
          <span className="text-[10px] text-gray-500">
            {occasion.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Gift status pill */}
      {occasion.occasionType !== 'holiday' && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      )}

      {/* Days countdown */}
      <div className="text-right flex-shrink-0 w-12">
        <p className={`text-sm font-bold ${occasion.daysUntil <= 3 ? 'text-orange-500' : 'text-gray-700'}`}>
          {occasion.daysUntil < 0 ? `${Math.abs(occasion.daysUntil)}d` : occasion.daysUntil === 0 ? 'Today' : `${occasion.daysUntil}d`}
        </p>
      </div>

      {/* Action */}
      {occasion.occasionType !== 'holiday' && occasion.giftStatus === 'none' && (
        <button
          onClick={() => router.push(`/chat?prefix=${encodeURIComponent(`Gift ideas for ${occasion.recipientName}: `)}`)}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors"
          title="Find gift"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default function OccasionsPage() {
  const { recipients, loading: recipientsLoading } = useRecipients()
  const { gifts, loading: giftsLoading } = useGifts()

  const loading = recipientsLoading || giftsLoading

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingSpinner type="card" count={3} />
      </div>
    )
  }

  const occasions = getUpcomingOccasions(recipients || [], gifts || [], 150)
  const weekGroups = groupByWeek(occasions)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
          <p className="text-sm text-gray-500 mt-1">Next 5 months</p>
        </div>
        <CalendarDays className="w-6 h-6 text-gray-400" />
      </div>

      {weekGroups.length === 0 ? (
        <div className="text-center py-16">
          <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No upcoming occasions</p>
          <p className="text-sm text-gray-400 mt-1">
            Add birthdays to your recipients to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {weekGroups.map((group) => (
            <div key={group.label}>
              <h2 className={`text-xs font-semibold uppercase tracking-wide mb-2 px-1 ${
                group.label === 'Overdue' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {group.label}
              </h2>
              <div className="space-y-1.5">
                {group.occasions.map((o, i) => (
                  <OccasionRow key={`${o.recipientId}-${o.occasionName}-${i}`} occasion={o} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
