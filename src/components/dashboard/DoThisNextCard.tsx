'use client'

import { useRouter } from 'next/navigation'
import { Gift, Calendar, ArrowRight } from 'lucide-react'
import type { DoThisNext } from '@/lib/dashboard/occasion-data'

interface DoThisNextCardProps {
  doThisNext: DoThisNext | null
}

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  holiday: '🎄',
  custom: '🎁',
}

export function DoThisNextCard({ doThisNext }: DoThisNextCardProps) {
  const router = useRouter()

  if (!doThisNext) return null

  const { occasion, reason } = doThisNext
  const emoji = OCCASION_EMOJI[occasion.occasionType] || '🎁'

  return (
    <div className="rounded-2xl overflow-hidden bg-white/60 shadow-sm">
      <div className="bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Do This Next
        </h3>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{occasion.recipientName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                {occasion.occasionType === 'birthday' ? 'Birthday' : occasion.occasionName}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {occasion.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {occasion.relationship && (
              <p className="text-xs text-gray-500 mt-1">{occasion.relationship}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-orange-500">
              {occasion.daysUntil < 0
                ? `${Math.abs(occasion.daysUntil)}d ago`
                : occasion.daysUntil === 0
                ? 'Today!'
                : `${occasion.daysUntil}d`}
            </p>
            <p className="text-[10px] text-gray-500">{reason}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => router.push(`/chat?prefix=${encodeURIComponent(`Gift ideas for ${occasion.recipientName}'s ${occasion.occasionType}: `)}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-blue-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Find a Gift
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => router.push('/stash')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            I Have One
          </button>
        </div>
      </div>
    </div>
  )
}
