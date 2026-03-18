// src/lib/generic-profiles.ts
// Single source of truth for all occasion profile presets

export type GenericProfileType =
  | 'teacher'
  | 'coworker'
  | 'host'
  | 'kids_party'
  | 'boss'
  | 'neighbor'
  | 'babysitter'
  | 'service_provider'
  | 'wedding'
  | 'baby_shower'
  | 'graduation'
  | 'white_elephant'

export interface KeyDate {
  label: string
  monthDay: string // MM-DD
  repeats: boolean
}

export interface GenericProfilePreset {
  type: GenericProfileType
  label: string
  emoji: string
  emojiBackground: string
  description: string
  defaultName: string
  defaultInterests: string[]
  defaultGiftDos: string[]
  defaultGiftDonts: string[]
  defaultNotes: string
  keyDates: KeyDate[]
  suggestedBudget: number
  suggestedQuantity: number
}

export const GENERIC_PROFILE_PRESETS: GenericProfilePreset[] = [
  {
    type: 'teacher',
    label: 'Teacher / Coach',
    emoji: '🍎',
    emojiBackground: '#FEE2E2',
    description: 'Gifts for teachers, coaches, and educators',
    defaultName: 'Teacher Gift',
    defaultInterests: ['Coffee', 'Books', 'Stationery', 'Self-care'],
    defaultGiftDos: ['Gift cards', 'Personalized items', 'Classroom supplies', 'Handwritten notes'],
    defaultGiftDonts: ['Mugs (they have too many)', 'Candles with strong scents', 'Alcohol (school policy)'],
    defaultNotes: 'Keep gifts classroom-appropriate. Group gifts from class parents can increase budget. Pair with a student-made card.',
    keyDates: [
      { label: 'Teacher Appreciation Week', monthDay: '05-06', repeats: true },
      { label: 'Back to School', monthDay: '09-01', repeats: true },
      { label: 'End of Term', monthDay: '12-20', repeats: true },
    ],
    suggestedBudget: 30,
    suggestedQuantity: 1,
  },
  {
    type: 'coworker',
    label: 'Coworker / Colleague',
    emoji: '💼',
    emojiBackground: '#DBEAFE',
    description: 'Workplace gift exchanges and appreciation',
    defaultName: 'Coworker Gift',
    defaultInterests: ['Desk accessories', 'Snacks', 'Tech gadgets', 'Coffee'],
    defaultGiftDos: ['Universally appealing items', 'Consumables', 'Desk items', 'Gift cards'],
    defaultGiftDonts: ['Overly personal items', 'Strong perfume/cologne', 'Gag gifts (unless team culture)'],
    defaultNotes: 'Keep it professional and neutral. Consumable gifts are safest. Check company gift policies.',
    keyDates: [
      { label: 'Admin Professionals Day', monthDay: '04-23', repeats: true },
      { label: "Boss's Day", monthDay: '10-16', repeats: true },
      { label: 'Holiday Exchange', monthDay: '12-15', repeats: true },
    ],
    suggestedBudget: 25,
    suggestedQuantity: 1,
  },
  {
    type: 'host',
    label: 'Host / Hostess',
    emoji: '🏠',
    emojiBackground: '#FEF3C7',
    description: 'Thank-you gifts for dinner parties and gatherings',
    defaultName: 'Host Gift',
    defaultInterests: ['Wine', 'Gourmet food', 'Home decor', 'Candles'],
    defaultGiftDos: ['Wine or spirits', 'Specialty food items', 'Fresh flowers', 'Quality candles'],
    defaultGiftDonts: ['Flowers that need arranging immediately', 'Desserts (host may have planned dessert)'],
    defaultNotes: 'Bring something that doesn\'t require immediate attention from the host. A nice bottle of wine or artisan food item is always welcome.',
    keyDates: [],
    suggestedBudget: 40,
    suggestedQuantity: 2,
  },
  {
    type: 'kids_party',
    label: "Kids' Party",
    emoji: '🎉',
    emojiBackground: '#F3E8FF',
    description: 'Birthday party gifts for children',
    defaultName: "Kids' Party Gift",
    defaultInterests: ['Toys', 'Games', 'Art supplies', 'Books'],
    defaultGiftDos: ['Age-appropriate toys', 'Activity kits', 'Books', 'Gift cards to toy stores'],
    defaultGiftDonts: ['Noisy toys (parents will hate you)', 'Messy craft kits', 'Oversized items'],
    defaultNotes: 'Keep a few age-appropriate gifts on hand for last-minute party invites. Include a gift receipt.',
    keyDates: [],
    suggestedBudget: 15,
    suggestedQuantity: 3,
  },
  {
    type: 'boss',
    label: 'Boss / Manager',
    emoji: '👔',
    emojiBackground: '#E0E7FF',
    description: 'Professional gifts for supervisors',
    defaultName: 'Boss Gift',
    defaultInterests: ['Premium coffee', 'Desk accessories', 'Books', 'Gourmet treats'],
    defaultGiftDos: ['Quality desk items', 'Premium consumables', 'Business books', 'Group gifts from team'],
    defaultGiftDonts: ['Anything too personal', 'Joke gifts', 'Anything that implies they need help'],
    defaultNotes: 'Group gifts from the team are most appropriate. Keep it professional and tasteful.',
    keyDates: [
      { label: "Boss's Day", monthDay: '10-16', repeats: true },
    ],
    suggestedBudget: 50,
    suggestedQuantity: 1,
  },
  {
    type: 'neighbor',
    label: 'Neighbor',
    emoji: '🏡',
    emojiBackground: '#D1FAE5',
    description: 'Seasonal gifts for neighbors',
    defaultName: 'Neighbor Gift',
    defaultInterests: ['Baked goods', 'Plants', 'Local treats', 'Holiday items'],
    defaultGiftDos: ['Homemade baked goods', 'Potted plants', 'Local specialty foods', 'Holiday treats'],
    defaultGiftDonts: ['Anything too expensive (creates obligation)', 'Items that imply their yard needs work'],
    defaultNotes: 'Keep it friendly and low-pressure. Homemade items or local specialties show thoughtfulness without overdoing it.',
    keyDates: [
      { label: 'Holiday Season', monthDay: '12-20', repeats: true },
    ],
    suggestedBudget: 25,
    suggestedQuantity: 1,
  },
  {
    type: 'babysitter',
    label: 'Babysitter / Nanny',
    emoji: '👶',
    emojiBackground: '#FCE7F3',
    description: 'Appreciation gifts for childcare providers',
    defaultName: 'Babysitter Gift',
    defaultInterests: ['Gift cards', 'Self-care', 'Snacks', 'Entertainment'],
    defaultGiftDos: ['Gift cards (Visa, Amazon, or their favorite store)', 'Cash bonus', 'Spa items', 'Personalized thank-you note'],
    defaultGiftDonts: ['Used items', 'Anything that implies they need to improve'],
    defaultNotes: 'Holiday bonus is standard (equivalent of 1-2 weeks pay for regular sitters). Include a heartfelt note from the kids.',
    keyDates: [
      { label: 'Holiday Bonus', monthDay: '12-20', repeats: true },
      { label: 'End of School', monthDay: '06-15', repeats: true },
    ],
    suggestedBudget: 75,
    suggestedQuantity: 1,
  },
  {
    type: 'service_provider',
    label: 'Mail Carrier / Service',
    emoji: '📬',
    emojiBackground: '#CFFAFE',
    description: 'Holiday tipping for service providers',
    defaultName: 'Service Provider Tip',
    defaultInterests: ['Gift cards', 'Cash', 'Holiday treats'],
    defaultGiftDos: ['Cash or gift cards', 'Packaged treats', 'Thank-you card'],
    defaultGiftDonts: ['Homemade food (allergies/preferences unknown)', 'Alcohol'],
    defaultNotes: 'USPS carriers can accept gifts up to $20 in value. Cash/gift cards are always appreciated. Include a holiday card.',
    keyDates: [
      { label: 'Holiday Tipping', monthDay: '12-15', repeats: true },
    ],
    suggestedBudget: 25,
    suggestedQuantity: 1,
  },
  {
    type: 'wedding',
    label: 'Wedding',
    emoji: '💍',
    emojiBackground: '#FDF2F8',
    description: 'Wedding and engagement gifts',
    defaultName: 'Wedding Gift',
    defaultInterests: ['Home goods', 'Kitchen', 'Experiences', 'Registry items'],
    defaultGiftDos: ['Registry items', 'Cash/check', 'Experience gifts', 'Personalized keepsakes'],
    defaultGiftDonts: ['Off-registry items unless you know them well', 'Anything that needs to be transported from venue'],
    defaultNotes: 'Check the registry first. Cash is increasingly acceptable and appreciated. If attending, budget should cover at least the cost of your plate.',
    keyDates: [],
    suggestedBudget: 150,
    suggestedQuantity: 1,
  },
  {
    type: 'baby_shower',
    label: 'Baby Shower',
    emoji: '🍼',
    emojiBackground: '#EFF6FF',
    description: 'Baby shower and new parent gifts',
    defaultName: 'Baby Shower Gift',
    defaultInterests: ['Baby gear', 'Diapers', 'Books', 'Clothing'],
    defaultGiftDos: ['Registry items', 'Diapers (always needed)', 'Board books', 'Gift cards to baby stores'],
    defaultGiftDonts: ['Newborn-only sizes (they grow fast)', 'Loud toys', 'Items with strong scents'],
    defaultNotes: 'Check the registry. Practical items in 3-6 month sizes are most useful. Include a children\'s book with a personal inscription.',
    keyDates: [],
    suggestedBudget: 60,
    suggestedQuantity: 1,
  },
  {
    type: 'graduation',
    label: 'Graduation',
    emoji: '🎓',
    emojiBackground: '#FEF9C3',
    description: 'Graduation milestone gifts',
    defaultName: 'Graduation Gift',
    defaultInterests: ['Cash', 'Technology', 'Luggage', 'Professional items'],
    defaultGiftDos: ['Cash or gift cards', 'Practical items for next phase', 'Personalized keepsakes', 'Experience gifts'],
    defaultGiftDonts: ['Items they\'ll outgrow quickly', 'Stuffed animals (unless elementary)'],
    defaultNotes: 'Cash is king for graduates. For high school grads, think dorm/apartment essentials. For college grads, think professional wardrobe or travel.',
    keyDates: [
      { label: 'Graduation', monthDay: '05-15', repeats: false },
    ],
    suggestedBudget: 75,
    suggestedQuantity: 1,
  },
  {
    type: 'white_elephant',
    label: 'White Elephant / Secret Santa',
    emoji: '🎁',
    emojiBackground: '#ECFDF5',
    description: 'Fun exchange gifts within a set budget',
    defaultName: 'Exchange Gift',
    defaultInterests: ['Novelty items', 'Universal gifts', 'Funny gifts', 'Useful gadgets'],
    defaultGiftDos: ['Crowd-pleasing items', 'Funny but useful', 'Universally appealing', 'Within stated budget'],
    defaultGiftDonts: ['Inside jokes others won\'t get', 'Offensive humor', 'Going over budget'],
    defaultNotes: 'The best white elephant gifts are things everyone wants to steal. Think cozy, funny, or surprisingly useful.',
    keyDates: [
      { label: 'Holiday Party', monthDay: '12-15', repeats: true },
    ],
    suggestedBudget: 25,
    suggestedQuantity: 1,
  },
]

export function getPresetByType(type: string): GenericProfilePreset | undefined {
  return GENERIC_PROFILE_PRESETS.find(p => p.type === type)
}

export function resolveKeyDate(keyDate: KeyDate): { label: string; date: string; repeats: boolean } {
  const now = new Date()
  const [month, day] = keyDate.monthDay.split('-').map(Number)
  const year = now.getFullYear()
  const target = new Date(year, month - 1, day)

  // If the date has already passed this year and it repeats, use next year
  if (target < now && keyDate.repeats) {
    target.setFullYear(year + 1)
  }

  const yyyy = target.getFullYear()
  const mm = String(target.getMonth() + 1).padStart(2, '0')
  const dd = String(target.getDate()).padStart(2, '0')

  return {
    label: keyDate.label,
    date: `${yyyy}-${mm}-${dd}`,
    repeats: keyDate.repeats,
  }
}
