'use client'

import { useState } from 'react'
import { Plus, Heart, Check, Star, X, Sparkles } from 'lucide-react'

export interface Recommendation {
  title: string
  description: string
  price_range: string
  reasoning: string
  where_to_buy: string
  category: string
  image_url?: string
  amazon_link?: string
  google_shopping_link?: string
}

type FeedbackType = 'added' | 'liked' | 'already_have' | 'potential' | 'rejected'

interface RecommendationCardProps {
  recommendation: Recommendation
  recipientId: string
  onFeedback: (rec: Recommendation, type: FeedbackType) => Promise<void>
  onRemove: (title: string) => void
}

export function RecommendationCard({ recommendation: rec, recipientId, onFeedback, onRemove }: RecommendationCardProps) {
  const [processing, setProcessing] = useState(false)
  const [liked, setLiked] = useState(false)
  const [potential, setPotential] = useState(false)

  const handleFeedback = async (type: FeedbackType) => {
    setProcessing(true)
    try {
      await onFeedback(rec, type)
      if (type === 'liked') {
        setLiked(true)
        setProcessing(false)
        return
      }
      if (type === 'potential') {
        setPotential(true)
        setProcessing(false)
        return
      }
      // added, already_have, rejected → remove card
      onRemove(rec.title)
    } catch {
      setProcessing(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-2.5 hover:border-purple-300 transition-all bg-white relative">
      <div className="flex gap-3">
        {/* Thumbnail */}
        {rec.image_url ? (
          <img src={rec.image_url} alt={rec.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 flex-1">{rec.title}</h3>
            {liked && (
              <span className="bg-pink-100 text-pink-600 rounded-full p-0.5 flex-shrink-0">
                <Heart className="w-3 h-3 fill-current" />
              </span>
            )}
            {potential && (
              <span className="bg-amber-100 text-amber-600 rounded-full p-0.5 flex-shrink-0">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="bg-green-100 text-green-700 text-[11px] font-bold px-1.5 py-0.5 rounded">
              {rec.price_range}
            </span>
            {rec.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{rec.category}</span>
            )}
            {(rec.amazon_link || rec.google_shopping_link) && (
              <div className="flex gap-1 ml-auto">
                {rec.amazon_link && (
                  <a href={rec.amazon_link} target="_blank" rel="noopener noreferrer"
                    className="px-1.5 py-0.5 bg-orange-500 text-white rounded text-[10px] hover:bg-orange-600 transition-colors font-medium">
                    Amazon
                  </a>
                )}
                {rec.google_shopping_link && (
                  <a href={rec.google_shopping_link} target="_blank" rel="noopener noreferrer"
                    className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-[10px] hover:bg-blue-600 transition-colors font-medium">
                    Google
                  </a>
                )}
              </div>
            )}
          </div>

          {rec.description && (
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{rec.description}</p>
          )}
        </div>
      </div>

      {/* Feedback buttons — compact row */}
      <div className="flex gap-1 mt-2">
        <button
          onClick={() => handleFeedback('added')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-1 py-1 bg-green-600 text-white rounded text-[10px] font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          title="Add to gift list"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">Add</span>
        </button>
        <button
          onClick={() => handleFeedback('liked')}
          disabled={processing || liked}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium disabled:opacity-50 transition-colors ${
            liked ? 'bg-pink-100 text-pink-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-pink-50 hover:border-pink-300'
          }`}
          title="Like this idea"
        >
          <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => handleFeedback('already_have')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-gray-200 text-gray-600 rounded text-[10px] font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Already have this"
        >
          <Check className="w-3 h-3" />
          <span className="hidden sm:inline">Have</span>
        </button>
        <button
          onClick={() => handleFeedback('potential')}
          disabled={processing || potential}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium disabled:opacity-50 transition-colors ${
            potential ? 'bg-amber-100 text-amber-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-300'
          }`}
          title="Maybe / potential"
        >
          <Star className={`w-3 h-3 ${potential ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Maybe</span>
        </button>
        <button
          onClick={() => handleFeedback('rejected')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-gray-200 text-gray-600 rounded text-[10px] font-medium hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors"
          title="Not this"
        >
          <X className="w-3 h-3" />
          <span className="hidden sm:inline">No</span>
        </button>
      </div>
    </div>
  )
}
