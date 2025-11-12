// src/services/recipients.service.ts
import { createClient } from '@/lib/supabase/client'
import type { 
  Recipient, 
  RecipientInsert, 
  RecipientUpdate,
  RecipientWithGifts 
} from '@/types/database.types'

export class RecipientService {
  private getSupabase() {
    return createClient()
  }

  async getAll(): Promise<Recipient[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Recipient> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Recipient not found')
    return data
  }

  async getByIdWithGifts(id: string): Promise<RecipientWithGifts> {
    const recipient = await this.getById(id)
    const supabase = this.getSupabase()

    const { data: giftLinks, error: linkError } = await supabase
      .from('gift_recipients')
      .select(`
        gift_id,
        gifts (*)
      `)
      .eq('recipient_id', id)
    
    if (linkError) throw linkError

    const gifts = giftLinks?.map((link: any) => link.gifts).filter(Boolean) || []

    return {
      ...recipient,
      gifts,
      gift_count: gifts.length
    }
  }

  async create(input: RecipientInsert): Promise<Recipient> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .insert(input)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to create recipient')
    return data
  }

  async update(id: string, input: RecipientUpdate): Promise<Recipient> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to update recipient')
    return data
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getSupabase()
    const { error } = await supabase
      .from('recipients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async search(query: string): Promise<Recipient[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async filterByRelationship(relationship: string): Promise<Recipient[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('relationship', relationship)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async getUpcomingBirthdays(daysAhead: number = 30): Promise<Recipient[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .not('birthday', 'is', null)
      .order('birthday', { ascending: true })
    
    if (error) throw error
    if (!data) return []

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    return data.filter(recipient => {
      if (!recipient.birthday) return false
      
      const birthday = new Date(recipient.birthday)
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      )
      
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      
      return thisYearBirthday >= today && thisYearBirthday <= futureDate
    })
  }

  async getCount(): Promise<number> {
    const supabase = this.getSupabase()
    const { count, error } = await supabase
      .from('recipients')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }
}

export const recipientService = new RecipientService()