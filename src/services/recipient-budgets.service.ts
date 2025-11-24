// src/services/recipient-budgets.service.ts
import { createClient } from '@/lib/supabase/client'
import type {
  RecipientBudget,
  RecipientBudgetInsert,
  RecipientBudgetUpdate
} from '@/types/database.types'

export class RecipientBudgetService {
  private getSupabase() {
    return createClient()
  }

  async getAll(): Promise<RecipientBudget[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipient_budgets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getByRecipientId(recipientId: string): Promise<RecipientBudget[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipient_budgets')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('start_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getActiveBudgets(recipientId?: string): Promise<RecipientBudget[]> {
    const supabase = this.getSupabase()
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('recipient_budgets')
      .select('*')
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)

    if (recipientId) {
      query = query.eq('recipient_id', recipientId)
    }

    const { data, error } = await query.order('start_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<RecipientBudget> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipient_budgets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Budget not found')
    return data
  }

  async create(input: RecipientBudgetInsert): Promise<RecipientBudget> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipient_budgets')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create budget')
    return data
  }

  async update(id: string, input: RecipientBudgetUpdate): Promise<RecipientBudget> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipient_budgets')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to update budget')
    return data
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('recipient_budgets')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Calculate spending for a budget
  async calculateSpending(budgetId: string): Promise<number> {
    const budget = await this.getById(budgetId)
    const supabase = this.getSupabase()

    // Get all gifts for this recipient that are purchased
    const { data: giftRecipients, error } = await supabase
      .from('gift_recipients')
      .select(`
        status,
        occasion_date,
        purchased_date,
        gifts (
          current_price
        )
      `)
      .eq('recipient_id', budget.recipient_id)
      .in('status', ['purchased', 'wrapped', 'given'])

    if (error) throw error
    if (!giftRecipients) return 0

    // Filter by date range if specified
    const spending = giftRecipients
      .filter((gr: any) => {
        if (!budget.start_date && !budget.end_date) return true

        // Use purchased_date if available, otherwise fall back to occasion_date
        const dateToCheck = gr.purchased_date || gr.occasion_date
        if (!dateToCheck) return false

        const checkDate = new Date(dateToCheck)
        if (budget.start_date && checkDate < new Date(budget.start_date)) return false
        if (budget.end_date && checkDate > new Date(budget.end_date)) return false

        return true
      })
      .reduce((sum: number, gr: any) => {
        return sum + (gr.gifts?.current_price || 0)
      }, 0)

    return spending
  }
}

export const recipientBudgetService = new RecipientBudgetService()
