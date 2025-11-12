// src/lib/hooks/useRecipients.ts
'use client'

import { useState, useEffect } from 'react'
import { recipientService } from '@/services/recipients.service'
import type { Recipient, RecipientInsert, RecipientUpdate } from '@/types/database.types'
import { useToast } from '@/components/ui/use-toast'

export function useRecipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipients()
  }, [])

  async function fetchRecipients() {
    try {
      setLoading(true)
      setError(null)
      const data = await recipientService.getAll()
      setRecipients(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      toast({
        title: 'Error loading recipients',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function createRecipient(input: RecipientInsert) {
    try {
      const newRecipient = await recipientService.create(input)
      setRecipients(prev => [...prev, newRecipient])
      toast({
        title: 'Success!',
        description: 'Recipient created successfully',
      })
      return newRecipient
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error creating recipient',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function updateRecipient(id: string, input: RecipientUpdate) {
    try {
      const updated = await recipientService.update(id, input)
      setRecipients(prev => prev.map(r => (r.id === id ? updated : r)))
      toast({
        title: 'Success!',
        description: 'Recipient updated successfully',
      })
      return updated
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error updating recipient',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function deleteRecipient(id: string) {
    try {
      await recipientService.delete(id)
      setRecipients(prev => prev.filter(r => r.id !== id))
      toast({
        title: 'Success!',
        description: 'Recipient deleted successfully',
      })
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error deleting recipient',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  async function searchRecipients(query: string) {
    try {
      setLoading(true)
      const data = await recipientService.search(query)
      setRecipients(data)
    } catch (err) {
      const error = err as Error
      toast({
        title: 'Error searching recipients',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    recipients,
    loading,
    error,
    createRecipient,
    updateRecipient,
    deleteRecipient,
    searchRecipients,
    refetch: fetchRecipients,
  }
}