'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, DollarSign, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

// Curated trending products that rotate daily
const TRENDING_PRODUCTS = [
  {
    name: 'Portable Espresso Maker',
    description: 'Perfect for coffee lovers on the go. Make barista-quality espresso anywhere.',
    price: 79.99,
    category: 'Kitchen & Dining',
    reason: 'Trending among professionals and travelers',
    imageUrl: '/images/product-placeholder.png',
    link: 'https://amazon.com'
  },
  {
    name: 'Smart Plant Monitor',
    description: 'Keep your plants thriving with AI-powered care recommendations.',
    price: 49.99,
    category: 'Home & Garden',
    reason: 'Popular with plant enthusiasts',
    imageUrl: '/images/product-placeholder.png',
    link: 'https://amazon.com'
  },
  {
    name: 'Wireless Charging Station',
    description: '3-in-1 charging dock for phone, watch, and earbuds.',
    price: 59.99,
    category: 'Electronics',
    reason: 'Top seller for tech lovers',
    imageUrl: '/images/product-placeholder.png',
    link: 'https://amazon.com'
  },
  {
    name: 'Aromatherapy Diffuser Set',
    description: 'Premium diffuser with essential oils collection.',
    price: 44.99,
    category: 'Wellness',
    reason: 'Perfect for relaxation and self-care',
    imageUrl: '/images/product-placeholder.png',
    link: 'https://amazon.com'
  },
  {
    name: 'Personalized Leather Journal',
    description: 'High-quality leather journal with custom engraving.',
    price: 34.99,
    category: 'Stationery',
    reason: 'Great for writers and planners',
    imageUrl: '/images/product-placeholder.png',
    link: 'https://amazon.com'
  }
]

export function ProductOfTheDay() {
  const [product, setProduct] = useState(TRENDING_PRODUCTS[0])

  useEffect(() => {
    // Rotate product based on day of year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const productIndex = dayOfYear % TRENDING_PRODUCTS.length
    setProduct(TRENDING_PRODUCTS[productIndex])
  }, [])

  return (
    <Card className="overflow-hidden border-2 border-giftstash-orange/20 bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 bg-gradient-to-r from-giftstash-orange to-giftstash-blue rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              Product of the Day
            </h2>
            <p className="text-sm text-gray-600">AI-curated trending gift</p>
          </div>
          <Badge className="ml-auto bg-giftstash-orange text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Image */}
          <div className="relative aspect-square bg-white rounded-xl overflow-hidden border-2 border-gray-200">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              🎁
            </div>
          </div>

          {/* Product Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                <div className="flex items-center gap-1 text-2xl font-bold text-giftstash-green">
                  <DollarSign className="h-6 w-6" />
                  {product.price.toFixed(2)}
                </div>
              </div>
              <Badge variant="outline" className="mb-3">
                {product.category}
              </Badge>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">Why this gift?</p>
                  <p className="text-sm text-purple-800">{product.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
                onClick={() => {
                  // In production, this would save to user's gift list
                  alert('Save functionality coming soon!')
                }}
              >
                Save to My List
              </Button>
              <Button
                variant="outline"
                className="border-2"
                onClick={() => window.open(product.link, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
