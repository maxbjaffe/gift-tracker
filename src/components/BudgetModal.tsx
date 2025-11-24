'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Calendar } from 'lucide-react'
import { recipientBudgetService } from '@/services/recipient-budgets.service'
import type { RecipientBudget, Recipient } from '@/types/database.types'
import { toast } from 'sonner'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: Recipient
  budget?: RecipientBudget | null
  onSave: () => void
}

export function BudgetModal({ isOpen, onClose, recipient, budget, onSave }: BudgetModalProps) {
  const [name, setName] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [occasionType, setOccasionType] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load budget data if editing
  useEffect(() => {
    if (budget) {
      setName(budget.name)
      setMaxBudget(budget.max_budget.toString())
      setStartDate(budget.start_date || '')
      setEndDate(budget.end_date || '')
      setOccasionType(budget.occasion_type || '')
      setNotes(budget.notes || '')
    } else {
      // Reset form for new budget
      setName('')
      setMaxBudget('')
      setStartDate('')
      setEndDate('')
      setOccasionType('')
      setNotes('')
    }
  }, [budget, isOpen])

  const handleSave = async () => {
    if (!name || !maxBudget) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSaving(true)
    try {
      const budgetData = {
        recipient_id: recipient.id,
        name,
        max_budget: parseFloat(maxBudget),
        start_date: startDate || null,
        end_date: endDate || null,
        occasion_type: occasionType || null,
        notes: notes || null
      }

      if (budget) {
        // Update existing budget
        await recipientBudgetService.update(budget.id, budgetData)
        toast.success('Budget updated successfully')
      } else {
        // Create new budget
        const supabase = await import('@/lib/supabase/client').then(m => m.createClient())
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          toast.error('You must be logged in')
          return
        }

        await recipientBudgetService.create({
          ...budgetData,
          user_id: user.id
        })
        toast.success('Budget created successfully')
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error('Failed to save budget')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Edit Budget' : 'Create Budget'} for {recipient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Budget Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Budget Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Christmas 2024, Birthday 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Max Budget */}
          <div>
            <Label htmlFor="maxBudget" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Maximum Budget *
            </Label>
            <Input
              id="maxBudget"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Occasion Type */}
          <div>
            <Label className="text-sm font-medium">Occasion Type (optional)</Label>
            <Select value={occasionType} onValueChange={setOccasionType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select occasion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific occasion</SelectItem>
                <SelectItem value="birthday">🎂 Birthday</SelectItem>
                <SelectItem value="christmas">🎄 Christmas</SelectItem>
                <SelectItem value="hanukkah">🕎 Hanukkah</SelectItem>
                <SelectItem value="anniversary">💍 Anniversary</SelectItem>
                <SelectItem value="general">✨ General Spending</SelectItem>
                <SelectItem value="holiday">🎉 Holiday</SelectItem>
                <SelectItem value="other">🎁 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this budget..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
