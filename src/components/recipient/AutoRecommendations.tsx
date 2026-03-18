'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { RecommendationCard, type Recommendation } from './RecommendationCard'
import { logger } from '@/lib/logger'

const CACHE_TTL = 4 * 60 * 60 * 1000 // 4 hours

function getCached(recipientId: string): Recommendation[] | null {
  try {
    const raw = sessionStorage.getItem(`recs-${recipientId}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(`recs-${recipientId}`)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(recipientId: string, data: Recommendation[]) {
  try {
    sessionStorage.setItem(`recs-${recipientId}`, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota exceeded, ignore */ }
}

interface AutoRecommendationsProps {
  recipientId: string
  onGiftAdded?: () => void
}

export function AutoRecommendations({ recipientId, onGiftAdded }: AutoRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [autoLoading, setAutoLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Auto-load on mount
  useEffect(() => {
    const cached = getCached(recipientId)
    if (cached) {
      setRecommendations(cached)
      setAutoLoading(false)
      return
    }

    const loadRecs = async () => {
      try {
        const res = await fetch(`/api/recommendations?recipientId=${recipientId}&count=5`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const recs = data.recommendations || []
        setRecommendations(recs)
        setCache(recipientId, recs)
      } catch (error) {
        logger.error('Error auto-loading recommendations:', error)
      } finally {
        setAutoLoading(false)
      }
    }

    loadRecs()
  }, [recipientId])

  const generateMore = useCallback(async () => {
    setGenerating(true)
    try {
      const body: Record<string, any> = { recipientId }
      if (category) body.category = category
      if (minPrice) body.minPrice = parseFloat(minPrice)
      if (maxPrice) body.maxPrice = parseFloat(maxPrice)

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      const newRecs = data.recommendations || []
      setRecommendations(newRecs)
      setCache(recipientId, newRecs)
    } catch (error) {
      logger.error('Error generating recommendations:', error)
    } finally {
      setGenerating(false)
    }
  }, [recipientId, category, minPrice, maxPrice])

  const handleFeedback = async (rec: Recommendation, feedbackType: string) => {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_id: recipientId,
        recommendation_name: rec.title,
        recommendation_description: rec.description,
        price_range: rec.price_range,
        where_to_buy: rec.where_to_buy,
        image_url: rec.image_url,
        amazon_link: rec.amazon_link,
        google_shopping_link: rec.google_shopping_link,
        feedback_type: feedbackType,
      }),
    })
    if (!res.ok) throw new Error('Failed to record feedback')

    if (feedbackType === 'added') {
      onGiftAdded?.()
    }
  }

  const handleRemove = (title: string) => {
    setRecommendations(prev => {
      const updated = prev.filter(r => r.title !== title)
      setCache(recipientId, updated)
      return updated
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-gray-900">AI Recommendations</h2>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem(`recs-${recipientId}`)
            setAutoLoading(true)
            setRecommendations([])
            // Re-trigger auto-load
            fetch(`/api/recommendations?recipientId=${recipientId}&count=5`)
              .then(r => r.json())
              .then(data => {
                const recs = data.recommendations || []
                setRecommendations(recs)
                setCache(recipientId, recs)
              })
              .catch(() => {})
              .finally(() => setAutoLoading(false))
          }}
          className="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Skeleton loading */}
      {autoLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-2.5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-14" />
                    <div className="h-4 bg-gray-200 rounded w-10" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex-1 h-6 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation cards */}
      {!autoLoading && recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <RecommendationCard
              key={`${rec.title}-${i}`}
              recommendation={rec}
              recipientId={recipientId}
              onFeedback={handleFeedback}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!autoLoading && recommendations.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-6">
          No recommendations yet. Click Generate More below.
        </p>
      )}

      {/* Advanced Filters (collapsible) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-purple-600 transition-colors"
      >
        Advanced Filters
        {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showFilters && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
          />
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-xs text-gray-400">$</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-full pl-5 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
              min="0"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-xs text-gray-400">$</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full pl-5 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Generate More button */}
      <button
        onClick={generateMore}
        disabled={generating || autoLoading}
        className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <span className="inline-block animate-spin"><RefreshCw className="w-4 h-4" /></span>
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate More
          </>
        )}
      </button>
    </div>
  )
}
