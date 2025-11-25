'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gift, Plus, DollarSign, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface AssignedGift {
  id: string
  gift_id: string
  recipient_id: string
  status: string | null
  occasion: string | null
  occasion_date: string | null
  purchased_date: string | null
  gift: {
    name: string
    current_price: number | null
    category: string | null
    status: string
  }
}

interface AssignedGiftsManagerProps {
  recipientId: string
  recipientName: string
  onUpdate?: () => void
}

export function AssignedGiftsManager({ recipientId, recipientName, onUpdate }: AssignedGiftsManagerProps) {
  const [assignedGifts, setAssignedGifts] = useState<AssignedGift[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadAssignedGifts()
  }, [recipientId])

  const loadAssignedGifts = async () => {
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
          gift:gifts (
            name,
            current_price,
            category,
            status
          )
        `)
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignedGifts(data || [])
    } catch (error) {
      console.error('Error loading assigned gifts:', error)
      toast.error('Failed to load gifts')
    } finally {
      setLoading(false)
    }
  }

  const togglePurchased = async (assignmentId: string, currentStatus: string | null) => {
    setUpdating(assignmentId)
    try {
      const supabase = createClient()

      // Toggle between 'idea' and 'purchased'
      const newStatus = currentStatus === 'purchased' ? 'idea' : 'purchased'

      const { error } = await supabase
        .from('gift_recipients')
        .update({
          status: newStatus,
          // purchased_date will be auto-set by trigger
        })
        .eq('id', assignmentId)

      if (error) throw error

      toast.success(
        newStatus === 'purchased'
          ? `Marked as purchased for ${recipientName}`
          : `Marked as idea for ${recipientName}`
      )

      // Reload to get updated data and trigger budget recalculation
      await loadAssignedGifts()
      onUpdate?.()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return `$${amount.toFixed(2)}`
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isPurchased = (status: string | null) => {
    return status === 'purchased' || status === 'wrapped' || status === 'given'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading gifts...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gifts for {recipientName} ({assignedGifts.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {assignedGifts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4">No gifts assigned yet</p>
            <p className="text-sm text-gray-600 mb-4">
              Use the "Assign Gifts" button above to add gifts for {recipientName}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="ideas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ideas">
                Ideas ({assignedGifts.filter(a => !isPurchased(a.status)).length})
              </TabsTrigger>
              <TabsTrigger value="purchased">
                Purchased ({assignedGifts.filter(a => isPurchased(a.status)).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ideas" className="mt-4">
              {assignedGifts.filter(a => !isPurchased(a.status)).length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No gift ideas yet</p>
                </div>
              ) : (
                <>
                  {/* Ideas Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-blue-600 font-medium">Total Ideas</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {assignedGifts.filter(a => !isPurchased(a.status)).length}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-600 font-medium">Potential Spending</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatCurrency(
                            assignedGifts
                              .filter(a => !isPurchased(a.status) && a.gift)
                              .reduce((sum, a) => sum + ((a.gift as any)?.current_price || 0), 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                  {assignedGifts
                    .filter(a => !isPurchased(a.status))
                    .map((assignment) => {
                      const gift = assignment.gift as any

                      // Skip if gift data is missing (deleted gift)
                      if (!gift || !gift.name) return null

                      return (
                        <div
                          key={assignment.id}
                          className="border rounded-lg p-3 transition-all border-gray-200 hover:border-purple-300 bg-white"
                        >
                          <div className="flex items-start gap-3">
                            {/* Purchase Checkbox */}
                            <div className="pt-1">
                              <Checkbox
                                checked={false}
                                onCheckedChange={() => togglePurchased(assignment.id, assignment.status)}
                                disabled={updating === assignment.id}
                                className="h-5 w-5"
                              />
                            </div>

                            {/* Gift Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/gifts/${assignment.gift_id}`}
                                  className="flex-1"
                                >
                                  <h4 className="font-semibold hover:text-purple-600 transition-colors text-gray-900">
                                    {gift.name}
                                  </h4>
                                </Link>

                                {gift.current_price && (
                                  <div className="flex items-center gap-1 text-green-700 font-bold">
                                    <DollarSign className="h-4 w-4" />
                                    {gift.current_price.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {gift.category && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {gift.category}
                                  </Badge>
                                )}

                                {assignment.occasion && (
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {assignment.occasion.replace('_', ' ')}
                                  </Badge>
                                )}

                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                                  Idea
                                </Badge>
                              </div>

                              {/* Dates */}
                              {assignment.occasion_date && (
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    For: {formatDate(assignment.occasion_date)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="purchased" className="mt-4">
              {assignedGifts.filter(a => isPurchased(a.status)).length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No purchased gifts yet</p>
                </div>
              ) : (
                <>
                  {/* Purchased Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-green-600 font-medium">Total Purchased</div>
                        <div className="text-2xl font-bold text-green-900">
                          {assignedGifts.filter(a => isPurchased(a.status)).length}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-600 font-medium">Total Spending</div>
                        <div className="text-2xl font-bold text-green-900">
                          {formatCurrency(
                            assignedGifts
                              .filter(a => isPurchased(a.status) && a.gift)
                              .reduce((sum, a) => sum + ((a.gift as any)?.current_price || 0), 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                  {assignedGifts
                    .filter(a => isPurchased(a.status))
                    .map((assignment) => {
                      const gift = assignment.gift as any

                      // Skip if gift data is missing (deleted gift)
                      if (!gift || !gift.name) return null

                      return (
                        <div
                          key={assignment.id}
                          className="border rounded-lg p-3 transition-all border-green-200 bg-green-50"
                        >
                          <div className="flex items-start gap-3">
                            {/* Purchase Checkbox */}
                            <div className="pt-1">
                              <Checkbox
                                checked={true}
                                onCheckedChange={() => togglePurchased(assignment.id, assignment.status)}
                                disabled={updating === assignment.id}
                                className="h-5 w-5"
                              />
                            </div>

                            {/* Gift Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/gifts/${assignment.gift_id}`}
                                  className="flex-1"
                                >
                                  <h4 className="font-semibold hover:text-purple-600 transition-colors text-green-900">
                                    {gift.name}
                                  </h4>
                                </Link>

                                {gift.current_price && (
                                  <div className="flex items-center gap-1 text-green-700 font-bold">
                                    <DollarSign className="h-4 w-4" />
                                    {gift.current_price.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {gift.category && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {gift.category}
                                  </Badge>
                                )}

                                {assignment.occasion && (
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {assignment.occasion.replace('_', ' ')}
                                  </Badge>
                                )}

                                <Badge variant="default" className="text-xs bg-green-600">
                                  ✓ Purchased
                                </Badge>
                              </div>

                              {/* Dates */}
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
                                      <Package className="h-3 w-3" />
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
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
