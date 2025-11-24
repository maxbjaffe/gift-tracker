'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { recipientBudgetService } from '@/services/recipient-budgets.service'
import type { RecipientBudget, Recipient } from '@/types/database.types'

interface DashboardBudgetOverviewProps {
  recipients: Recipient[]
}

interface BudgetWithSpending extends RecipientBudget {
  spending: number
  recipientName: string
}

export function DashboardBudgetOverview({ recipients }: DashboardBudgetOverviewProps) {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveBudgets()
  }, [recipients])

  const loadActiveBudgets = async () => {
    setLoading(true)
    try {
      // Get all active budgets
      const allBudgets = await recipientBudgetService.getActiveBudgets()

      // Calculate spending for each budget and add recipient name
      const budgetsWithSpending = await Promise.all(
        allBudgets.map(async (budget) => {
          const spending = await recipientBudgetService.calculateSpending(budget.id)
          const recipient = recipients.find(r => r.id === budget.recipient_id)
          return {
            ...budget,
            spending,
            recipientName: recipient?.name || 'Unknown'
          }
        })
      )

      // Sort by percentage (highest first) and limit to 4
      budgetsWithSpending.sort((a, b) => {
        const percentA = a.max_budget > 0 ? (a.spending / a.max_budget) : 0
        const percentB = b.max_budget > 0 ? (b.spending / b.max_budget) : 0
        return percentB - percentA
      })

      setBudgets(budgetsWithSpending.slice(0, 4))
    } catch (error) {
      console.error('Error loading active budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Loading budgets...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Active Budgets</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/analytics">View Analytics</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No active budgets set</p>
            <Button asChild variant="outline">
              <Link href="/recipients">Set Up Budgets</Link>
            </Button>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = budget.max_budget > 0
              ? Math.min((budget.spending / budget.max_budget) * 100, 100)
              : 0
            const isOverBudget = budget.spending > budget.max_budget

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">{budget.recipientName}</span>
                    {budget.name !== budget.recipientName && (
                      <span className="text-sm text-gray-500 ml-2">• {budget.name}</span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    ${budget.spending.toFixed(0)} / ${budget.max_budget.toFixed(0)}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : percentage > 80
                          ? 'bg-gradient-to-r from-giftstash-orange to-yellow-500'
                          : 'bg-gradient-to-r from-giftstash-green to-green-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {budgets.length > 0 && (
        <Button asChild variant="outline" className="w-full mt-4">
          <Link href="/recipients">Manage Budgets</Link>
        </Button>
      )}
    </Card>
  )
}
