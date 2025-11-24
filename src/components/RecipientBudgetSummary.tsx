'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign } from 'lucide-react'
import { recipientBudgetService } from '@/services/recipient-budgets.service'
import type { RecipientBudget } from '@/types/database.types'

interface RecipientBudgetSummaryProps {
  recipientId: string
}

export function RecipientBudgetSummary({ recipientId }: RecipientBudgetSummaryProps) {
  const [budgets, setBudgets] = useState<RecipientBudget[]>([])
  const [totalSpending, setTotalSpending] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBudgetSummary()
  }, [recipientId])

  const loadBudgetSummary = async () => {
    try {
      // Get active budgets for this recipient
      const activeBudgets = await recipientBudgetService.getActiveBudgets(recipientId)
      setBudgets(activeBudgets)

      if (activeBudgets.length === 0) {
        setLoading(false)
        return
      }

      // Calculate total spending and budget
      let spending = 0
      let budget = 0

      for (const b of activeBudgets) {
        const spent = await recipientBudgetService.calculateSpending(b.id)
        spending += spent
        budget += b.max_budget
      }

      setTotalSpending(spending)
      setTotalBudget(budget)
    } catch (error) {
      console.error('Error loading budget summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || budgets.length === 0) {
    return null
  }

  const percentage = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0
  const isOverBudget = totalSpending > totalBudget

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-giftstash-blue" />
        <span className="text-xs font-medium text-gray-700">
          {budgets.length} Active Budget{budgets.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Spent</span>
          <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            ${totalSpending.toFixed(0)} / ${totalBudget.toFixed(0)}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isOverBudget
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : percentage > 80
                  ? 'bg-gradient-to-r from-giftstash-orange to-yellow-500'
                  : 'bg-gradient-to-r from-giftstash-green to-green-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
