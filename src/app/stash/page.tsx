'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGifts } from '@/lib/hooks/useGifts'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BucketCard } from '@/components/dashboard/BucketCard'
import { groupGiftsByStashProfile, type StashProfileType } from '@/lib/dashboard/stash-data'
import { Plus, Package, Users, GraduationCap, Home, Gift } from 'lucide-react'

const FILTER_CHIPS: { value: StashProfileType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'kids_party', label: "Kids' Party" },
  { value: 'teacher', label: 'Teacher' },
  { value: 'host', label: 'Host' },
  { value: 'general', label: 'General' },
  { value: 'specific', label: 'Assigned' },
]

const PROFILE_GRADIENTS: Record<StashProfileType, { gradient: string; border: string; icon: typeof Package }> = {
  specific: { gradient: 'bg-gradient-to-r from-orange-500 to-pink-500', border: 'border-orange-400', icon: Users },
  kids_party: { gradient: 'bg-gradient-to-r from-purple-500 to-pink-500', border: 'border-purple-400', icon: Gift },
  teacher: { gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500', border: 'border-blue-400', icon: GraduationCap },
  host: { gradient: 'bg-gradient-to-r from-amber-500 to-orange-500', border: 'border-amber-400', icon: Home },
  general: { gradient: 'bg-gradient-to-r from-teal-500 to-cyan-500', border: 'border-teal-400', icon: Package },
}

export default function StashPage() {
  const router = useRouter()
  const { gifts, loading: giftsLoading } = useGifts()
  const { recipients, loading: recipientsLoading } = useRecipients()
  const [filter, setFilter] = useState<StashProfileType | 'all'>('all')

  const loading = giftsLoading || recipientsLoading

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingSpinner type="card" count={3} />
      </div>
    )
  }

  const safeGifts = gifts || []
  const safeRecipients = recipients || []

  // Only show gifts that are on-hand (purchased or wrapped) or ideas
  const stashGifts = safeGifts.filter(g => {
    const status = g.status || 'idea'
    return ['idea', 'purchased', 'wrapped'].includes(status)
  })

  const groups = groupGiftsByStashProfile(stashGifts, safeRecipients)
  const filteredGroups = filter === 'all'
    ? groups
    : groups.filter(g => g.profileType === filter)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Stash</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stashGifts.length} gift{stashGifts.length !== 1 ? 's' : ''} on hand
          </p>
        </div>
        <button
          onClick={() => router.push('/chat?prefix=' + encodeURIComponent('I want to save a gift idea: '))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-blue-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Gift</span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => setFilter(chip.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === chip.value
                ? 'bg-orange-500 text-white'
                : 'bg-white/70 text-gray-600 hover:bg-white'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No gifts in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const config = PROFILE_GRADIENTS[group.profileType]
            return (
              <BucketCard
                key={group.profileType}
                title={`${group.label} ($${group.totalValue.toFixed(0)})`}
                icon={config.icon}
                gradientClasses={config.gradient}
                borderColor={config.border}
                items={group.gifts}
                onItemClick={(g) => router.push(`/gifts/${g.id}`)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
