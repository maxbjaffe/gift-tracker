'use client'

import { useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGifts } from '@/lib/hooks/useGifts'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { StashGiftCard } from '@/components/dashboard/StashGiftCard'
import Avatar from '@/components/Avatar'
import { categorizeGifts, groupByOccasionProfile, groupByPerson, type StashTab, type RecipientGroup } from '@/lib/dashboard/stash-tabs'
import { Plus, Package, Users, PartyPopper, LayoutGrid } from 'lucide-react'

const TABS: { value: StashTab; label: string; icon: typeof Package }[] = [
  { value: 'unassigned', label: 'Unassigned', icon: Package },
  { value: 'occasions', label: 'Occasions', icon: PartyPopper },
  { value: 'people', label: 'People', icon: Users },
  { value: 'all', label: 'All', icon: LayoutGrid },
]

function StashPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { gifts, loading: giftsLoading } = useGifts()
  const { recipients, loading: recipientsLoading } = useRecipients()

  const loading = giftsLoading || recipientsLoading
  const rawTab = searchParams.get('tab')
  const activeTab: StashTab = rawTab === 'occasions' || rawTab === 'people' || rawTab === 'all'
    ? rawTab
    : 'unassigned'

  function setActiveTab(tab: StashTab) {
    router.replace(`/stash${tab === 'unassigned' ? '' : `?tab=${tab}`}`, { scroll: false })
  }

  // Filter to stash-eligible gifts (idea, purchased, wrapped)
  const stashGifts = useMemo(() => {
    return (gifts || []).filter(g => {
      const status = g.status || 'idea'
      return ['idea', 'purchased', 'wrapped'].includes(status)
    })
  }, [gifts])

  const safeRecipients = useMemo(() => recipients || [], [recipients])

  const categorized = useMemo(
    () => categorizeGifts(stashGifts, safeRecipients),
    [stashGifts, safeRecipients]
  )

  const occasionGroups = useMemo(
    () => groupByOccasionProfile(categorized.occasions, safeRecipients),
    [categorized.occasions, safeRecipients]
  )

  const peopleGroups = useMemo(
    () => groupByPerson(categorized.people, safeRecipients),
    [categorized.people, safeRecipients]
  )

  const tabCounts: Record<StashTab, number> = useMemo(() => ({
    unassigned: categorized.unassigned.length,
    occasions: categorized.occasions.length,
    people: categorized.people.length,
    all: categorized.all.length,
  }), [categorized])

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giftstash-orange mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading stash...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Stash</h1>
          <p className="text-sm text-gray-500 mt-0.5">
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

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs ${activeTab === tab.value ? 'text-gray-500' : 'text-gray-400'}`}>
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'unassigned' && (
        <TabContent
          gifts={categorized.unassigned}
          emptyIcon={<Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />}
          emptyMessage="No unassigned gifts. All gifts are linked to a recipient!"
        />
      )}

      {activeTab === 'occasions' && (
        <GroupedTabContent
          groups={occasionGroups}
          emptyIcon={<PartyPopper className="w-12 h-12 mx-auto text-gray-300 mb-3" />}
          emptyMessage="No gifts assigned to occasion profiles yet."
        />
      )}

      {activeTab === 'people' && (
        <GroupedTabContent
          groups={peopleGroups}
          emptyIcon={<Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />}
          emptyMessage="No gifts assigned to people yet."
        />
      )}

      {activeTab === 'all' && (
        <TabContent
          gifts={categorized.all}
          showRecipients
          emptyIcon={<Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />}
          emptyMessage="Your stash is empty. Add some gift ideas!"
        />
      )}
    </div>
  )
}

function TabContent({
  gifts,
  showRecipients,
  emptyIcon,
  emptyMessage,
}: {
  gifts: import('@/types/database.types').GiftWithRecipients[]
  showRecipients?: boolean
  emptyIcon: React.ReactNode
  emptyMessage: string
}) {
  if (gifts.length === 0) {
    return (
      <div className="text-center py-16">
        {emptyIcon}
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {gifts.map((gift) => (
        <StashGiftCard key={gift.id} gift={gift} showRecipients={showRecipients} />
      ))}
    </div>
  )
}

function GroupedTabContent({
  groups,
  emptyIcon,
  emptyMessage,
}: {
  groups: RecipientGroup[]
  emptyIcon: React.ReactNode
  emptyMessage: string
}) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        {emptyIcon}
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.recipientId}>
          {/* Group header */}
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar
              type={(group.avatarType as any) ?? undefined}
              data={group.avatarData ?? undefined}
              background={group.avatarBackground ?? undefined}
              name={group.name}
              size="sm"
              showBorder
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{group.name}</h3>
              <p className="text-xs text-gray-500">
                {group.gifts.length} gift{group.gifts.length !== 1 ? 's' : ''}
                {group.totalValue > 0 && ` · $${group.totalValue.toFixed(0)}`}
              </p>
            </div>
          </div>

          {/* Gift grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {group.gifts.map((gift) => (
              <StashGiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function StashPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giftstash-orange mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading stash...</p>
        </div>
      </div>
    }>
      <StashPageContent />
    </Suspense>
  )
}
