'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { getUpcomingOccasions, type UpcomingOccasion, type GiftStatus } from '@/lib/dashboard/readiness-score'
import { CalendarDays, Gift } from 'lucide-react'

const STATUS_DOT: Record<GiftStatus, string> = {
  none: 'bg-red-400',
  idea: 'bg-blue-400',
  purchased: 'bg-green-400',
  wrapped: 'bg-purple-400',
  given: 'bg-emerald-400',
}

const STATUS_LABEL: Record<GiftStatus, string> = {
  none: 'No gift',
  idea: 'Idea',
  purchased: 'Purchased',
  wrapped: 'Wrapped',
  given: 'Given',
}

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  holiday: '🎉',
  custom: '📅',
}

interface MonthData {
  key: string // "2026-03"
  label: string // "March 2026"
  year: number
  month: number // 0-indexed
  days: number // days in month
  startDay: number // day of week the 1st falls on (0=Sun)
  occasions: Map<number, UpcomingOccasion[]> // day number -> occasions
}

function buildMonthGrid(occasions: UpcomingOccasion[]): MonthData[] {
  const today = new Date()
  const months: MonthData[] = []
  const monthSet = new Set<string>()

  // Always include current month + next 4 months (5 total)
  for (let offset = 0; offset < 5; offset++) {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (!monthSet.has(key)) {
      monthSet.add(key)
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      months.push({
        key,
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        days: daysInMonth,
        startDay: d.getDay(),
        occasions: new Map(),
      })
    }
  }

  // Place occasions into month/day slots
  for (const occ of occasions) {
    const occDate = occ.date
    const key = `${occDate.getFullYear()}-${String(occDate.getMonth()).padStart(2, '0')}`
    const monthData = months.find(m => m.key === key)
    if (monthData) {
      const day = occDate.getDate()
      if (!monthData.occasions.has(day)) {
        monthData.occasions.set(day, [])
      }
      monthData.occasions.get(day)!.push(occ)
    }
  }

  return months
}

function OccasionChip({ occasion }: { occasion: UpcomingOccasion }) {
  const router = useRouter()
  const emoji = OCCASION_EMOJI[occasion.occasionType] || '📅'
  const isHoliday = occasion.occasionType === 'holiday'
  const name = isHoliday ? occasion.occasionName : occasion.recipientName
  const statusDot = STATUS_DOT[occasion.giftStatus]

  const handleClick = () => {
    if (isHoliday) {
      router.push(`/chat?prefix=${encodeURIComponent(`Gift ideas for ${occasion.occasionName}: `)}`)
    } else {
      router.push(`/chat?prefix=${encodeURIComponent(`Gift ideas for ${occasion.recipientName}: `)}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded hover:bg-orange-50 transition-colors truncate"
      title={`${name} — ${occasion.occasionName} (${STATUS_LABEL[occasion.giftStatus]})`}
    >
      <span>{emoji}</span>
      <span className="truncate font-medium text-gray-800">{name}</span>
      {!isHoliday && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />}
    </button>
  )
}

function MonthCard({ month }: { month: MonthData }) {
  const today = new Date()
  const isCurrentMonth = month.year === today.getFullYear() && month.month === today.getMonth()
  const todayDate = today.getDate()
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Build 6-row grid (max needed)
  const cells: (number | null)[] = []
  for (let i = 0; i < month.startDay; i++) cells.push(null)
  for (let d = 1; d <= month.days; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const totalOccasions = Array.from(month.occasions.values()).flat().length

  return (
    <div className="bg-white/70 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Month header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">{month.label}</h2>
        {totalOccasions > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
            {totalOccasions} event{totalOccasions !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 pb-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-2 pb-2 gap-y-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dayOccasions = month.occasions.get(day) || []
          const isToday = isCurrentMonth && day === todayDate
          const isPast = isCurrentMonth && day < todayDate
          const hasOccasions = dayOccasions.length > 0

          return (
            <div
              key={day}
              className={`min-h-[52px] rounded-lg p-0.5 ${
                isToday
                  ? 'bg-orange-50 ring-1 ring-orange-300'
                  : hasOccasions
                    ? 'bg-blue-50/50'
                    : ''
              }`}
            >
              <div className={`text-[11px] text-center font-medium ${
                isToday
                  ? 'text-orange-600 font-bold'
                  : isPast
                    ? 'text-gray-300'
                    : hasOccasions
                      ? 'text-gray-900'
                      : 'text-gray-400'
              }`}>
                {day}
              </div>
              {dayOccasions.map((occ, j) => (
                <OccasionChip key={`${occ.recipientId}-${j}`} occasion={occ} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OccasionsPage() {
  const { recipients, loading: recipientsLoading } = useRecipients()
  const { gifts, loading: giftsLoading } = useGifts()

  const loading = recipientsLoading || giftsLoading

  const occasions = useMemo(() => {
    if (loading) return []
    return getUpcomingOccasions(recipients || [], gifts || [], 150)
  }, [recipients, gifts, loading])

  const months = useMemo(() => buildMonthGrid(occasions), [occasions])

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingSpinner type="card" count={3} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
          <p className="text-sm text-gray-500 mt-1">Next 5 months</p>
        </div>
        <CalendarDays className="w-6 h-6 text-gray-400" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">🎂 Birthday</span>
        <span className="flex items-center gap-1">🎉 Holiday</span>
        <span className="flex items-center gap-1">📅 Event</span>
        <span className="border-l border-gray-200 pl-3 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> No gift</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Idea</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Purchased</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Wrapped</span>
      </div>

      {occasions.length === 0 ? (
        <div className="text-center py-16">
          <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No upcoming occasions</p>
          <p className="text-sm text-gray-400 mt-1">
            Add birthdays to your recipients to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {months.map(month => (
            <MonthCard key={month.key} month={month} />
          ))}
        </div>
      )}
    </div>
  )
}
