'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ReadinessGauge } from '@/components/dashboard/ReadinessGauge'
import { DoThisNextCard } from '@/components/dashboard/DoThisNextCard'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { BucketCard } from '@/components/dashboard/BucketCard'
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard'
import { UpcomingWeekCard } from '@/components/dashboard/UpcomingWeekCard'
import { ProfileCompletenessCard } from '@/components/dashboard/ProfileCompletenessCard'
import { getUpcomingOccasions, computeReadinessScore } from '@/lib/dashboard/readiness-score'
import { getDoThisNext, getDashboardStats } from '@/lib/dashboard/occasion-data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Sparkles, AlertTriangle, Gift, CheckCircle, Lightbulb, Package } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
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

  // Compute dashboard data
  const occasions = getUpcomingOccasions(safeRecipients, safeGifts, 60)
  const readinessScore = computeReadinessScore(occasions)
  const doThisNext = getDoThisNext(occasions)
  const stats = getDashboardStats(occasions, safeGifts)

  // Split gifts into buckets
  const needsAttention = safeGifts.filter(g => {
    const status = g.status || 'idea'
    const hasRecipient = g.recipients && g.recipients.length > 0
    return hasRecipient && status === 'idea'
  })

  const readyToGive = safeGifts.filter(g => {
    const status = g.status || 'idea'
    return ['purchased', 'wrapped'].includes(status)
  })

  const giftIdeas = safeGifts.filter(g => {
    const status = g.status || 'idea'
    const hasRecipient = g.recipients && g.recipients.length > 0
    return !hasRecipient && status === 'idea'
  })

  const generalStash = safeGifts.filter(g => {
    const status = g.status || 'idea'
    return ['delivered', 'given'].includes(status)
  })

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
        {/* Main column */}
        <div className="space-y-6">
          {/* Hero: Gauge + DoThisNext */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-2xl shadow-sm p-6 flex items-center justify-center">
              <ReadinessGauge score={readinessScore} />
            </div>
            <DoThisNextCard doThisNext={doThisNext} />
          </div>

          {/* Stats bar */}
          <StatsBar stats={stats} />

          {/* Bucket cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BucketCard
              title="Needs Attention"
              icon={AlertTriangle}
              gradientClasses="bg-gradient-to-r from-red-500 to-orange-500"
              borderColor="border-red-400"
              items={needsAttention}
              onItemClick={(g) => router.push(`/gifts/${g.id}`)}
            />
            <BucketCard
              title="Ready to Give"
              icon={CheckCircle}
              gradientClasses="bg-gradient-to-r from-green-500 to-emerald-500"
              borderColor="border-green-400"
              items={readyToGive}
              onItemClick={(g) => router.push(`/gifts/${g.id}`)}
            />
            <BucketCard
              title="Gift Ideas"
              icon={Lightbulb}
              gradientClasses="bg-gradient-to-r from-blue-500 to-purple-500"
              borderColor="border-blue-400"
              items={giftIdeas}
              onItemClick={(g) => router.push(`/gifts/${g.id}`)}
            />
            <BucketCard
              title="Given"
              icon={Gift}
              gradientClasses="bg-gradient-to-r from-teal-500 to-cyan-500"
              borderColor="border-teal-400"
              items={generalStash}
              onItemClick={(g) => router.push(`/gifts/${g.id}`)}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-col gap-4 sticky top-6 self-start">
          <QuickActionsCard />
          <UpcomingWeekCard occasions={occasions} />
          <ProfileCompletenessCard recipients={safeRecipients} />
        </div>
      </div>
    </div>
  )
}
