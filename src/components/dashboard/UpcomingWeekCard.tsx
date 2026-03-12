'use client'

import type { UpcomingOccasion } from '@/lib/dashboard/readiness-score'

interface UpcomingWeekCardProps {
  occasions: UpcomingOccasion[]
}

const STATUS_DOT: Record<string, string> = {
  none: 'bg-red-400',
  idea: 'bg-yellow-400',
  purchased: 'bg-green-400',
  wrapped: 'bg-purple-400',
  given: 'bg-emerald-400',
}

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  holiday: '🎁',
  custom: '📅',
}

export function UpcomingWeekCard({ occasions }: UpcomingWeekCardProps) {
  const weekOccasions = occasions
    .filter(o => o.daysUntil >= 0 && o.daysUntil <= 7)
    .slice(0, 5)

  if (weekOccasions.length === 0) return null

  return (
    <div className="bg-white/60 rounded-2xl shadow-sm p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">This Week</h3>
      <div className="space-y-2">
        {weekOccasions.map((o, i) => (
          <div key={`${o.recipientId}-${o.occasionName}-${i}`} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] flex-shrink-0">
              {o.recipientName[0]}
            </div>
            <span className="text-xs text-gray-700 flex-1 truncate">{o.recipientName}</span>
            <span className="text-xs">{OCCASION_EMOJI[o.occasionType]}</span>
            <div className={`w-2 h-2 rounded-full ${STATUS_DOT[o.giftStatus] || STATUS_DOT.none}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
