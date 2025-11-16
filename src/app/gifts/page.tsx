'use client'

import { useState, useMemo } from 'react'
import { useGifts } from '@/lib/hooks/useGifts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterDropdown } from '@/components/shared/FilterDropdown'
import { ExportButtons } from '@/components/shared/ExportButtons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Link from 'next/link'
import { Plus, ExternalLink, Lightbulb, ShoppingCart } from 'lucide-react'
import { GIFT_STATUSES, GIFT_CATEGORIES } from '@/Types/database.types'
import Avatar from '@/components/Avatar'

export default function GiftsPage() {
  const { gifts, loading } = useGifts()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'all' | 'ideas' | 'confirmed'>('all')

  // Filter gifts based on filters and view mode
  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      // Category filter
      if (categoryFilter !== 'all' && gift.category !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && gift.status !== statusFilter) {
        return false
      }

      // View mode filter
      if (viewMode === 'ideas' && gift.status !== 'idea') {
        return false
      }
      if (viewMode === 'confirmed' && gift.status === 'idea') {
        return false
      }

      return true
    })
  }, [gifts, categoryFilter, statusFilter, viewMode])

  // Calculate stats
  const stats = useMemo(() => {
    const ideaCount = gifts.filter((g) => g.status === 'idea').length
    const confirmedCount = gifts.filter((g) => g.status !== 'idea').length
    const totalValue = filteredGifts.reduce(
      (sum, g) => sum + (g.current_price || 0),
      0
    )

    return { ideaCount, confirmedCount, totalValue }
  }, [gifts, filteredGifts])

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <LoadingSpinner type="card" count={6} />
      </div>
    )
  }

  if (gifts.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gifts</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Track and manage gift ideas for everyone
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <ExportButtons data={gifts} type="gifts" />
          <Button asChild className="h-11 md:h-12">
            <Link href="/gifts/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Gift
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Gift Ideas</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.ideaCount}</p>
            </div>
            <Lightbulb className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Confirmed Gifts</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{stats.confirmedCount}</p>
            </div>
            <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4 md:p-5 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Value</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600">
                ${stats.totalValue.toFixed(2)}
              </p>
            </div>
            <span className="text-2xl md:text-3xl">💰</span>
          </div>
        </Card>
      </div>

      {/* Filters and View Mode */}
      <Card className="p-4 md:p-5 lg:p-6 mb-4 md:mb-6">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm h-11 md:h-12">All ({gifts.length})</TabsTrigger>
            <TabsTrigger value="ideas" className="text-xs md:text-sm h-11 md:h-12">Ideas ({stats.ideaCount})</TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs md:text-sm h-11 md:h-12">Confirmed ({stats.confirmedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            options={GIFT_CATEGORIES}
            placeholder="All Categories"
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={GIFT_STATUSES}
            placeholder="All Statuses"
          />
        </div>

        {(categoryFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-2">
            <span className="text-xs md:text-sm text-gray-600">Active filters:</span>
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="capitalize text-xs md:text-sm">
                {categoryFilter}
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="capitalize text-xs md:text-sm">
                {statusFilter}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-11 md:h-auto"
              onClick={() => {
                setCategoryFilter('all')
                setStatusFilter('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-xs md:text-sm text-gray-600">
          Showing {filteredGifts.length} of {gifts.length} gifts
        </p>
      </div>

      {/* Gifts Grid */}
      {filteredGifts.length === 0 ? (
        <Card className="p-6 md:p-8 lg:p-12 text-center">
          <p className="text-sm md:text-base text-gray-500 mb-4">No gifts match your filters</p>
          <Button
            variant="outline"
            className="h-11 md:h-12"
            onClick={() => {
              setCategoryFilter('all')
              setStatusFilter('all')
              setViewMode('all')
            }}
          >
            Clear all filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {filteredGifts.map((gift) => (
            <Link key={gift.id} href={`/gifts/${gift.id}/edit`} className="block">
              <Card className="p-4 md:p-5 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                {/* Screenshot Preview (from extension) */}
                {gift.source_metadata?.screenshot && (
                  <div className="mb-3 md:mb-4 -mx-4 md:-mx-5 lg:-mx-6 -mt-4 md:-mt-5 lg:-mt-6">
                    <img
                      src={gift.source_metadata.screenshot}
                      alt={gift.name}
                      className="w-full h-32 md:h-40 object-cover rounded-t-lg"
                    />
                  </div>
                )}

                {/* Product Image (from URL or extension) */}
                {!gift.source_metadata?.screenshot && gift.image_url && (
                  <div className="mb-3 md:mb-4 -mx-4 md:-mx-5 lg:-mx-6 -mt-4 md:-mt-5 lg:-mt-6">
                    <img
                      src={gift.image_url}
                      alt={gift.name}
                      className="w-full h-32 md:h-40 object-contain bg-gray-50 rounded-t-lg"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg lg:text-xl font-semibold truncate">{gift.name}</h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {gift.category && (
                        <Badge variant="outline" className="capitalize text-xs md:text-sm">
                          {gift.category}
                        </Badge>
                      )}
                      {/* Source Badge */}
                      {gift.source && gift.source !== 'manual' && (
                        <Badge variant="secondary" className="text-xs">
                          {gift.source === 'extension' && '🔗 Browser'}
                          {gift.source === 'sms' && '💬 SMS'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={gift.status} />
                </div>

                {gift.description && (
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2">
                    {gift.description}
                  </p>
                )}

                {gift.recipients && gift.recipients.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 md:mb-4 pb-3 md:pb-4 border-b">
                    <span className="text-xs md:text-sm text-gray-500">For:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {gift.recipients.slice(0, 3).map((recipient) => (
                        <div key={recipient.id} className="flex items-center gap-1">
                          <Avatar
                            type={recipient.avatar_type}
                            data={recipient.avatar_data}
                            background={recipient.avatar_background}
                            name={recipient.name}
                            size="xs"
                          />
                          <span className="text-xs md:text-sm text-gray-700">{recipient.name}</span>
                        </div>
                      ))}
                      {gift.recipients.length > 3 && (
                        <span className="text-xs text-gray-500">+{gift.recipients.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 md:mb-4">
                  {gift.current_price && (
                    <span className="text-xl md:text-2xl font-bold text-green-600">
                      ${gift.current_price.toFixed(2)}
                    </span>
                  )}
                  {gift.store && (
                    <span className="text-xs md:text-sm text-gray-500">{gift.store}</span>
                  )}
                </div>

                {gift.url && (
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full h-11 md:h-12"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <a href={gift.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Product
                      </a>
                    </Button>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}