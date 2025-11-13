'use client'

import { useMemo } from 'react'
import { useGifts } from '@/lib/hooks/useGifts'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export default function AnalyticsPage() {
  const { gifts, loading: giftsLoading } = useGifts()
  const { recipients, loading: recipientsLoading } = useRecipients()

  const loading = giftsLoading || recipientsLoading

  // Calculate analytics data
  const analytics = useMemo(() => {
    // Overall stats
    const totalSpent = gifts.reduce((sum, g) => sum + (g.current_price || 0), 0)
    const averageGiftPrice = gifts.length > 0 ? totalSpent / gifts.length : 0
    const mostExpensiveGift = gifts.reduce((max, g) =>
      (g.current_price || 0) > (max.current_price || 0) ? g : max
    , gifts[0])

    // Spending by category
    const categoryData = gifts.reduce((acc, gift) => {
      const category = gift.category || 'other'
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 }
      }
      acc[category].value += gift.current_price || 0
      acc[category].count += 1
      return acc
    }, {} as Record<string, { name: string; value: number; count: number }>)

    const categoryChartData = Object.values(categoryData)

    // Spending by status
    const statusData = gifts.reduce((acc, gift) => {
      const status = gift.status
      if (!acc[status]) {
        acc[status] = { name: status, amount: 0, count: 0 }
      }
      acc[status].amount += gift.current_price || 0
      acc[status].count += 1
      return acc
    }, {} as Record<string, { name: string; amount: number; count: number }>)

    const statusChartData = Object.values(statusData)

    // Monthly spending trend
    const monthlyData = gifts.reduce((acc, gift) => {
      const date = gift.purchase_date || gift.created_at
      const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 }
      }
      acc[month].amount += gift.current_price || 0
      acc[month].count += 1
      return acc
    }, {} as Record<string, { month: string; amount: number; count: number }>)

    const monthlyChartData = Object.values(monthlyData).slice(-12) // Last 12 months

    // Top 5 most expensive gifts
    const topGifts = [...gifts]
      .filter(g => g.current_price)
      .sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
      .slice(0, 5)

    return {
      totalSpent,
      averageGiftPrice,
      mostExpensiveGift,
      categoryChartData,
      statusChartData,
      monthlyChartData,
      topGifts,
    }
  }, [gifts, recipients])

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <LoadingSpinner type="card" count={4} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Analytics & Insights</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          Deep dive into your gift-giving patterns and spending trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <Card className="p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600">
                ${analytics.totalSpent.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Average Gift</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                ${analytics.averageGiftPrice.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Total Gifts</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{gifts.length}</p>
            </div>
            <Package className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Recipients</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600">{recipients.length}</p>
            </div>
            <Users className="h-8 w-8 md:h-10 md:w-10 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="category" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="category" className="text-xs md:text-sm h-11 md:h-12">Category</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs md:text-sm h-11 md:h-12">Trends</TabsTrigger>
          <TabsTrigger value="status" className="text-xs md:text-sm h-11 md:h-12">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="p-4 md:p-5 lg:p-6">
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <PieChart>
                  <Pie
                    data={analytics.categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={window.innerWidth < 768 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4 md:p-5 lg:p-6">
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Category Details</h3>
              <div className="space-y-2 md:space-y-3">
                {analytics.categoryChartData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-sm md:text-base capitalize font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm md:text-base font-bold">${cat.value.toFixed(2)}</div>
                      <div className="text-xs md:text-sm text-gray-500">{cat.count} gifts</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="p-4 md:p-5 lg:p-6">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Monthly Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
              <LineChart data={analytics.monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                <YAxis tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'amount') return `$${value.toFixed(2)}`
                    return value
                  }}
                />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 768 ? '12px' : '14px' }} />
                <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} name="Amount" />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} name="Gifts" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card className="p-4 md:p-5 lg:p-6">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Spending by Status</h3>
            <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
              <BarChart data={analytics.statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                <YAxis tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 768 ? '12px' : '14px' }} />
                <Bar dataKey="amount" fill="#8b5cf6" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Expensive Gifts */}
      <Card className="p-4 md:p-5 lg:p-6 mt-4 md:mt-6">
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Most Expensive Gifts</h3>
        <div className="space-y-2 md:space-y-3">
          {analytics.topGifts.map((gift, idx) => (
            <div key={gift.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <span className="text-xl md:text-2xl font-bold text-gray-400">#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold truncate">{gift.name}</p>
                  {gift.category && (
                    <p className="text-xs md:text-sm text-gray-600 capitalize">{gift.category}</p>
                  )}
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <p className="text-xl md:text-2xl font-bold text-purple-600">
                  ${gift.current_price?.toFixed(2)}
                </p>
                {gift.store && (
                  <p className="text-xs md:text-sm text-gray-500">{gift.store}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
