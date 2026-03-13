'use client'

import { useState, useCallback, useMemo } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { Recipient } from '@/types/database.types'

interface GiftIdea {
  title: string
  category: string
  ageRange: string
  priceRange: string
  occasion: string
  emoji: string
}

const GIFT_IDEAS: GiftIdea[] = [
  {
    title: 'Personalized Photo Book',
    category: 'Sentimental',
    ageRange: 'All ages',
    priceRange: '$20-$50',
    occasion: 'Birthdays, Anniversaries, Holidays',
    emoji: '📸',
  },
  {
    title: 'Subscription Box Service',
    category: 'Experience',
    ageRange: '18+',
    priceRange: '$15-$50/mo',
    occasion: 'Birthdays, Just Because',
    emoji: '📦',
  },
  {
    title: 'Smart Home Device',
    category: 'Tech',
    ageRange: '16+',
    priceRange: '$30-$100',
    occasion: 'Holidays, Housewarming',
    emoji: '🏠',
  },
  {
    title: 'Cooking or Baking Set',
    category: 'Hobbies',
    ageRange: '12+',
    priceRange: '$25-$75',
    occasion: 'Birthdays, Holidays',
    emoji: '👨‍🍳',
  },
  {
    title: 'Cozy Comfort Bundle',
    category: 'Comfort',
    ageRange: 'All ages',
    priceRange: '$30-$60',
    occasion: 'Holidays, Get Well Soon',
    emoji: '🕯️',
  },
  {
    title: 'Fitness Tracker or Smartwatch',
    category: 'Health & Fitness',
    ageRange: '13+',
    priceRange: '$30-$150',
    occasion: 'New Year, Birthdays',
    emoji: '⌚',
  },
  {
    title: 'Craft or DIY Kit',
    category: 'Creative',
    ageRange: '8+',
    priceRange: '$15-$45',
    occasion: 'Birthdays, Just Because',
    emoji: '🎨',
  },
]

function shuffleAndPick(arr: GiftIdea[], count: number): GiftIdea[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function findMatchingRecipients(idea: GiftIdea, recipients: Recipient[]): string[] {
  const ideaText = `${idea.category} ${idea.occasion} ${idea.ageRange}`.toLowerCase()
  return recipients
    .filter(r => {
      const interests = (r.interests || []).join(' ').toLowerCase()
      return interests.split(' ').some(w => w.length > 3 && ideaText.includes(w))
    })
    .map(r => r.name)
    .slice(0, 2)
}

export function GiftInspiration({ recipients }: { recipients: Recipient[] }) {
  const [picks, setPicks] = useState<GiftIdea[]>(() => shuffleAndPick(GIFT_IDEAS, 4))
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = useCallback(() => {
    setSpinning(true)
    setTimeout(() => {
      setPicks(shuffleAndPick(GIFT_IDEAS, 4))
      setSpinning(false)
    }, 300)
  }, [])

  const recipientMatches = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const idea of picks) {
      map.set(idea.title, findMatchingRecipients(idea, recipients))
    }
    return map
  }, [picks, recipients])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Gift Inspiration</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={spinning}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-giftstash-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} />
          Fresh Ideas
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Curated picks based on your people</p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {picks.map(idea => {
          const matches = recipientMatches.get(idea.title) || []
          return (
            <div
              key={idea.title}
              className="rounded-xl overflow-hidden bg-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {/* Image area */}
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center">
                <span className="text-4xl">{idea.emoji}</span>
              </div>
              {/* Content */}
              <div className="p-2.5">
                <h3 className="text-xs font-semibold text-gray-900 line-clamp-2">{idea.title}</h3>
                <p className="text-sm font-bold text-giftstash-orange mt-0.5">{idea.priceRange}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 inline-block mt-1">
                  {idea.category}
                </span>
                {matches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {matches.map(name => (
                      <span
                        key={name}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <Link
        href="/inspiration"
        className="text-xs text-gray-500 hover:text-giftstash-orange mt-3 text-center block transition-colors"
      >
        Browse all ideas →
      </Link>
    </div>
  )
}
