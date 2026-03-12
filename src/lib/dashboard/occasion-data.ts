// src/lib/dashboard/occasion-data.ts
import type { GiftWithRecipients } from '@/types/database.types'
import type { UpcomingOccasion } from './readiness-score'

export interface DoThisNext {
  occasion: UpcomingOccasion
  reason: string
}

export interface DashboardStats {
  dueThisWeek: number
  giftsNeeded: number
  onHand: number
  budgetSpent: number
}

export function getDoThisNext(occasions: UpcomingOccasion[]): DoThisNext | null {
  // Find the most urgent occasion that still needs a gift
  const urgent = occasions.find(
    o => o.occasionType !== 'holiday' && ['none', 'idea'].includes(o.giftStatus)
  )

  if (!urgent) return null

  let reason = ''
  if (urgent.urgencyTier === 'overdue') {
    reason = `${Math.abs(urgent.daysUntil)} days past!`
  } else if (urgent.urgencyTier === 'today') {
    reason = "It's today!"
  } else if (urgent.urgencyTier === 'this_week') {
    reason = `Only ${urgent.daysUntil} days left`
  } else if (urgent.urgencyTier === 'this_month') {
    reason = `${urgent.daysUntil} days away`
  } else {
    reason = `Coming up in ${urgent.daysUntil} days`
  }

  return { occasion: urgent, reason }
}

export function getDashboardStats(
  occasions: UpcomingOccasion[],
  gifts: GiftWithRecipients[]
): DashboardStats {
  const dueThisWeek = occasions.filter(
    o => o.occasionType !== 'holiday' && o.daysUntil >= 0 && o.daysUntil <= 7
  ).length

  const giftsNeeded = occasions.filter(
    o => o.occasionType !== 'holiday' && ['none', 'idea'].includes(o.giftStatus)
  ).length

  // On-hand = gifts with status 'purchased' or 'wrapped' (ready to give)
  const onHand = gifts.filter(g => {
    const status = g.status || 'idea'
    return status === 'purchased' || status === 'wrapped'
  }).length

  const budgetSpent = gifts
    .filter(g => {
      const status = g.status || 'idea'
      return ['purchased', 'wrapped', 'delivered'].includes(status)
    })
    .reduce((sum, g) => sum + (g.current_price || 0), 0)

  return { dueThisWeek, giftsNeeded, onHand, budgetSpent }
}
