'use client'

import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { GiftStashNav } from '@/components/GiftStashNav'
import { DashboardBudgetOverview } from '@/components/DashboardBudgetOverview'
import { AIGiftRecoOfTheDay } from '@/components/AIGiftRecoOfTheDay'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Gift, Calendar, DollarSign, Sparkles, Award, Plus, ArrowRight, Settings, MessageSquare, Chrome, Smartphone } from 'lucide-react'
import { getUpcomingHolidays } from '@/lib/utils/holidays'

export default function DashboardPage() {
  const { recipients, loading: recipientsLoading } = useRecipients()
  const { gifts, loading: giftsLoading } = useGifts()

  const loading = recipientsLoading || giftsLoading

  if (loading) {
    return (
      <>
        <GiftStashNav />
        <div className="container mx-auto p-8">
          <LoadingSpinner type="card" count={4} />
        </div>
      </>
    )
  }

  // Add safety checks for undefined arrays
  const safeRecipients = recipients || []
  const safeGifts = gifts || []

  // Calculate stats using per-recipient status
  const totalGifts = safeGifts.length

  // Count gift-recipient pairs by status
  const giftRecipientPairs = safeGifts.flatMap(gift =>
    (gift.recipients || []).map(recipient => ({
      gift,
      recipient,
      status: recipient.status || gift.status || 'idea'
    }))
  )

  const giftsByStatus = giftRecipientPairs.reduce((acc, pair) => {
    acc[pair.status] = (acc[pair.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate total value of purchased gifts (per recipient)
  const totalValue = giftRecipientPairs
    .filter((pair) => pair.status === 'purchased')
    .reduce((sum, pair) => {
      return sum + (pair.gift.current_price || 0)
    }, 0)

  // Get upcoming birthdays (next 90 days)
  const upcomingBirthdays = safeRecipients
    .filter((r) => r.birthday)
    .map((r) => {
      const birthday = new Date(r.birthday!)
      const today = new Date()
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      )

      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }

      const daysUntil = Math.ceil(
        (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      return { ...r, daysUntil, date: thisYearBirthday, type: 'birthday' as const }
    })
    .filter((r) => r.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  // Get upcoming holidays
  const upcomingHolidays = getUpcomingHolidays(90).map(h => ({ ...h, type: 'holiday' as const }))

  // Combine birthdays and holidays, sort by date
  const upcomingEvents = [...upcomingBirthdays, ...upcomingHolidays]
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6) // Show top 6

  // Calculate achievements
  const achievements = {
    giftMaster: totalGifts >= 10,
    budgetWizard: safeRecipients.some(r => r.max_budget && r.max_budget > 0),
    earlyBird: upcomingBirthdays.length > 0 && upcomingBirthdays[0].daysUntil > 7,
    organized: safeRecipients.length >= 5
  }

  const achievementCount = Object.values(achievements).filter(Boolean).length

  // Empty state
  const isEmpty = safeRecipients.length === 0 && safeGifts.length === 0

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">

        {isEmpty ? (
          /* Empty State - First Time User */
          <div className="text-center py-16">
            <Card className="max-w-2xl mx-auto p-12">
              <div className="text-6xl mb-6">🎁</div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                Start Your Gift Journey!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Never forget a gift idea again. Add your first recipient to get started.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild size="lg" className="h-16 text-lg bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light">
                  <Link href="/recipients/new">
                    <Plus className="h-6 w-6 mr-2" />
                    Add Your First Recipient
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 text-lg border-2">
                  <Link href="/inspiration">
                    <Sparkles className="h-6 w-6 mr-2" />
                    Browse Gift Ideas
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Setup Prompt - Get the most out of GiftStash */}
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get the Full GiftStash Experience</h3>
                      <p className="text-sm text-gray-600">
                        Save gift ideas via text, install the app, or add the browser extension for one-click saving.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:flex-shrink-0">
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/setup">
                        <Smartphone className="h-4 w-4 mr-1" />
                        Quick Setup
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Text gift ideas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    <span>Install app</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Chrome className="h-3 w-3" />
                    <span>Browser extension</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Action CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button asChild size="lg" className="h-20 text-lg bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light shadow-lg hover:shadow-xl transition-all">
                <Link href="/gifts/new" className="flex items-center justify-center gap-3">
                  <Plus className="h-6 w-6" />
                  <span>Add Gift Idea</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 text-lg border-2 hover:bg-purple-50 transition-all">
                <Link href="/inspiration" className="flex items-center justify-center gap-3">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <span>Get AI Suggestions</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 text-lg border-2 hover:bg-blue-50 transition-all">
                <Link href="/recipients/new" className="flex items-center justify-center gap-3">
                  <Users className="h-6 w-6 text-giftstash-blue" />
                  <span>Add Recipient</span>
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/recipients'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recipients</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-giftstash-blue to-purple-600 bg-clip-text text-transparent">
                      {safeRecipients.length}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-giftstash-blue/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-giftstash-blue" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/gifts'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gift Ideas</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
                      {totalGifts}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-giftstash-orange/20 to-giftstash-blue/20 rounded-2xl flex items-center justify-center">
                    <Gift className="h-7 w-7 text-giftstash-orange" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <span>Manage gifts</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Coming Up</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-giftstash-green bg-clip-text text-transparent">
                      {upcomingEvents.length}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-green-600/20 to-giftstash-green/20 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-giftstash-green" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {upcomingEvents.length > 0 ? `Next: ${upcomingEvents[0].daysUntil} days` : 'Next 90 days'}
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-giftstash-green to-green-700 bg-clip-text text-transparent">
                      ${totalValue.toFixed(0)}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-giftstash-green/20 to-green-700/20 rounded-2xl flex items-center justify-center">
                    <DollarSign className="h-7 w-7 text-giftstash-green" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {giftsByStatus.purchased || 0} purchased
                </div>
              </Card>
            </div>

            {/* Main Content Grid - Three Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Upcoming Events (Birthdays + Holidays) */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-giftstash-green" />
                    <h3 className="text-lg font-bold">Coming Up</h3>
                  </div>
                  {upcomingEvents.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {upcomingEvents.length} events
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 4).map((event, idx) => (
                    <div
                      key={`${event.type}-${idx}`}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 bg-gradient-to-br ${event.type === 'holiday' ? event.color : 'from-giftstash-green to-giftstash-blue'} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                          {event.type === 'holiday' ? event.emoji : event.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {event.type === 'birthday' ? `${event.name}'s Birthday` : event.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {event.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: event.daysUntil > 365 ? 'numeric' : undefined
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-giftstash-blue">
                          {event.daysUntil === 0 ? '🎉' : event.daysUntil}
                        </span>
                        <p className="text-xs text-gray-600">
                          {event.daysUntil === 0 ? 'Today!' : 'days'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      No upcoming events in the next 90 days
                    </p>
                  )}
                </div>
                {upcomingEvents.length > 0 && (
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/recipients">View All Recipients</Link>
                  </Button>
                )}
              </Card>

              {/* Budget Overview */}
              <DashboardBudgetOverview recipients={safeRecipients} />

              {/* AI Gift Pick */}
              <AIGiftRecoOfTheDay />
            </div>

            {/* Gift Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Gift Progress</h2>
                <div className="space-y-4">
                  {['idea', 'purchased', 'wrapped', 'delivered'].map((status) => {
                    const count = giftsByStatus[status] || 0
                    const percentage = totalGifts > 0 ? (count / totalGifts) * 100 : 0
                    const colors = {
                      idea: 'from-blue-500 to-purple-500',
                      purchased: 'from-giftstash-orange to-yellow-500',
                      wrapped: 'from-green-500 to-giftstash-green',
                      delivered: 'from-purple-600 to-pink-600'
                    }

                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="capitalize font-medium text-gray-700">{status}</span>
                          <span className="text-sm font-bold text-gray-900">{count} gifts</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[status as keyof typeof colors]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {totalGifts === 0 && (
                  <p className="text-gray-500 text-center py-8">No gifts tracked yet</p>
                )}
                <Button asChild className="w-full mt-6" variant="outline">
                  <Link href="/gifts">Manage All Gifts</Link>
                </Button>
              </Card>

              {/* Achievements */}
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-bold">Achievements</h3>
                  <span className="ml-auto text-sm font-bold text-yellow-700">
                    {achievementCount}/4
                  </span>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 p-2 rounded ${achievements.giftMaster ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achievements.giftMaster ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      {achievements.giftMaster ? '🏆' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gift Master</p>
                      <p className="text-xs text-gray-600">Save 10+ gift ideas</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${achievements.budgetWizard ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achievements.budgetWizard ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      {achievements.budgetWizard ? '💰' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Budget Wizard</p>
                      <p className="text-xs text-gray-600">Set a budget</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${achievements.organized ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achievements.organized ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      {achievements.organized ? '📋' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Organized</p>
                      <p className="text-xs text-gray-600">Add 5+ recipients</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${achievements.earlyBird ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${achievements.earlyBird ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      {achievements.earlyBird ? '🐦' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Early Bird</p>
                      <p className="text-xs text-gray-600">Plan 7+ days ahead</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
        </div>
      </div>
    </>
  )
}
