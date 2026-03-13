'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import { getUpcomingHolidays, type Holiday } from '@/lib/utils/holidays'
import type { UpcomingOccasion } from '@/lib/dashboard/readiness-score'
import type { Recipient } from '@/types/database.types'
import { Gift, ShoppingBag } from 'lucide-react'

interface ComingUpHeroProps {
  occasions: UpcomingOccasion[]
  recipientMap: Record<string, Recipient>
}

function getAccentGradient(occasion: UpcomingOccasion, holidayMap: Map<string, Holiday>): string {
  if (occasion.occasionType === 'birthday') return 'from-pink-400 via-purple-400 to-blue-400'
  if (occasion.occasionType === 'holiday') {
    const holiday = holidayMap.get(occasion.occasionName)
    return holiday?.color || 'from-giftstash-orange to-giftstash-blue'
  }
  return 'from-giftstash-orange to-giftstash-blue'
}

function getOccasionEmoji(occasion: UpcomingOccasion, holidayMap: Map<string, Holiday>): string {
  if (occasion.occasionType === 'birthday') return '🎂'
  if (occasion.occasionType === 'holiday') {
    const holiday = holidayMap.get(occasion.occasionName)
    return holiday?.emoji || '🎁'
  }
  return '🎁'
}

function getUrgencyMeta(daysUntil: number): { label: string; tint: string; chipBg: string } {
  if (daysUntil < 0) return { label: 'Overdue!', tint: 'bg-red-50 border-red-200', chipBg: 'bg-red-50 border border-red-200' }
  if (daysUntil === 0) return { label: "It's today!", tint: 'bg-red-50 border-red-200', chipBg: 'bg-red-50 border border-red-200' }
  if (daysUntil <= 14) return { label: 'Coming up fast', tint: 'bg-red-50/60 border-red-100', chipBg: 'bg-red-50 border border-red-200' }
  if (daysUntil <= 30) return { label: 'Coming up fast', tint: 'bg-orange-50/60 border-orange-100', chipBg: 'bg-orange-50 border border-orange-200' }
  if (daysUntil <= 60) return { label: 'Plan ahead', tint: 'bg-yellow-50/40 border-yellow-100', chipBg: 'bg-yellow-50 border border-yellow-200' }
  return { label: 'On your radar', tint: 'bg-white/60', chipBg: 'bg-white/60 border border-gray-200' }
}

function getStatusPill(giftStatus: string): { bg: string; label: string } {
  switch (giftStatus) {
    case 'wrapped': return { bg: 'bg-green-100 text-green-700', label: 'Wrapped' }
    case 'purchased': return { bg: 'bg-green-100 text-green-700', label: 'Purchased' }
    case 'idea': return { bg: 'bg-yellow-100 text-yellow-700', label: 'Idea saved' }
    case 'given': return { bg: 'bg-gray-100 text-gray-500', label: 'Given' }
    default: return { bg: 'bg-red-100 text-red-700', label: 'No gift yet' }
  }
}

function buildChatPrefix(occasion: UpcomingOccasion): string {
  const isHoliday = occasion.recipientId === '__holiday__'
  if (isHoliday) return `Gift ideas for ${occasion.occasionName}: `
  const label = occasion.occasionType === 'birthday' ? 'birthday' : occasion.occasionName.split(' — ')[1] || 'event'
  return `Gift ideas for ${occasion.recipientName}'s ${label}: `
}

