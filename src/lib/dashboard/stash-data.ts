// src/lib/dashboard/stash-data.ts
import type { Recipient, GiftWithRecipients } from '@/types/database.types'

export type StashProfileType = 'kids_party' | 'teacher' | 'host' | 'general' | 'specific'

export interface StashGroup {
  profileType: StashProfileType
  label: string
  gifts: GiftWithRecipients[]
  totalValue: number
}

function inferStashProfile(gift: GiftWithRecipients, recipients: Recipient[]): StashProfileType {
  // If assigned to a specific person, it's specific
  if (gift.recipients && gift.recipients.length > 0) return 'specific'

  const name = (gift.name || '').toLowerCase()
  const category = (gift.category || '').toLowerCase()
  const notes = (gift.notes || '').toLowerCase()
  const allText = `${name} ${category} ${notes}`

  if (/kids?\s*party|party\s*favor|pinata|goody\s*bag|birthday\s*party/i.test(allText)) return 'kids_party'
  if (/teacher|coach|tutor|professor|instructor/i.test(allText)) return 'teacher'
  if (/host|hostess|housewarming|wine|candle|dinner\s*party/i.test(allText)) return 'host'

  return 'general'
}

export function groupGiftsByStashProfile(
  gifts: GiftWithRecipients[],
  recipients: Recipient[]
): StashGroup[] {
  const groups: Record<StashProfileType, GiftWithRecipients[]> = {
    specific: [],
    kids_party: [],
    teacher: [],
    host: [],
    general: [],
  }

  for (const gift of gifts) {
    const profile = inferStashProfile(gift, recipients)
    groups[profile].push(gift)
  }

  const labels: Record<StashProfileType, string> = {
    specific: 'Assigned to Someone',
    kids_party: "Kids' Party",
    teacher: 'Teacher & Coach',
    host: 'Host & Hostess',
    general: 'General Stash',
  }

  return (Object.entries(groups) as [StashProfileType, GiftWithRecipients[]][])
    .filter(([, g]) => g.length > 0)
    .map(([profileType, profileGifts]) => ({
      profileType,
      label: labels[profileType],
      gifts: profileGifts,
      totalValue: profileGifts.reduce((sum, g) => sum + (g.current_price || 0), 0),
    }))
}
