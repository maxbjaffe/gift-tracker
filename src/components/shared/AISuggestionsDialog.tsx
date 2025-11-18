'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import { OCCASION_TYPES } from '@/types/database.types'
import { toast } from 'sonner'

interface AISuggestionsDialogProps {
  recipientId: string
  recipientName: string
}

interface GiftSuggestion {
  name: string
  description: string
  price_range: string
  reason: string
}

export function AISuggestionsDialog({ recipientId, recipientName }: AISuggestionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [budget, setBudget] = useState('')
  const [occasion, setOccasion] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])

  const handleGetSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          budget: budget ? parseFloat(budget) : null,
          occasion: occasion || null,
          category: category || null,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestions')
      }

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions)
      } else {
        toast.error('No suggestions generated. Try again.')
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to get suggestions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Gift Ideas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Gift Suggestions for {recipientName}
          </DialogTitle>
          <DialogDescription>
            Get personalized gift ideas powered by Claude AI based on {recipientName}'s profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., Toys, Books, Electronics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Specify a gift category to focus suggestions</p>
            </div>
            <div>
              <Label htmlFor="occasion">Occasion (optional)</Label>
              <select
                id="occasion"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                <option value="">Select occasion...</option>
                {OCCASION_TYPES.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  disabled={loading}
                  className="pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  disabled={loading}
                  className="pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="budget">Overall Budget (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  disabled={loading}
                  className="pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleGetSuggestions}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personalized Gift Ideas:</h3>
              {suggestions.map((suggestion, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{suggestion.name}</h4>
                    <span className="text-sm font-medium text-purple-600">
                      {suggestion.price_range}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-sm text-purple-900">
                      <span className="font-semibold">Why this works:</span> {suggestion.reason}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
