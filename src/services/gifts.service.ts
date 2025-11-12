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

  async getAll(): Promise<Gift[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
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