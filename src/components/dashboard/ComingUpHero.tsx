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

      {/* Grouped upcoming — capped per category */}
      {rest.length > 0 && (() => {
        const birthdays = rest.filter(o => o.occasionType === 'birthday').slice(0, 3)
        const holidays = rest.filter(o => o.occasionType === 'holiday').slice(0, 4)
        const events = rest.filter(o => o.occasionType === 'custom').slice(0, 3)
        const groups = [
          { title: 'Birthdays', emoji: '🎂', items: birthdays },
          { title: 'Holidays', emoji: '🎉', items: holidays },
          { title: 'Events', emoji: '📅', items: events },
        ].filter(g => g.items.length > 0)

        return (
          <div className="mt-3">
            {/* Side-by-side grid for categories on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map(group => (
                <div key={group.title} className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    {group.emoji} {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((occasion, i) => {
                      const oEmoji = getOccasionEmoji(occasion, holidayMap)
                      const oUrgency = getUrgencyMeta(occasion.daysUntil)
                      const oStatus = getStatusPill(occasion.giftStatus)
                      const oIsHoliday = occasion.recipientId === '__holiday__'

                      return (
                        <Link
                          key={`${occasion.recipientId}-${occasion.occasionName}-${i}`}
                          href={`/chat?prefix=${encodeURIComponent(buildChatPrefix(occasion))}`}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:shadow-sm transition-all ${oUrgency.chipBg}`}
                        >
                          <span className="text-sm flex-shrink-0">{oEmoji}</span>
                          <span className="text-xs font-medium text-gray-900 truncate flex-1">
                            {oIsHoliday ? occasion.occasionName : occasion.recipientName}
                            {!oIsHoliday && occasion.occasionType === 'custom' && (
                              <span className="text-gray-500 font-normal"> — {occasion.occasionName.split(' — ')[1] || ''}</span>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">
                            {occasion.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`text-[10px] font-bold flex-shrink-0 ${occasion.daysUntil <= 7 ? 'text-orange-500' : 'text-gray-600'}`}>
                            {occasion.daysUntil < 0 ? `${Math.abs(occasion.daysUntil)}d ago` : occasion.daysUntil === 0 ? 'Today' : `${occasion.daysUntil}d`}
                          </span>
                          {occasion.occasionType !== 'holiday' && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${oStatus.bg}`}>
                              {oStatus.label}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/occasions"
              className="block text-center text-xs text-gray-400 hover:text-orange-500 transition-colors pt-2"
            >
              View full calendar &rarr;
            </Link>
          </div>
        )
      })()}
    </div>
  )
}