export function ComingUpHero({ occasions, recipientMap }: ComingUpHeroProps) {
  const holidayMap = useMemo(() => {
    const holidays = getUpcomingHolidays(150)
    return new Map(holidays.map(h => [h.name, h]))
  }, [])

  if (occasions.length === 0) {
    return (
      <div className="bg-white/60 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">All clear!</h2>
        <p className="text-sm text-gray-500 mb-4">No occasions in the next 5 months</p>
        <Link
          href="/recipients/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add a Recipient
        </Link>
      </div>
    )
  }

  const hero = occasions[0]
  const rest = occasions.slice(1)
  const recipient = recipientMap[hero.recipientId]
  const isHoliday = hero.recipientId === '__holiday__'
  const accentGradient = getAccentGradient(hero, holidayMap)
  const heroEmoji = getOccasionEmoji(hero, holidayMap)
  const urgency = getUrgencyMeta(hero.daysUntil)
  const status = getStatusPill(hero.giftStatus)
  const chatPrefix = buildChatPrefix(hero)

  const occasionLabel = hero.occasionType === 'birthday'
    ? 'Birthday'
    : hero.occasionType === 'holiday'
      ? 'Holiday'
      : hero.occasionName.split(' — ')[1] || 'Event'

  return (
    <div>
      {/* Hero card — compact, urgency-tinted */}
      <div className={`rounded-2xl shadow-sm overflow-hidden border ${urgency.tint}`}>
        <div className={`h-1 bg-gradient-to-r ${accentGradient}`} />

        <div className="flex items-center gap-4 px-4 py-4">
          {/* Avatar */}
          {isHoliday ? (
            <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${accentGradient} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{heroEmoji}</span>
            </div>
          ) : recipient ? (
            <Avatar
              type={recipient.avatar_type as any}
              data={recipient.avatar_data || undefined}
              background={recipient.avatar_background || undefined}
              name={recipient.name}
              size="md"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{heroEmoji}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {isHoliday ? hero.occasionName : hero.recipientName}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r ${accentGradient} text-white`}>
                {heroEmoji} {occasionLabel}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg}`}>
                {status.label}
              </span>
            </div>
            {/* CTAs inline */}
            <div className="flex gap-2 mt-2.5">
              <Link
                href={`/chat?prefix=${encodeURIComponent(chatPrefix)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Gift className="w-3.5 h-3.5" />
                Find a Gift
              </Link>
              <Link
                href="/stash"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                I Have One
              </Link>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-right flex-shrink-0">
            {hero.daysUntil < 0 ? (
              <>
                <div className="text-5xl sm:text-7xl font-black bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse leading-none">
                  {Math.abs(hero.daysUntil)}
                </div>
                <div className="text-[10px] font-bold text-red-500 uppercase mt-1">days overdue</div>
              </>
            ) : hero.daysUntil === 0 ? (
              <div className="text-3xl sm:text-5xl font-black bg-gradient-to-br from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent animate-pulse leading-none">
                TODAY
              </div>
            ) : (
              <>
                <div className="text-5xl sm:text-7xl font-black bg-gradient-to-br from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent leading-none">
                  {hero.daysUntil}
                </div>
                <div className="text-[10px] font-medium text-gray-500 uppercase mt-1">days</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline strip */}
      {rest.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            {rest.length} more upcoming
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {rest.map((occasion, i) => {
              const oEmoji = getOccasionEmoji(occasion, holidayMap)
              const oUrgency = getUrgencyMeta(occasion.daysUntil)
              const oStatus = getStatusPill(occasion.giftStatus)
              const oRecipient = recipientMap[occasion.recipientId]
              const oIsHoliday = occasion.recipientId === '__holiday__'
              const oLabel = occasion.occasionType === 'birthday'
                ? 'Birthday'
                : occasion.occasionType === 'holiday'
                  ? ''
                  : occasion.occasionName.split(' — ')[1] || ''

              return (
                <Link
                  key={`${occasion.recipientId}-${occasion.occasionName}-${i}`}
                  href={`/chat?prefix=${encodeURIComponent(buildChatPrefix(occasion))}`}
                  className={`flex-shrink-0 w-[140px] rounded-xl p-2.5 flex flex-col items-center text-center gap-1 hover:shadow-md transition-shadow ${oUrgency.chipBg}`}
                >
                  {oIsHoliday ? (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAccentGradient(occasion, holidayMap)} flex items-center justify-center`}>
                      <span className="text-lg">{oEmoji}</span>
                    </div>
                  ) : oRecipient ? (
                    <Avatar
                      type={oRecipient.avatar_type as any}
                      data={oRecipient.avatar_data || undefined}
                      background={oRecipient.avatar_background || undefined}
                      name={oRecipient.name}
                      size="xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg">{oEmoji}</span>
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-900 truncate w-full">
                    {oIsHoliday ? occasion.occasionName : occasion.recipientName}
                  </span>
                  {oLabel && (
                    <span className="text-[9px] text-gray-500">{oEmoji} {oLabel}</span>
                  )}
                  <span className="text-xl font-black bg-gradient-to-br from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent leading-none">
                    {occasion.daysUntil < 0 ? `${Math.abs(occasion.daysUntil)}` : occasion.daysUntil === 0 ? '!' : occasion.daysUntil}
                  </span>
                  <span className="text-[9px] text-gray-400">
                    {occasion.daysUntil < 0 ? 'days ago' : occasion.daysUntil === 0 ? 'today' : 'days'}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${oStatus.bg}`}>
                    {oStatus.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
