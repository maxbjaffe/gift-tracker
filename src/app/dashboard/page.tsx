'use client'

import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { GiftStashNav } from '@/components/GiftStashNav'
import { DashboardWelcomeSection } from '@/components/DashboardWelcomeSection'
import { DashboardBudgetOverview } from '@/components/DashboardBudgetOverview'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Gift, Calendar, DollarSign, Sparkles, TrendingUp, Award, Zap, Plus, ArrowRight, Heart } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function DashboardPage() {
  const { recipients, loading: recipientsLoading } = useRecipients()
  const { gifts, loading: giftsLoading } = useGifts()
  const [selectedRecipientForAI, setSelectedRecipientForAI] = useState<string | null>(null)

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

  // Calculate stats using per-recipient status
  const totalGifts = gifts.length

  // Count gift-recipient pairs by status
  const giftRecipientPairs = gifts.flatMap(gift =>
    (gift.recipients || []).map(recipient => ({
      gift,
      recipient,
      status: recipient.status || gift.status || 'idea' // Fallback to gift status if recipient status not set
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

  // Get upcoming birthdays (next 30 days)
  const upcomingBirthdays = recipients
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

      return { ...r, daysUntil, date: thisYearBirthday }
    })
    .filter((r) => r.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  // Calculate achievements
  const achievements = {
    giftMaster: totalGifts >= 10,
    budgetWizard: recipients.some(r => r.max_budget && r.max_budget > 0),
    earlyBird: upcomingBirthdays.length > 0 && upcomingBirthdays[0].daysUntil > 7,
    organized: recipients.length >= 5
  }

  const achievementCount = Object.values(achievements).filter(Boolean).length

  // Get trending/most popular gift categories or tags
  const allGiftNames = gifts.map(g => g.name.toLowerCase())
  const trendingKeywords = ['tech', 'book', 'game', 'watch', 'jewelry']
    .map(keyword => ({
      keyword,
      count: allGiftNames.filter(name => name.includes(keyword)).length
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Empty state
  const isEmpty = recipients.length === 0 && gifts.length === 0

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">

        {/* Hero Section with Greeting */}
        <div className="mb-8 relative overflow-hidden">
          <Card className="p-8 bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white border-none shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src="/images/GiftStashIconGSv2.png"
                    alt="GiftStash"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Welcome to GiftStash!
                  </h1>
                </div>
                <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                  {isEmpty
                    ? "Let's start building your perfect gift collection"
                    : `You have ${totalGifts} gift idea${totalGifts !== 1 ? 's' : ''} for ${recipients.length} special ${recipients.length !== 1 ? 'people' : 'person'}. Keep it up!`
                  }
                </p>
              </div>
              {!isEmpty && (
                <div className="flex flex-col items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <Award className="h-10 w-10 text-yellow-300" />
                  <div className="text-center">
                    <p className="text-2xl font-bold">{achievementCount}/4</p>
                    <p className="text-sm opacity-90">Achievements</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Welcome Section with Quick Actions and Resources */}
        <DashboardWelcomeSection />

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
            {/* Quick Action CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/recipients'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recipients</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-giftstash-blue to-purple-600 bg-clip-text text-transparent">
                      {recipients.length}
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
                      {upcomingBirthdays.length}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-green-600/20 to-giftstash-green/20 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-giftstash-green" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {upcomingBirthdays.length > 0 ? `Next: ${upcomingBirthdays[0].daysUntil} days` : 'Next 30 days'}
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* AI Gift Recommendations - Featured */}
              <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">AI Gift Recommendations</h2>
                      <p className="text-sm text-gray-600">Personalized suggestions for your loved ones</p>
                    </div>
                  </div>
                </div>

                {recipients.length > 0 ? (
                  <div className="space-y-4">
                    {/* Recipient Selector */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Pick a recipient for AI-powered gift ideas:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {recipients.slice(0, 6).map((recipient) => (
                          <button
                            key={recipient.id}
                            onClick={() => setSelectedRecipientForAI(
                              selectedRecipientForAI === recipient.id ? null : recipient.id
                            )}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedRecipientForAI === recipient.id
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                                : 'bg-white border-2 border-gray-200 hover:border-purple-400 text-gray-700'
                            }`}
                          >
                            {recipient.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations Display */}
                    {selectedRecipientForAI ? (
                      <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Zap className="h-5 w-5 text-purple-600" />
                          <h3 className="font-bold text-lg">
                            Top Picks for {recipients.find(r => r.id === selectedRecipientForAI)?.name}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {/* Sample AI recommendations - in production, these would come from actual AI */}
                          {[
                            { name: 'Personalized Photo Album', reason: 'Based on their love for memories', confidence: 95 },
                            { name: 'Wireless Earbuds', reason: 'Popular gift for their age group', confidence: 88 },
                            { name: 'Cozy Throw Blanket', reason: 'Perfect for the upcoming season', confidence: 82 }
                          ].map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Heart className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{suggestion.name}</p>
                                <p className="text-sm text-gray-600">{suggestion.reason}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                                      style={{ width: `${suggestion.confidence}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-purple-600">{suggestion.confidence}%</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="flex-shrink-0">
                                Save
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button asChild className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                          <Link href="/inspiration">
                            See More AI Suggestions
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-purple-300">
                        <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                        <p className="text-gray-600">Select a recipient above to get AI-powered gift recommendations</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Add recipients to get personalized AI gift suggestions</p>
                    <Button asChild>
                      <Link href="/recipients/new">Add Recipient</Link>
                    </Button>
                  </div>
                )}
              </Card>

              {/* Trending & Upcoming */}
              <div className="space-y-6">
                {/* Trending Insights */}
                {trendingKeywords.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-giftstash-orange" />
                      <h3 className="text-lg font-bold">Your Trends</h3>
                    </div>
                    <div className="space-y-3">
                      {trendingKeywords.map((trend, idx) => (
                        <div key={trend.keyword} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-giftstash-orange">#{idx + 1}</span>
                            <span className="font-medium capitalize">{trend.keyword}</span>
                          </div>
                          <span className="px-3 py-1 bg-orange-100 text-giftstash-orange rounded-full text-sm font-semibold">
                            {trend.count} {trend.count === 1 ? 'gift' : 'gifts'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Upcoming Birthdays */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-giftstash-green" />
                      <h3 className="text-lg font-bold">Coming Up</h3>
                    </div>
                    {upcomingBirthdays.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {upcomingBirthdays.length} soon
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {upcomingBirthdays.slice(0, 4).map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-giftstash-green to-giftstash-blue rounded-full flex items-center justify-center text-white font-bold">
                            {recipient.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{recipient.name}</p>
                            <p className="text-sm text-gray-600">
                              {recipient.date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-giftstash-blue">
                            {recipient.daysUntil === 0 ? '🎉' : recipient.daysUntil}
                          </span>
                          <p className="text-xs text-gray-600">
                            {recipient.daysUntil === 0 ? 'Today!' : 'days'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {upcomingBirthdays.length === 0 && (
                      <p className="text-gray-500 text-center py-8 text-sm">
                        No upcoming birthdays in the next 30 days
                      </p>
                    )}
                  </div>
                  {upcomingBirthdays.length > 0 && (
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/recipients">View All Recipients</Link>
                    </Button>
                  )}
                </Card>

                {/* Achievements */}
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-bold">Achievements</h3>
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
                  </div>
                </Card>
              </div>
            </div>

            {/* Gift Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <DashboardBudgetOverview recipients={recipients} />
            </div>
          </>
        )}
        </div>
      </div>
    </>
  )
}
