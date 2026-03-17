'use client'

import { useState } from 'react'
import { Plus, Heart, Check, Star, X } from 'lucide-react'

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
    <div className="border border-gray-200 rounded-xl p-3 hover:border-purple-300 transition-all flex flex-col h-full bg-white relative">
      {/* Badges */}
      {liked && (
        <div className="absolute top-2 right-2 bg-pink-100 text-pink-600 rounded-full p-1">
          <Heart className="w-3 h-3 fill-current" />
        </div>
      )}
      {potential && (
        <div className="absolute top-2 right-2 bg-amber-100 text-amber-600 rounded-full p-1">
          <Star className="w-3 h-3 fill-current" />
        </div>
      )}

      {/* Image */}
      {rec.image_url && (
        <div className="mb-2.5 rounded-lg overflow-hidden bg-gray-100">
          <img src={rec.image_url} alt={rec.title} className="w-full h-28 object-cover" />
        </div>
      )}

      {/* Title & Price */}
      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.25rem]">{rec.title}</h3>
      <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded w-fit mb-1.5">
        {rec.price_range}
      </span>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{rec.description}</p>

      {/* Shopping links */}
      {(rec.amazon_link || rec.google_shopping_link) && (
        <div className="flex gap-1 mb-2">
          {rec.amazon_link && (
            <a
              href={rec.amazon_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-2 py-1 bg-orange-500 text-white rounded text-[11px] hover:bg-orange-600 transition-colors text-center font-medium"
            >
              Amazon
            </a>
          )}
          {rec.google_shopping_link && (
            <a
              href={rec.google_shopping_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-[11px] hover:bg-blue-600 transition-colors text-center font-medium"
            >
              Google
            </a>
          )}
        </div>
      )}

      {/* 5 Feedback Buttons */}
      <div className="mt-auto flex gap-1">
        <button
          onClick={() => handleFeedback('added')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          title="Add to gift list"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
        <button
          onClick={() => handleFeedback('liked')}
          disabled={processing || liked}
          className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium disabled:opacity-50 transition-colors ${
            liked ? 'bg-pink-100 text-pink-600' : 'bg-white border border-gray-300 text-gray-700 hover:bg-pink-50 hover:border-pink-300'
          }`}
          title="Like this idea"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => handleFeedback('already_have')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-[11px] font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Already have this"
        >
          <Check className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Have</span>
        </button>
        <button
          onClick={() => handleFeedback('potential')}
          disabled={processing || potential}
          className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium disabled:opacity-50 transition-colors ${
            potential ? 'bg-amber-100 text-amber-600' : 'bg-white border border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300'
          }`}
          title="Maybe / potential"
        >
          <Star className={`w-3.5 h-3.5 ${potential ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Maybe</span>
        </button>
        <button
          onClick={() => handleFeedback('rejected')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-[11px] font-medium hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors"
          title="Not this"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">No</span>
        </button>
      </div>
    </div>
  )
}
