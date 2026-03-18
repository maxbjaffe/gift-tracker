// src/lib/dashboard/stash-tabs.ts
import type { Recipient, GiftWithRecipients } from '@/types/database.types'

export type StashTab = 'unassigned' | 'occasions' | 'people' | 'all'

export interface CategorizedGifts {
  unassigned: GiftWithRecipients[]
  occasions: GiftWithRecipients[]
  people: GiftWithRecipients[]
  all: GiftWithRecipients[]
}

export interface RecipientGroup {
  recipientId: string
  name: string
  avatarType?: string | null
  avatarData?: string | null
  avatarBackground?: string | null
  profileType?: string | null
  gifts: GiftWithRecipients[]
  totalValue: number
}

/**
 * Split stash gifts into tab buckets.
 * - unassigned: no recipients
 * - occasions: assigned to a recipient with profile_type other than 'person'/null
 * - people: assigned to a person recipient (profile_type is 'person' or null)
 * - all: every gift
 */
export function categorizeGifts(
  gifts: GiftWithRecipients[],
  recipients: Recipient[]
): CategorizedGifts {
  const recipientMap = new Map(recipients.map(r => [r.id, r]))
  const unassigned: GiftWithRecipients[] = []
  const occasions: GiftWithRecipients[] = []
  const people: GiftWithRecipients[] = []

  for (const gift of gifts) {
    if (!gift.recipients || gift.recipients.length === 0) {
      unassigned.push(gift)
      continue
    }

    // Check if any recipient is an occasion profile
    let isOccasion = false
    for (const r of gift.recipients) {
      const full = recipientMap.get(r.id)
      if (full?.profile_type && full.profile_type !== 'person') {
        isOccasion = true
        break
      }
    }

    if (isOccasion) {
      occasions.push(gift)
    } else {
      people.push(gift)
    }
  }

  return { unassigned, occasions, people, all: gifts }
}

/**
 * Group occasion-tab gifts by their occasion profile recipient.
 */
export function groupByOccasionProfile(
  gifts: GiftWithRecipients[],
  recipients: Recipient[]
): RecipientGroup[] {
  const recipientMap = new Map(recipients.map(r => [r.id, r]))
  const groups = new Map<string, GiftWithRecipients[]>()

  for (const gift of gifts) {
    for (const r of gift.recipients || []) {
      const full = recipientMap.get(r.id)
      if (full?.profile_type && full.profile_type !== 'person') {
        const existing = groups.get(r.id) || []
        existing.push(gift)
        groups.set(r.id, existing)
        break // only count once per gift
      }
    }
  }

  return Array.from(groups.entries()).map(([id, giftList]) => {
    const r = recipientMap.get(id)!
    return {
      recipientId: id,
      name: r.name,
      avatarType: r.avatar_type,
      avatarData: r.avatar_data,
      avatarBackground: r.avatar_background,
      profileType: r.profile_type,
      gifts: giftList,
      totalValue: giftList.reduce((sum, g) => sum + (g.current_price || 0), 0),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Group people-tab gifts by their person recipient.
 */
export function groupByPerson(
  gifts: GiftWithRecipients[],
  recipients: Recipient[]
): RecipientGroup[] {
  const recipientMap = new Map(recipients.map(r => [r.id, r]))
  const groups = new Map<string, GiftWithRecipients[]>()

  for (const gift of gifts) {
    for (const r of gift.recipients || []) {
      const full = recipientMap.get(r.id)
      if (!full?.profile_type || full.profile_type === 'person') {
        const existing = groups.get(r.id) || []
        existing.push(gift)
        groups.set(r.id, existing)
      }
    }
  }

  return Array.from(groups.entries()).map(([id, giftList]) => {
    const r = recipientMap.get(id)!
    return {
      recipientId: id,
      name: r.name,
      avatarType: r.avatar_type,
      avatarData: r.avatar_data,
      avatarBackground: r.avatar_background,
      profileType: r.profile_type,
      gifts: giftList,
      totalValue: giftList.reduce((sum, g) => sum + (g.current_price || 0), 0),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
}
