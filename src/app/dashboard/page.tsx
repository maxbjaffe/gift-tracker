'use client'

import { useRecipients } from '@/lib/hooks/useRecipients'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Gift, Calendar, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const { recipients, loading: recipientsLoading } = useRecipients()
  const { gifts, loading: giftsLoading } = useGifts()

  const loading = recipientsLoading || giftsLoading

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <LoadingSpinner type="card" count={4} />
      </div>
    )
  }

  // Calculate stats
  const totalGifts = gifts.length
  const giftsByStatus = gifts.reduce((acc, gift) => {
    acc[gift.status] = (acc[gift.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalValue = gifts.reduce((sum, gift) => {
    return sum + (gift.current_price || 0)
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

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your gift tracking overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recipients</p>
              <p className="text-3xl font-bold mt-2">{recipients.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gift Ideas</p>
              <p className="text-3xl font-bold mt-2">{totalGifts}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Birthdays</p>
              <p className="text-3xl font-bold mt-2">{upcomingBirthdays.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-3xl font-bold mt-2">${totalValue.toFixed(0)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gift Status Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Gift Status</h2>
          <div className="space-y-3">
            {Object.entries(giftsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {totalGifts === 0 && (
              <p className="text-gray-500 text-center py-4">No gifts tracked yet</p>
            )}
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/gifts">View All Gifts</Link>
          </Button>
        </Card>

        {/* Upcoming Birthdays */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Birthdays</h2>
          <div className="space-y-3">
            {upcomingBirthdays.slice(0, 5).map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{recipient.name}</p>
                  <p className="text-sm text-gray-600">
                    {recipient.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {recipient.daysUntil === 0
                    ? 'Today!'
                    : `${recipient.daysUntil} days`}
                </span>
              </div>
            ))}
            {upcomingBirthdays.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No upcoming birthdays in the next 30 days
              </p>
            )}
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/recipients">View All Recipients</Link>
          </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-16">
            <Link href="/recipients/new">
              <Users className="h-5 w-5 mr-2" />
              Add Recipient
            </Link>
          </Button>
          <Button asChild className="h-16" variant="outline">
            <Link href="/gifts/new">
              <Gift className="h-5 w-5 mr-2" />
              Add Gift Idea
            </Link>
          </Button>
          <Button asChild className="h-16" variant="outline">
            <Link href="/recommendations">
              <Gift className="h-5 w-5 mr-2" />
              Get AI Recommendations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}