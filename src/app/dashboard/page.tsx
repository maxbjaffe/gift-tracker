'use client'

import { useEffect, useRef } from 'react'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ComingUpHero } from '@/components/dashboard/ComingUpHero'
import { StashOverview } from '@/components/dashboard/StashOverview'
import { GiftInspiration } from '@/components/dashboard/GiftInspiration'
import { getUpcomingOccasions } from '@/lib/dashboard/readiness-score'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const { recipients, loading: recipientsLoading, refetch: refetchRecipients } = useRecipients()
  const { gifts, loading: giftsLoading, refetch: refetchGifts } = useGifts()
  const seedAttempted = useRef(false)

  // Seed sample data for new users on first visit
  useEffect(() => {
    const seedSampleData = async () => {
      if (seedAttempted.current) return
      seedAttempted.current = true

      try {
        const response = await fetch('/api/seed-sample-data', { method: 'POST' })
        const data = await response.json()
        if (data.seeded) {
          refetchRecipients?.()
          refetchGifts?.()
        }
      } catch (error) {
        console.error('Error seeding sample data:', error)
      }
    }

    if (!recipientsLoading && !giftsLoading) {
      const hasNoData = (!recipients || recipients.length === 0) && (!gifts || gifts.length === 0)
      if (hasNoData) {
        seedSampleData()
      }
    }
  }, [recipientsLoading, giftsLoading, recipients, gifts, refetchRecipients, refetchGifts])

  const loading = recipientsLoading || giftsLoading

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingSpinner type="card" count={4} />
      </div>
    )
  }

  const safeRecipients = recipients || []
  const safeGifts = gifts || []

  // Empty state
  if (safeRecipients.length === 0 && safeGifts.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <Card className="max-w-2xl mx-auto p-12 bg-white/60">
            <div className="text-6xl mb-6">🎁</div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              Start Your Gift Journey!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Never forget a gift idea again. Add your first recipient to get started.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild size="lg" className="h-16 text-lg bg-gradient-to-r from-giftstash-orange to-giftstash-blue">
                <Link href="/recipients/new">
                  <Plus className="h-6 w-6 mr-2" />
                  Add Your First Recipient
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 text-lg border-2">
                <Link href="/chat">
                  <Sparkles className="h-6 w-6 mr-2" />
                  Chat with Gift AI
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const recipientMap = Object.fromEntries(
    safeRecipients.map(r => [r.id, r])
  )
  const occasions = getUpcomingOccasions(safeRecipients, safeGifts, 60)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <ComingUpHero occasions={occasions} recipientMap={recipientMap} />
      <StashOverview gifts={safeGifts} recipients={safeRecipients} />
      <GiftInspiration recipients={safeRecipients} />
    </div>
  )
}
