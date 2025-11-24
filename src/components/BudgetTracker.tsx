'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, DollarSign, Edit, Trash2, TrendingUp } from 'lucide-react'
import { recipientBudgetService } from '@/services/recipient-budgets.service'
import { BudgetModal } from './BudgetModal'
import type { RecipientBudget, Recipient } from '@/types/database.types'
import { toast } from 'sonner'

interface BudgetTrackerProps {
  recipient: Recipient
}

export function BudgetTracker({ recipient }: BudgetTrackerProps) {
  const [budgets, setBudgets] = useState<RecipientBudget[]>([])
  const [spending, setSpending] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<RecipientBudget | null>(null)

  useEffect(() => {
    loadBudgets()
  }, [recipient.id])

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const budgetData = await recipientBudgetService.getByRecipientId(recipient.id)
      setBudgets(budgetData)

      // Load spending for each budget
      const spendingData: Record<string, number> = {}
      for (const budget of budgetData) {
        try {
          const amount = await recipientBudgetService.calculateSpending(budget.id)
          spendingData[budget.id] = amount
        } catch (error) {
          console.error(`Error calculating spending for budget ${budget.id}:`, error)
          spendingData[budget.id] = 0
        }
      }
      setSpending(spendingData)
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      await recipientBudgetService.delete(budgetId)
      toast.success('Budget deleted successfully')
      loadBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
    }
  }

  const handleEdit = (budget: RecipientBudget) => {
    setSelectedBudget(budget)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedBudget(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedBudget(null)
  }

  const handleSave = () => {
    loadBudgets()
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isActiveBudget = (budget: RecipientBudget) => {
    const today = new Date()
    if (budget.start_date && new Date(budget.start_date) > today) return false
    if (budget.end_date && new Date(budget.end_date) < today) return false
    return true
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading budgets...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Budgets for {recipient.name}
            </CardTitle>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No budgets set for {recipient.name}</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const spent = spending[budget.id] || 0
                const percentage = budget.max_budget > 0 ? Math.min((spent / budget.max_budget) * 100, 100) : 0
                const remaining = Math.max(budget.max_budget - spent, 0)
                const isOver = spent > budget.max_budget
                const isActive = isActiveBudget(budget)

                return (
                  <Card key={budget.id} className={!isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{budget.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {budget.occasion_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {budget.occasion_type.replace('_', ' ')}
                                </Badge>
                              )}
                              {!isActive && (
                                <Badge variant="outline" className="text-xs text-gray-500">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(budget.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Date Range */}
                        {(budget.start_date || budget.end_date) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(budget.start_date) || 'No start'} - {formatDate(budget.end_date) || 'Ongoing'}
                            </span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              ${budget.max_budget.toFixed(2)} budget
                            </span>
                            <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-blue-600'}`}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={`h-2 ${isOver ? 'bg-red-200' : ''}`}
                          />
                        </div>

                        {/* Spending Details */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex gap-4">
                            <span className="text-gray-600">
                              Spent: <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-blue-600'}`}>
                                ${spent.toFixed(2)}
                              </span>
                            </span>
                            <span className="text-gray-600">
                              Remaining: <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                                ${remaining.toFixed(2)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {isOver && (
                          <div className="text-xs text-red-600 font-medium">
                            ⚠️ Over budget by ${(spent - budget.max_budget).toFixed(2)}
                          </div>
                        )}

                        {budget.notes && (
                          <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                            {budget.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        recipient={recipient}
        budget={selectedBudget}
        onSave={handleSave}
      />
    </>
  )
}
