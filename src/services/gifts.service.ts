// src/services/gifts.service.ts
import { createClient } from '@/lib/supabase/client'
import type { 
  Gift, 
  GiftInsert, 
  GiftUpdate,
  GiftWithRecipients 
} from '@/types/database.types'

export class GiftService {
  private getSupabase() {
    return createClient()
  }

  async getAll(): Promise<GiftWithRecipients[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .select(`
        *,
        gift_recipients (
          id,
          recipient_id,
          status,
          notes,
          occasion,
          occasion_date,
          claimed_by_name,
          claimed_by_email,
          claimed_at,
          recipients (
            id,
            name,
            avatar_type,
            avatar_data,
            avatar_background
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform the data to match GiftWithRecipients type
    return (data || []).map((gift: any) => ({
      ...gift,
      recipients: gift.gift_recipients?.map((gr: any) => ({
        ...gr.recipients,
        status: gr.status, // Per-recipient status from junction table
        gift_recipient_id: gr.id, // ID of the gift_recipients record
        notes: gr.notes, // Per-recipient notes from junction table
        occasion: gr.occasion, // Per-recipient occasion from junction table
        occasion_date: gr.occasion_date, // Per-recipient occasion date from junction table
        claimed_by_name: gr.claimed_by_name, // Name of person who claimed
        claimed_by_email: gr.claimed_by_email, // Email of person who claimed
        claimed_at: gr.claimed_at // When the gift was claimed
      })).filter(Boolean) || [],
      recipient_count: gift.gift_recipients?.length || 0,
      gift_recipients: undefined // Remove the junction table data
    }))
  }

  async getById(id: string): Promise<Gift> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Gift not found')
    return data
  }

  async getByIdWithRecipients(id: string): Promise<GiftWithRecipients> {
    const gift = await this.getById(id)
    const supabase = this.getSupabase()

    const { data: recipientLinks, error: linkError } = await supabase
      .from('gift_recipients')
      .select(`
        recipient_id,
        recipients (*)
      `)
      .eq('gift_id', id)
    
    if (linkError) throw linkError

    const recipients = recipientLinks?.map((link: any) => link.recipients).filter(Boolean) || []

    return {
      ...gift,
      recipients,
      recipient_count: recipients.length
    }
  }

  async getByRecipientId(recipientId: string): Promise<Gift[]> {
    const supabase = this.getSupabase()
    const { data: links, error: linkError } = await supabase
      .from('gift_recipients')
      .select('gift_id')
      .eq('recipient_id', recipientId)
    
    if (linkError) throw linkError
    if (!links || links.length === 0) return []

    const giftIds = links.map(link => link.gift_id)

    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .in('id', giftIds)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async create(input: GiftInsert): Promise<Gift> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .insert(input)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to create gift')
    return data
  }

  async update(id: string, input: GiftUpdate): Promise<Gift> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to update gift')
    return data
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async assignToRecipient(giftId: string, recipientId: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gift_recipients')
      .insert({
        gift_id: giftId,
        recipient_id: recipientId
      })
    
    if (error) throw error
  }

  async unassignFromRecipient(giftId: string, recipientId: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gift_recipients')
      .delete()
      .eq('gift_id', giftId)
      .eq('recipient_id', recipientId)
    
    if (error) throw error
  }

  async assignToMultipleRecipients(giftId: string, recipientIds: string[]): Promise<void> {
    const supabase = this.getSupabase()
    const links = recipientIds.map(recipientId => ({
      gift_id: giftId,
      recipient_id: recipientId
    }))

    const { error } = await supabase
      .from('gift_recipients')
      .insert(links)

    if (error) throw error
  }

  async updateRecipientStatus(giftRecipientId: string, status: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gift_recipients')
      .update({ status })
      .eq('id', giftRecipientId)

    if (error) throw error
  }

  async updateRecipientStatusByIds(giftId: string, recipientId: string, status: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gift_recipients')
      .update({ status })
      .eq('gift_id', giftId)
      .eq('recipient_id', recipientId)

    if (error) throw error
  }

  async updateRecipientOccasion(
    giftId: string,
    recipientId: string,
    occasion: string | null,
    occasionDate: string | null
  ): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gift_recipients')
      .update({
        occasion,
        occasion_date: occasionDate
      })
      .eq('gift_id', giftId)
      .eq('recipient_id', recipientId)

    if (error) throw error
  }

  async assignToRecipientWithOccasion(
    giftId: string,
    recipientId: string,
    occasion?: string,
    occasionDate?: string
  ): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('gift_recipients')
      .insert({
        gift_id: giftId,
        recipient_id: recipientId,
        occasion: occasion || null,
        occasion_date: occasionDate || null
      })

    if (error) throw error
  }

  async filterByStatus(status: string): Promise<Gift[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async search(query: string): Promise<Gift[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async getStatistics() {
    const supabase = this.getSupabase()
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('*')
    
    if (error) throw error
    if (!gifts) return {
      total: 0,
      byStatus: {},
      totalValue: 0,
      averagePrice: 0
    }

    const byStatus = gifts.reduce((acc, gift) => {
      acc[gift.status] = (acc[gift.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalValue = gifts.reduce((sum, gift) => {
      return sum + (gift.current_price || 0)
    }, 0)

    return {
      total: gifts.length,
      byStatus,
      totalValue,
      averagePrice: gifts.length > 0 ? totalValue / gifts.length : 0
    }
  }

  async getCount(): Promise<number> {
    const supabase = this.getSupabase()
    const { count, error } = await supabase
      .from('gifts')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }
}

export const giftService = new GiftService()