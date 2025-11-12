'use client'

import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function GiftsPage() {
  const { gifts, loading } = useGifts()

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <LoadingSpinner type="card" count={6} />
      </div>
    )
  }

  if (gifts.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <EmptyState
          icon="🎁"
          title="No gifts yet"
          description="Start tracking gift ideas for your loved ones"
          actionLabel="Add Your First Gift"
          actionHref="/gifts/new"
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gifts</h1>
          <p className="text-gray-600 mt-2">
            Track and manage gift ideas for everyone
          </p>
        </div>
        <Button asChild>
          <Link href="/gifts/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Gift
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts.map((gift) => (
          <Card key={gift.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">{gift.name}</h3>
              <StatusBadge status={gift.status} />
            </div>

            {gift.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">
                {gift.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              {gift.current_price && (
                <span className="text-2xl font-bold text-green-600">
                  ${gift.current_price.toFixed(2)}
                </span>
              )}
              {gift.store && (
                <span className="text-sm text-gray-500">{gift.store}</span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/gifts/${gift.id}`}>View Details</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}