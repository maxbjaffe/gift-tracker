'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import type { Recipient } from '@/types/database.types'
import type { UpcomingOccasion } from '@/lib/dashboard/readiness-score'
import { logger } from '@/lib/logger'

interface Recommendation {
  title: string
  price_range: string
  category: string
  image_url?: string
}

interface RecipientRecs {
  recipientId: string
  recipientName: string
  recipient: Recipient
  recs: Recommendation[]
  loading: boolean
}

const CACHE_TTL = 4 * 60 * 60 * 1000

function getCached(recipientId: string): Recommendation[] | null {
  try {
    const raw = sessionStorage.getItem(`recs-${recipientId}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function setCache(recipientId: string, data: Recommendation[]) {
  try {
    sessionStorage.setItem(`recs-${recipientId}`, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota exceeded */ }
}

interface GiftResearchProps {
  recipients: Recipient[]
  occasions?: UpcomingOccasion[]
}

export function GiftResearch({ recipients, occasions }: GiftResearchProps) {
  const [recipientRecs, setRecipientRecs] = useState<RecipientRecs[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Pick up to 4 recipients, prioritizing those with upcoming occasions or richest profiles
  const selectedRecipients = useMemo(() => {
    if (recipients.length === 0) return []

    const scored = recipients.map(r => {
      let score = 0
      // Boost if they have upcoming occasions
      if (occasions) {
        const hasOccasion = occasions.find(o => o.recipientId === r.id)
        if (hasOccasion) score += 10 + Math.max(0, 30 - hasOccasion.daysUntil)
      }
      // Boost for rich profiles
      if (r.interests?.length) score += r.interests.length
      if (r.gift_preferences) score += 2
      return { recipient: r, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(s => s.recipient)
  }, [recipients, occasions])

  const fetchRecs = useCallback(async (recipient: Recipient, skipCache = false): Promise<Recommendation[]> => {
    if (!skipCache) {
      const cached = getCached(recipient.id)
      if (cached) return cached.slice(0, 3)
    }

    try {
      const res = await fetch(`/api/recommendations?recipientId=${recipient.id}&count=3`)
      if (!res.ok) return []
      const data = await res.json()
      const recs = (data.recommendations || []) as Recommendation[]
      setCache(recipient.id, recs)
      return recs.slice(0, 3)
    } catch (error) {
      logger.error('Error fetching recs for', recipient.name, error)
      return []
    }
  }, [])

  useEffect(() => {
    if (selectedRecipients.length === 0) return

    // Initialize with loading state
    const initial: RecipientRecs[] = selectedRecipients.map(r => ({
      recipientId: r.id,
      recipientName: r.name,
      recipient: r,
      recs: [],
      loading: true,
    }))
    setRecipientRecs(initial)

    // Fetch in parallel
    selectedRecipients.forEach(async (r) => {
      const recs = await fetchRecs(r)
      setRecipientRecs(prev =>
        prev.map(pr => pr.recipientId === r.id ? { ...pr, recs, loading: false } : pr)
      )
    })
  }, [selectedRecipients, fetchRecs])

  const handleRefresh = async () => {
    setRefreshing(true)
    setRecipientRecs(prev => prev.map(pr => ({ ...pr, loading: true, recs: [] })))

    await Promise.all(selectedRecipients.map(async (r) => {
      const recs = await fetchRecs(r, true)
      setRecipientRecs(prev =>
        prev.map(pr => pr.recipientId === r.id ? { ...pr, recs, loading: false } : pr)
      )
    }))

    setRefreshing(false)
  }

  if (selectedRecipients.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Gift Research</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">Add recipients to get personalized gift ideas</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Gift Research</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-giftstash-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Personalized picks for your people</p>

      {/* Per-recipient sections */}
      <div className="mt-3 space-y-4">
        {recipientRecs.map(pr => (
          <div key={pr.recipientId}>
            {/* Recipient header */}
            <Link
              href={`/recipients/${pr.recipientId}`}
              className="flex items-center gap-2 mb-2 group"
            >
              <Avatar
                type={pr.recipient.avatar_type as any}
                data={pr.recipient.avatar_data || undefined}
                background={pr.recipient.avatar_background || undefined}
                name={pr.recipientName}
                size="xs"
              />
              <span className="text-sm font-semibold text-gray-900 group-hover:text-giftstash-orange transition-colors">
                {pr.recipientName}&apos;s Picks
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-giftstash-orange transition-colors ml-auto" />
            </Link>

            {/* Loading skeleton */}
            {pr.loading && (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendation rows */}
            {!pr.loading && pr.recs.length > 0 && (
              <div className="space-y-1.5">
                {pr.recs.map((rec, i) => (
                  <Link
                    key={`${rec.title}-${i}`}
                    href={`/recipients/${pr.recipientId}`}
                    className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {rec.image_url ? (
                      <img
                        src={rec.image_url}
                        alt={rec.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{rec.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-giftstash-orange">{rec.price_range}</span>
                        {rec.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {rec.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            {/* No results */}
            {!pr.loading && pr.recs.length === 0 && (
              <p className="text-xs text-gray-400 pl-10">No ideas yet — enrich their profile for better picks.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
