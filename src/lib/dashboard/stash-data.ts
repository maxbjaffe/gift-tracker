// src/lib/dashboard/stash-data.ts
import type { Recipient, GiftWithRecipients } from '@/types/database.types'

export type StashProfileType = 'kids_party' | 'teacher' | 'host' | 'general' | 'specific'

export interface StashGroup {
  profileType: StashProfileType
  label: string
  gifts: GiftWithRecipients[]
  totalValue: number
  recipientId?: string
}

// Map generic profile_type values to StashProfileType buckets
const PROFILE_TYPE_TO_BUCKET: Record<string, StashProfileType> = {
  teacher: 'teacher',
  kids_party: 'kids_party',
  host: 'host',
  // All other profile types map to 'specific' since the gift is assigned to that profile
}

function inferStashProfile(
  gift: GiftWithRecipients,
  recipients: Recipient[]
): { type: StashProfileType; recipientId?: string } {
  // If assigned to a specific recipient, check if it's a generic profile
  if (gift.recipients && gift.recipients.length > 0) {
    const assignedRecipient = recipients.find(r => r.id === gift.recipients![0].id)
    if (assignedRecipient?.profile_type && assignedRecipient.profile_type !== 'person') {
      const bucket = PROFILE_TYPE_TO_BUCKET[assignedRecipient.profile_type]
      if (bucket) {
        return { type: bucket, recipientId: assignedRecipient.id }
      }
      // Generic profile types not in the bucket map still count as 'specific'
      return { type: 'specific' }
    }
    return { type: 'specific' }
  }

  const name = (gift.name || '').toLowerCase()
  const category = (gift.category || '').toLowerCase()
  const notes = (gift.notes || '').toLowerCase()
  const allText = `${name} ${category} ${notes}`

  if (/kids?\s*party|party\s*favor|pinata|goody\s*bag|birthday\s*party/i.test(allText)) return { type: 'kids_party' }
  if (/teacher|coach|tutor|professor|instructor/i.test(allText)) return { type: 'teacher' }
  if (/host|hostess|housewarming|wine|candle|dinner\s*party/i.test(allText)) return { type: 'host' }

  return { type: 'general' }
}

export function groupGiftsByStashProfile(
  gifts: GiftWithRecipients[],
  recipients: Recipient[]
): StashGroup[] {
  const groups: Record<StashProfileType, { gifts: GiftWithRecipients[]; recipientId?: string }> = {
    specific: { gifts: [] },
    kids_party: { gifts: [] },
    teacher: { gifts: [] },
    host: { gifts: [] },
    general: { gifts: [] },
  }

  for (const gift of gifts) {
    const result = inferStashProfile(gift, recipients)
    groups[result.type].gifts.push(gift)
    // Track recipientId for generic profile groups
    if (result.recipientId && !groups[result.type].recipientId) {
      groups[result.type].recipientId = result.recipientId
    }
  }

  const labels: Record<StashProfileType, string> = {
    specific: 'Assigned to Someone',
    kids_party: "Kids' Party",
    teacher: 'Teacher & Coach',
    host: 'Host & Hostess',
    general: 'General Stash',
  }

  return (Object.entries(groups) as [StashProfileType, { gifts: GiftWithRecipients[]; recipientId?: string }][])
    .filter(([, g]) => g.gifts.length > 0)
    .map(([profileType, { gifts: profileGifts, recipientId }]) => ({
      profileType,
      label: labels[profileType],
      gifts: profileGifts,
      totalValue: profileGifts.reduce((sum, g) => sum + (g.current_price || 0), 0),
      recipientId,
    }))
}
