// src/lib/dashboard/readiness-score.ts
import type { Recipient, GiftWithRecipients } from '@/types/database.types'
import { getUpcomingHolidays, type Holiday } from '@/lib/utils/holidays'
import { parseLocalDate } from '@/lib/utils/age'

export type UrgencyTier = 'overdue' | 'today' | 'this_week' | 'this_month' | 'later'
export type GiftStatus = 'none' | 'idea' | 'purchased' | 'wrapped' | 'given'

export interface UpcomingOccasion {
  recipientId: string
  recipientName: string
  relationship: string | null
  occasionType: 'birthday' | 'holiday' | 'custom'
  occasionName: string
  date: Date
  daysUntil: number
  urgencyTier: UrgencyTier
  giftStatus: GiftStatus
  assignedGifts: GiftWithRecipients[]
}

export interface ReadinessScore {
  percentage: number
  coveredCount: number
  totalCount: number
  needsGiftsCount: number
  color: string
}

function getUrgencyTier(daysUntil: number): UrgencyTier {
  if (daysUntil < 0) return 'overdue'
  if (daysUntil === 0) return 'today'
  if (daysUntil <= 7) return 'this_week'
  if (daysUntil <= 30) return 'this_month'
  return 'later'
}

function bestGiftStatus(gifts: GiftWithRecipients[], recipientId: string): GiftStatus {
  if (gifts.length === 0) return 'none'

  const statuses = gifts.map(g => {
    const recipientLink = g.recipients?.find(r => r.id === recipientId)
    const status = (recipientLink as any)?.status || g.status || 'idea'
    return status
  })

  const priority: Record<string, number> = { given: 4, wrapped: 3, purchased: 2, idea: 1 }
  const best = statuses.reduce((a, b) => (priority[a] || 0) >= (priority[b] || 0) ? a : b, 'none')

  if (['given', 'delivered'].includes(best)) return 'given'
  if (best === 'wrapped') return 'wrapped'
  if (best === 'purchased') return 'purchased'
  if (best === 'idea') return 'idea'
  return 'none'
}

export function getUpcomingOccasions(
  recipients: Recipient[],
  gifts: GiftWithRecipients[],
  daysAhead: number = 150
): UpcomingOccasion[] {
  const occasions: UpcomingOccasion[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Birthdays from recipients
  for (const recipient of recipients) {
    if (!recipient.birthday) continue

    const birthday = parseLocalDate(recipient.birthday)
    const thisYearDate = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())

    if (thisYearDate < today) {
      thisYearDate.setFullYear(today.getFullYear() + 1)
    }

    const daysUntil = Math.ceil((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil > daysAhead) continue

    // Find gifts assigned to this recipient with birthday occasion
    const assignedGifts = gifts.filter(g =>
      g.recipients?.some(r => r.id === recipient.id)
    )

    occasions.push({
      recipientId: recipient.id,
      recipientName: recipient.name,
      relationship: recipient.relationship,
      occasionType: 'birthday',
      occasionName: `${recipient.name}'s Birthday`,
      date: thisYearDate,
      daysUntil,
      urgencyTier: getUrgencyTier(daysUntil),
      giftStatus: bestGiftStatus(assignedGifts, recipient.id),
      assignedGifts,
    })
  }

  // Holidays
  const holidays = getUpcomingHolidays(daysAhead)
  for (const holiday of holidays) {
    occasions.push({
      recipientId: '__holiday__',
      recipientName: holiday.name,
      relationship: null,
      occasionType: 'holiday',
      occasionName: holiday.name,
      date: holiday.date,
      daysUntil: holiday.daysUntil,
      urgencyTier: getUrgencyTier(holiday.daysUntil),
      giftStatus: 'none', // Holidays don't have assigned gifts tracked individually
      assignedGifts: [],
    })
  }

  // Important dates from recipient profiles
  for (const recipient of recipients) {
    const importantDates = (recipient as any).important_dates as Array<{ label: string; date: string; repeats: boolean }> | null
    if (!importantDates || importantDates.length === 0) continue

    for (const entry of importantDates) {
      const entryDate = parseLocalDate(entry.date)
      let targetDate: Date

      if (entry.repeats) {
        // Calculate next occurrence like birthdays
        targetDate = new Date(today.getFullYear(), entryDate.getMonth(), entryDate.getDate())
        if (targetDate < today) {
          targetDate.setFullYear(today.getFullYear() + 1)
        }
      } else {
        targetDate = entryDate
      }

      const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil < -7 || daysUntil > daysAhead) continue

      const assignedGifts = gifts.filter(g =>
        g.recipients?.some(r => r.id === recipient.id)
      )

      occasions.push({
        recipientId: recipient.id,
        recipientName: recipient.name,
        relationship: recipient.relationship,
        occasionType: 'custom',
        occasionName: `${recipient.name} — ${entry.label}`,
        date: targetDate,
        daysUntil,
        urgencyTier: getUrgencyTier(daysUntil),
        giftStatus: bestGiftStatus(assignedGifts, recipient.id),
        assignedGifts,
      })
    }
  }

  // Gift-recipient occasion dates (custom occasions)
  for (const gift of gifts) {
    if (!gift.recipients) continue
    for (const r of gift.recipients) {
      const occasion = (r as any).occasion
      const occasionDate = (r as any).occasion_date
      if (!occasion || !occasionDate) continue

      const date = new Date(occasionDate)
      const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil < -7 || daysUntil > daysAhead) continue

      // Skip if this is a birthday (already handled)
      if (occasion.toLowerCase() === 'birthday') continue

      const existing = occasions.find(
        o => o.recipientId === r.id && o.occasionName === occasion && Math.abs(o.daysUntil - daysUntil) < 2
      )
      if (existing) {
        // Add gift to existing occasion
        existing.assignedGifts.push(gift)
        existing.giftStatus = bestGiftStatus(existing.assignedGifts, r.id)
        continue
      }

      occasions.push({
        recipientId: r.id,
        recipientName: r.name,
        relationship: (r as any).relationship || null,
        occasionType: 'custom',
        occasionName: `${r.name} — ${occasion}`,
        date,
        daysUntil,
        urgencyTier: getUrgencyTier(daysUntil),
        giftStatus: bestGiftStatus([gift], r.id),
        assignedGifts: [gift],
      })
    }
  }

  return occasions.sort((a, b) => a.daysUntil - b.daysUntil)
}

export function computeReadinessScore(occasions: UpcomingOccasion[]): ReadinessScore {
  // Only count non-holiday occasions for readiness
  const trackable = occasions.filter(o => o.occasionType !== 'holiday')

  if (trackable.length === 0) {
    return { percentage: 100, coveredCount: 0, totalCount: 0, needsGiftsCount: 0, color: '#10B981' }
  }

  const covered = trackable.filter(o => ['purchased', 'wrapped', 'given'].includes(o.giftStatus))
  const needsGifts = trackable.filter(o => ['none', 'idea'].includes(o.giftStatus))

  const percentage = Math.round((covered.length / trackable.length) * 100)

  let color = '#F57F20' // orange <50%
  if (percentage >= 80) color = '#10B981' // green
  else if (percentage >= 50) color = '#F59E0B' // amber

  return {
    percentage,
    coveredCount: covered.length,
    totalCount: trackable.length,
    needsGiftsCount: needsGifts.length,
    color,
  }
}
