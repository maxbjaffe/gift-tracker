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

function getStatusDot(giftStatus: string): { color: string; label: string } {
  switch (giftStatus) {
    case 'wrapped': return { color: 'bg-green-500', label: 'Wrapped' }
    case 'purchased': return { color: 'bg-blue-500', label: 'Purchased' }
    case 'idea': return { color: 'bg-yellow-500', label: 'Idea saved' }
    case 'given': return { color: 'bg-gray-400', label: 'Given' }
    default: return { color: 'bg-red-400', label: 'No gift yet' }
  }
}

function CountdownDisplay({ daysUntil }: { daysUntil: number }) {
  if (daysUntil < 0) {
    return (
      <div className="text-right flex-shrink-0">
        <div className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
          {Math.abs(daysUntil)}
        </div>
        <div className="text-xs font-semibold text-red-500 uppercase">overdue</div>
      </div>
    )
  }
  if (daysUntil === 0) {
    return (
      <div className="text-right flex-shrink-0">
        <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent animate-pulse">
          TODAY
        </div>
      </div>
    )
  }
  return (
    <div className="text-right flex-shrink-0">
      <div className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
        {daysUntil}
      </div>
      <div className="text-xs font-medium text-gray-500">days</div>
    </div>
  )
}

function OccasionChip({
  occasion,
  recipientMap,
  holidayMap,
}: {
  occasion: UpcomingOccasion
  recipientMap: Record<string, Recipient>
  holidayMap: Map<string, Holiday>
}) {
  const emoji = getOccasionEmoji(occasion, holidayMap)
  const status = getStatusDot(occasion.giftStatus)
  const recipient = recipientMap[occasion.recipientId]
  const isHoliday = occasion.recipientId === '__holiday__'

  const chatPrefix = isHoliday
    ? `Gift ideas for ${occasion.occasionName}: `
    : `Gift ideas for ${occasion.recipientName}'s ${occasion.occasionType === 'birthday' ? 'birthday' : occasion.occasionName}: `

  return (
    <Link
      href={`/chat?prefix=${encodeURIComponent(chatPrefix)}`}
      className="flex-shrink-0 w-[130px] bg-white/60 rounded-xl p-3 flex flex-col items-center text-center gap-1 cursor-pointer hover:shadow-md transition-shadow"
    >
      {isHoliday ? (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-lg" style={{ background: 'linear-gradient(to right, var(--tw-gradient-stops))' }}>
          <span className="text-lg">{emoji}</span>
        </div>
      ) : recipient ? (
        <Avatar
          type={recipient.avatar_type as any}
          data={recipient.avatar_data || undefined}
          background={recipient.avatar_background || undefined}
          name={recipient.name}
          size="xs"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
          {emoji}
        </div>
      )}
      <span className="text-xs font-medium text-gray-900 truncate w-full">
        {isHoliday ? occasion.occasionName : occasion.recipientName}
      </span>
      <span className="text-xl font-bold bg-gradient-to-br from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
        {occasion.daysUntil < 0 ? `${Math.abs(occasion.daysUntil)}d ago` : occasion.daysUntil === 0 ? 'Today!' : `${occasion.daysUntil}d`}
      </span>
      <span className={`inline-block w-2 h-2 rounded-full ${status.color}`} title={status.label} />
    </Link>
  )
}

export function ComingUpHero({ occasions, recipientMap }: ComingUpHeroProps) {
  const holidayMap = useMemo(() => {
    const holidays = getUpcomingHolidays(60)
    return new Map(holidays.map(h => [h.name, h]))
  }, [])

  if (occasions.length === 0) {
    return (
      <div className="bg-white/60 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">All clear!</h2>
        <p className="text-sm text-gray-500 mb-4">No occasions in the next 60 days</p>
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
  const heroStatus = getStatusDot(hero.giftStatus)

  const occasionLabel = hero.occasionType === 'birthday'
    ? 'Birthday'
    : hero.occasionType === 'holiday'
      ? 'Holiday'
      : hero.occasionName.split(' — ')[1] || 'Event'

  const chatPrefix = isHoliday
    ? `Gift ideas for ${hero.occasionName}: `
    : `Gift ideas for ${hero.recipientName}'s ${hero.occasionType === 'birthday' ? 'birthday' : occasionLabel}: `

  return (
    <div>
      {/* Hero card */}
      <div className="bg-white/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Accent strip */}
        <div className={`h-1 bg-gradient-to-r ${accentGradient}`} />

        <div className="flex items-center gap-4 px-5 py-5">
          {/* Left: avatar or emoji */}
          {isHoliday ? (
            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${accentGradient} flex items-center justify-center flex-shrink-0`}>
              <span className="text-3xl">{heroEmoji}</span>
            </div>
          ) : recipient ? (
            <Avatar
              type={recipient.avatar_type as any}
              data={recipient.avatar_data || undefined}
              background={recipient.avatar_background || undefined}
              name={recipient.name}
              size="lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">{heroEmoji}</span>
            </div>
          )}

          {/* Middle: name + occasion + status */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {isHoliday ? hero.occasionName : hero.recipientName}
            </h2>
            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r ${accentGradient} text-white`}>
              {heroEmoji} {occasionLabel}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${heroStatus.color}`} />
              <span className="text-xs text-gray-500">{heroStatus.label}</span>
            </div>
          </div>

          {/* Right: countdown */}
          <CountdownDisplay daysUntil={hero.daysUntil} />
        </div>

        {/* CTA row */}
        <div className="flex gap-2 px-5 pb-4">
          <Link
            href={`/chat?prefix=${encodeURIComponent(chatPrefix)}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Gift className="w-4 h-4" />
            Find a Gift
          </Link>
          <Link
            href="/stash"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            I Have One
          </Link>
        </div>
      </div>

      {/* Occasion scroll strip */}
      {rest.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 mt-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {rest.map((occasion, i) => (
            <OccasionChip
              key={`${occasion.recipientId}-${occasion.occasionName}-${i}`}
              occasion={occasion}
              recipientMap={recipientMap}
              holidayMap={holidayMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}
