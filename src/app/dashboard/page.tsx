'use client'

import { useEffect, useRef, useMemo } from 'react'
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

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 17) return 'Good afternoon!'
  return 'Good evening!'
}

function getGreetingNudge(occasions: ReturnType<typeof getUpcomingOccasions>): string {
  if (occasions.length === 0) return "You're all clear — no upcoming occasions."
  const first = occasions[0]
  const isHoliday = first.recipientId === '__holiday__'
  const name = isHoliday ? first.occasionName : `${first.recipientName}'s ${first.occasionType === 'birthday' ? 'birthday' : 'occasion'}`

  if (first.daysUntil < 0) return `${name} was ${Math.abs(first.daysUntil)} days ago — still need a gift?`
  if (first.daysUntil === 0) return `${name} is today!`
  if (first.daysUntil <= 7) return `${name} is in ${first.daysUntil} days — crunch time!`

  const thisMonth = occasions.filter(o => o.daysUntil <= 30).length
  if (thisMonth > 1) return `You've got ${thisMonth} occasions this month.`
  return `${name} is in ${first.daysUntil} days.`
}

export default function DashboardPage() {
  const { recipients, loading: recipientsLoading, refetch: refetchRecipients } = useRecipients()
  const { gifts, loading: giftsLoading, refetch: refetchGifts } = useGifts()
  const seedAttempted = useRef(false)

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
  const greeting = getGreeting()
  const nudge = getGreetingNudge(occasions)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <p className="text-sm text-gray-600 mb-5">
        <span className="font-semibold text-gray-900">{greeting}</span>{' '}
        {nudge}
      </p>

      {/* Two-column on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
        {/* Left column: occasions + stash */}
        <div className="space-y-6">
          <ComingUpHero occasions={occasions} recipientMap={recipientMap} />
          <StashOverview gifts={safeGifts} recipients={safeRecipients} occasions={occasions} />
        </div>

        {/* Right column: inspiration — sticky on desktop */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-6 lg:self-start">
          <GiftInspiration recipients={safeRecipients} />
        </div>
      </div>
    </div>
  )
}
