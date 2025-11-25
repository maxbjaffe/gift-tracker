'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Plus, CheckCircle2, Circle, Calendar, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { OccasionSelector } from './OccasionSelector'

interface RecipientAssignment {
  id: string
  gift_id: string
  recipient_id: string
  status: string | null
  occasion: string | null
  occasion_date: string | null
  purchased_date: string | null
  recipients: {
    id: string
    name: string
    relationship: string | null
  }
}

interface AvailableRecipient {
  id: string
  name: string
  relationship: string | null
  isAssigned: boolean
}

interface GiftRecipientsManagerProps {
  giftId: string
  giftName: string
  onUpdate?: () => void
}

export function GiftRecipientsManager({ giftId, giftName, onUpdate }: GiftRecipientsManagerProps) {
  const [assignments, setAssignments] = useState<RecipientAssignment[]>([])
  const [availableRecipients, setAvailableRecipients] = useState<AvailableRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([])
  const [recipientOccasions, setRecipientOccasions] = useState<Record<string, { occasion: string | null; occasionDate: string | null }>>({})

  useEffect(() => {
    loadAssignments()
  }, [giftId])

  useEffect(() => {
    if (isAddDialogOpen) {
      loadAvailableRecipients()
    }
  }, [isAddDialogOpen])

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('gift_recipients')
        .select(`
          id,
          gift_id,
          recipient_id,
          status,
          occasion,
          occasion_date,
          purchased_date,
          recipients (
            id,
            name,
            relationship
          )
        `)
        .eq('gift_id', giftId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
      toast.error('Failed to load recipients')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableRecipients = async () => {
    try {
      const supabase = createClient()

      // Get all recipients
      const { data: allRecipients, error: recipientsError } = await supabase
        .from('recipients')
        .select('id, name, relationship')
        .order('name')

      if (recipientsError) throw recipientsError

      // Get currently assigned recipient IDs
      const assignedIds = new Set(assignments.map(a => a.recipient_id))

      const recipientsWithStatus = (allRecipients || []).map(r => ({
        ...r,
        isAssigned: assignedIds.has(r.id)
      }))

      setAvailableRecipients(recipientsWithStatus)
      setSelectedRecipientIds(Array.from(assignedIds))
    } catch (error) {
      console.error('Error loading available recipients:', error)
      toast.error('Failed to load recipients')
    }
  }

  const togglePurchased = async (assignmentId: string, currentStatus: string | null) => {
    setUpdating(assignmentId)
    try {
      const supabase = createClient()
      const newStatus = currentStatus === 'purchased' ? 'idea' : 'purchased'

      const { error } = await supabase
        .from('gift_recipients')
        .update({ status: newStatus })
        .eq('id', assignmentId)

      if (error) throw error

      const assignment = assignments.find(a => a.id === assignmentId)
      const recipientName = (assignment?.recipients as any)?.name || 'recipient'

      toast.success(
        newStatus === 'purchased'
          ? `Marked as purchased for ${recipientName}`
          : `Marked as idea for ${recipientName}`
      )

      await loadAssignments()
      onUpdate?.()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const toggleAllPurchased = async () => {
    const allPurchased = assignments.every(a => isPurchased(a.status))
    const newStatus = allPurchased ? 'idea' : 'purchased'

    setUpdating('bulk')
    try {
      const supabase = createClient()

      for (const assignment of assignments) {
        const { error } = await supabase
          .from('gift_recipients')
          .update({ status: newStatus })
          .eq('id', assignment.id)

        if (error) throw error
      }

      toast.success(
        newStatus === 'purchased'
          ? `Marked as purchased for all recipients`
          : `Marked as idea for all recipients`
      )

      await loadAssignments()
      onUpdate?.()
    } catch (error) {
      console.error('Error updating statuses:', error)
      toast.error('Failed to update statuses')
    } finally {
      setUpdating(null)
    }
  }

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipientIds(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  const handleOccasionChange = (recipientId: string, occasion: string | null, occasionDate: string | null) => {
    setRecipientOccasions(prev => ({
      ...prev,
      [recipientId]: { occasion, occasionDate }
    }))
  }

  const handleSaveRecipients = async () => {
    try {
      const supabase = createClient()

      // Get current assignments
      const currentIds = new Set(assignments.map(a => a.recipient_id))
      const newIds = new Set(selectedRecipientIds)

      // Determine what to add and remove
      const toAdd = selectedRecipientIds.filter(id => !currentIds.has(id))
      const toRemove = assignments
        .filter(a => !newIds.has(a.recipient_id))
        .map(a => a.id)

      // Add new assignments
      if (toAdd.length > 0) {
        const newAssignments = toAdd.map(recipientId => ({
          gift_id: giftId,
          recipient_id: recipientId,
          status: 'idea',
          occasion: recipientOccasions[recipientId]?.occasion || null,
          occasion_date: recipientOccasions[recipientId]?.occasionDate || null,
        }))

        const { error } = await supabase
          .from('gift_recipients')
          .insert(newAssignments)

        if (error) throw error
      }

      // Remove unselected assignments
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from('gift_recipients')
          .delete()
          .in('id', toRemove)

        if (error) throw error
      }

      toast.success('Recipient assignments updated')
      setIsAddDialogOpen(false)
      await loadAssignments()
      onUpdate?.()
    } catch (error) {
      console.error('Error saving recipients:', error)
      toast.error('Failed to save recipients')
    }
  }

  const isPurchased = (status: string | null) => {
    return status === 'purchased' || status === 'wrapped' || status === 'given'
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading recipients...</div>
        </CardContent>
      </Card>
    )
  }

  const purchasedCount = assignments.filter(a => isPurchased(a.status)).length
  const allPurchased = assignments.length > 0 && purchasedCount === assignments.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recipients ({assignments.length})
          </CardTitle>
          <div className="flex gap-2">
            {assignments.length > 0 && (
              <Button
                onClick={toggleAllPurchased}
                disabled={updating === 'bulk'}
                variant="outline"
                size="sm"
              >
                {allPurchased ? '☐ Mark All as Ideas' : '☑ Mark All Purchased'}
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Recipients
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Manage Recipients for {giftName}</DialogTitle>
                  <DialogDescription>
                    Select which recipients this gift is for
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {availableRecipients.map(recipient => (
                      <button
                        key={recipient.id}
                        onClick={() => toggleRecipient(recipient.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedRecipientIds.includes(recipient.id)
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRecipientIds.includes(recipient.id)}
                            className="h-5 w-5"
                          />
                          <div>
                            <p className="font-medium">{recipient.name}</p>
                            {recipient.relationship && (
                              <p className="text-sm text-gray-600">{recipient.relationship}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleSaveRecipients}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4">Not assigned to any recipients yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Recipients
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {assignments.map(assignment => {
                const purchased = isPurchased(assignment.status)
                const recipient = assignment.recipients as any

                return (
                  <div
                    key={assignment.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      purchased
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <Checkbox
                          checked={purchased}
                          onCheckedChange={() => togglePurchased(assignment.id, assignment.status)}
                          disabled={updating === assignment.id}
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="flex-1">
                        <Link
                          href={`/recipients/${assignment.recipient_id}`}
                          className="block"
                        >
                          <h4 className={`font-semibold hover:text-purple-600 transition-colors ${
                            purchased ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {recipient.name}
                          </h4>
                          {recipient.relationship && (
                            <p className="text-sm text-gray-600">{recipient.relationship}</p>
                          )}
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {assignment.occasion && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {assignment.occasion.replace('_', ' ')}
                            </Badge>
                          )}

                          <Badge
                            variant={purchased ? 'default' : 'outline'}
                            className={`text-xs ${
                              purchased
                                ? 'bg-green-600'
                                : 'text-blue-600 border-blue-300'
                            }`}
                          >
                            {purchased ? '✓ Purchased' : 'Idea'}
                          </Badge>
                        </div>

                        {(assignment.occasion_date || assignment.purchased_date) && (
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                            {assignment.occasion_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                For: {formatDate(assignment.occasion_date)}
                              </div>
                            )}
                            {assignment.purchased_date && (
                              <div className="flex items-center gap-1 text-green-700 font-medium">
                                <CheckCircle2 className="h-3 w-3" />
                                Purchased: {formatDate(assignment.purchased_date)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Purchase Status:</span>
                <span className="font-bold text-green-700">
                  {purchasedCount} of {assignments.length} purchased
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
