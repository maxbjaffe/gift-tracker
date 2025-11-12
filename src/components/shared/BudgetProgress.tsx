'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BudgetProgressProps {
  recipientName: string
  budget: number
  spent: number
}

export function BudgetProgress({ recipientName, budget, spent }: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const remaining = Math.max(budget - spent, 0)
  const isOverBudget = spent > budget

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900">{recipientName}</span>
        <span className="text-sm text-gray-600">
          Budget: ${budget.toFixed(2)}
        </span>
      </div>

      <Progress
        value={percentage}
        className={`h-2 mb-2 ${isOverBudget ? 'bg-red-200' : ''}`}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-600">
            Spent: <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
              ${spent.toFixed(2)}
            </span>
          </span>
          <span className="text-gray-600">
            Remaining: <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${remaining.toFixed(2)}
            </span>
          </span>
        </div>
        <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {isOverBudget && (
        <div className="mt-2 text-xs text-red-600 font-medium">
          ⚠️ Over budget by ${(spent - budget).toFixed(2)}
        </div>
      )}
    </Card>
  )
}
