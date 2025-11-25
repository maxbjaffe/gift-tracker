'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ExternalLink, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

// AI-curated gift recommendations that rotate daily
const AI_GIFT_RECOMMENDATIONS = [
  {
    title: 'Personalized Photo Book',
    description: 'Create a custom photo album filled with cherished memories. Perfect for parents, grandparents, or anyone who loves nostalgia.',
    category: 'Sentimental',
    ageRange: 'All ages',
    priceRange: '$20-$50',
    occasion: 'Birthdays, Anniversaries, Holidays',
    emoji: '📸',
    link: 'https://www.amazon.com/s?k=personalized+photo+book'
  },
  {
    title: 'Subscription Box Service',
    description: 'Monthly curated boxes tailored to interests - coffee, snacks, books, wellness, or hobbies. The gift that keeps giving.',
    category: 'Experience',
    ageRange: '18+',
    priceRange: '$15-$50/month',
    occasion: 'Birthdays, Just Because',
    emoji: '📦',
    link: 'https://www.amazon.com/s?k=subscription+box'
  },
  {
    title: 'Smart Home Device',
    description: 'Voice-controlled assistant or smart display. Makes daily life easier and more fun for tech enthusiasts.',
    category: 'Tech',
    ageRange: '16+',
    priceRange: '$30-$100',
    occasion: 'Holidays, Housewarming',
    emoji: '🏠',
    link: 'https://www.amazon.com/s?k=smart+home+device'
  },
  {
    title: 'Cooking or Baking Set',
    description: 'High-quality kitchen tools, specialty ingredients, or cooking class voucher. Perfect for food lovers.',
    category: 'Hobbies',
    ageRange: '12+',
    priceRange: '$25-$75',
    occasion: 'Birthdays, Holidays',
    emoji: '👨‍🍳',
    link: 'https://www.amazon.com/s?k=cooking+baking+set'
  },
  {
    title: 'Cozy Comfort Bundle',
    description: 'Soft blanket, candles, hot cocoa kit, and slippers. The ultimate relaxation gift for anyone.',
    category: 'Comfort',
    ageRange: 'All ages',
    priceRange: '$30-$60',
    occasion: 'Holidays, Get Well Soon',
    emoji: '🕯️',
    link: 'https://www.amazon.com/s?k=cozy+comfort+bundle'
  },
  {
    title: 'Fitness Tracker or Smartwatch',
    description: 'Track activity, sleep, and health goals. Great for fitness enthusiasts or anyone starting a wellness journey.',
    category: 'Health & Fitness',
    ageRange: '13+',
    priceRange: '$30-$150',
    occasion: 'New Year, Birthdays',
    emoji: '⌚',
    link: 'https://www.amazon.com/s?k=fitness+tracker'
  },
  {
    title: 'Craft or DIY Kit',
    description: 'Paint-by-numbers, embroidery, model building, or terrarium kit. Perfect for creative minds.',
    category: 'Creative',
    ageRange: '8+',
    priceRange: '$15-$45',
    occasion: 'Birthdays, Just Because',
    emoji: '🎨',
    link: 'https://www.amazon.com/s?k=craft+diy+kit'
  }
]

export function AIGiftRecoOfTheDay() {
  const [recommendation, setRecommendation] = useState(AI_GIFT_RECOMMENDATIONS[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Rotate recommendation based on day of year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const recoIndex = dayOfYear % AI_GIFT_RECOMMENDATIONS.length
    setRecommendation(AI_GIFT_RECOMMENDATIONS[recoIndex])
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Get a random recommendation (excluding current one)
    const otherRecommendations = AI_GIFT_RECOMMENDATIONS.filter(r => r.title !== recommendation.title)
    const randomIndex = Math.floor(Math.random() * otherRecommendations.length)
    setTimeout(() => {
      setRecommendation(otherRecommendations[randomIndex])
      setIsRefreshing(false)
    }, 300)
  }

  return (
    <Card className="p-6 h-full bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold flex-1">AI Gift Pick</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{recommendation.emoji}</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg">{recommendation.title}</h4>
            <p className="text-xs text-purple-600 font-medium">{recommendation.category}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          {recommendation.description}
        </p>

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Age Range:</span>
            <span className="font-medium text-gray-900">{recommendation.ageRange}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Price Range:</span>
            <span className="font-medium text-green-700">{recommendation.priceRange}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Best For:</span>
            <span className="font-medium text-gray-900">{recommendation.occasion}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-2 mt-2"
          onClick={() => window.open(recommendation.link, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Shop Now
        </Button>
      </div>
    </Card>
  )
}
