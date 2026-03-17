'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, RefreshCw, ChevronRight, TrendingUp } from 'lucide-react'
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
  description?: string
}

const CACHE_TTL = 4 * 60 * 60 * 1000
const TRENDS_CACHE_KEY = 'giftstash-trending'

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

// Curated trending gift trends — refreshed periodically
const TRENDING_GIFTS: { title: string; trend: string; priceRange: string; category: string; emoji: string }[] = [
  { title: 'Stanley Quencher H2.0', trend: 'TikTok sensation — still the #1 tumbler', priceRange: '$35-$50', category: 'Lifestyle', emoji: '🥤' },
  { title: 'Kindle Colorsoft', trend: 'First color Kindle — perfect for readers', priceRange: '$280', category: 'Tech', emoji: '📖' },
  { title: 'Therabody Relief Kit', trend: 'Trending for self-care gifts', priceRange: '$49-$99', category: 'Wellness', emoji: '💆' },
  { title: 'LEGO Botanicals Collection', trend: 'Adult LEGO sets surging — flowers that last', priceRange: '$13-$60', category: 'Creative', emoji: '🌸' },
  { title: 'Oura Ring Gen 4', trend: 'Wearable health tracking — huge gift demand', priceRange: '$349', category: 'Tech', emoji: '💍' },
  { title: 'Our Place Always Pan 2.0', trend: 'Top kitchen gift — viral cookware', priceRange: '$130', category: 'Home', emoji: '🍳' },
  { title: 'Sunday Riley Good Genes', trend: 'Skincare staple — always a safe gift', priceRange: '$85-$122', category: 'Beauty', emoji: '✨' },
  { title: 'Apple AirTag (4 pack)', trend: 'Practical luxury — never lose keys again', priceRange: '$79', category: 'Tech', emoji: '📍' },
]

function getSeasonalTrends(): typeof TRENDING_GIFTS {
  // Rotate selection based on current date for variety
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const offset = dayOfYear % TRENDING_GIFTS.length
  const rotated = [...TRENDING_GIFTS.slice(offset), ...TRENDING_GIFTS.slice(0, offset)]
  return rotated.slice(0, 5)
}

interface GiftResearchProps {
  recipients: Recipient[]
  occasions?: UpcomingOccasion[]
}

export function GiftResearch({ recipients, occasions }: GiftResearchProps) {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Pick the single best recipient — prioritize upcoming occasion + richest profile
  const topRecipient = useMemo(() => {
    if (recipients.length === 0) return null

    const scored = recipients.map(r => {
      let score = 0
      if (occasions) {
        const occ = occasions.find(o => o.recipientId === r.id)
        if (occ) score += 10 + Math.max(0, 30 - occ.daysUntil)
      }
      if (r.interests?.length) score += r.interests.length
      if (r.gift_preferences) score += 2
      return { recipient: r, score }
    })

    return scored.sort((a, b) => b.score - a.score)[0]?.recipient || null
  }, [recipients, occasions])

  const trends = useMemo(() => getSeasonalTrends(), [])

  const fetchRecs = useCallback(async (recipient: Recipient, skipCache = false) => {
    if (!skipCache) {
      const cached = getCached(recipient.id)
      if (cached) return cached.slice(0, 3)
    }
    try {
      const res = await fetch(`/api/recommendations?recipientId=${recipient.id}&count=3`)
      if (!res.ok) return []
      const data = await res.json()
      const fetched = (data.recommendations || []) as Recommendation[]
      setCache(recipient.id, fetched)
      return fetched.slice(0, 3)
    } catch (error) {
      logger.error('Error fetching recs:', error)
      return []
    }
  }, [])

  useEffect(() => {
    if (!topRecipient) {
      setLoading(false)
      return
    }
    fetchRecs(topRecipient).then(r => {
      setRecs(r)
      setLoading(false)
    })
  }, [topRecipient, fetchRecs])

  const handleRefresh = async () => {
    if (!topRecipient) return
    setRefreshing(true)
    const r = await fetchRecs(topRecipient, true)
    setRecs(r)
    setRefreshing(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Gift Research</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-giftstash-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Side-by-side: AI picks for 1 person (left) + Trending (right) */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: AI picks for top recipient */}
        <div>
          {topRecipient ? (
            <>
              <Link
                href={`/recipients/${topRecipient.id}`}
                className="flex items-center gap-2 mb-2 group"
              >
                <Avatar
                  type={topRecipient.avatar_type as any}
                  data={topRecipient.avatar_data || undefined}
                  background={topRecipient.avatar_background || undefined}
                  name={topRecipient.name}
                  size="xs"
                />
                <span className="text-sm font-semibold text-gray-900 group-hover:text-giftstash-orange transition-colors">
                  Ideas for {topRecipient.name}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-giftstash-orange ml-auto" />
              </Link>

              {loading && (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
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

              {!loading && recs.length > 0 && (
                <div className="space-y-1.5">
                  {recs.map((rec, i) => (
                    <Link
                      key={`${rec.title}-${i}`}
                      href={`/recipients/${topRecipient.id}`}
                      className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {rec.image_url ? (
                        <img src={rec.image_url} alt={rec.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
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
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{rec.category}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {!loading && recs.length === 0 && (
                <p className="text-xs text-gray-400 pl-10">No ideas yet — enrich their profile for better picks.</p>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400">Add recipients to get personalized gift ideas</p>
            </div>
          )}
        </div>

        {/* Right: Trending gift trends */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">Trending Gifts</span>
          </div>
          <div className="space-y-1.5">
            {trends.map((trend, i) => (
              <a
                key={i}
                href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(trend.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{trend.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{trend.title}</h3>
                  <p className="text-[11px] text-gray-500 truncate">{trend.trend}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-giftstash-orange">{trend.priceRange}</span>
                  <span className="block text-[10px] text-gray-400">{trend.category}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
