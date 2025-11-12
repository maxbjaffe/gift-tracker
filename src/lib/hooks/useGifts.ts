// src/lib/hooks/useGifts.ts
'use client'

import { useState, useEffect } from 'react'
import { giftService } from '@/services/gifts.service'
import type { Gift, GiftInsert, GiftUpdate } from '@/types/database.types'
import { useToast } from '@/components/ui/use-toast'

export function useGifts(recipientId?: string) {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchGifts()
  }, [recipientId])

  async function fetchGifts() {
    try {
      setLoading(true)
      setError(null)
      const data = recipientId
        ? await giftService.getByRecipientId(recipientId)
        : await giftService.getAll()
      setGifts(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error loading gifts',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function createGift(input: GiftInsert) {
    try {
      const newGift = await giftService.create(input)
      setGifts(prev => [newGift, ...prev])
      toast({
        title: 'Success!',
        description: 'Gift created successfully',
      })
      return newGift
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error creating gift',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function updateGift(id: string, input: GiftUpdate) {
    try {
      const updated = await giftService.update(id, input)
      setGifts(prev => prev.map(g => (g.id === id ? updated : g)))
      toast({
        title: 'Success!',
        description: 'Gift updated successfully',
      })
      return updated
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error updating gift',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function deleteGift(id: string) {
    try {
      await giftService.delete(id)
      setGifts(prev => prev.filter(g => g.id !== id))
      toast({
        title: 'Success!',
        description: 'Gift deleted successfully',
      })
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error deleting gift',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function assignToRecipient(giftId: string, recipientId: string) {
    try {
      await giftService.assignToRecipient(giftId, recipientId)
      toast({
        title: 'Success!',
        description: 'Gift assigned to recipient',
      })
      await fetchGifts()
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error assigning gift',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function searchGifts(query: string) {
    try {
      setLoading(true)
      const data = await giftService.search(query)
      setGifts(data)
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error searching gifts',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    gifts,
    loading,
    error,
    createGift,
    updateGift,
    deleteGift,
    assignToRecipient,
    searchGifts,
    refetch: fetchGifts,
  }
}