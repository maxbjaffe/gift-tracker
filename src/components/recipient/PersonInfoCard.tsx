'use client'

import { ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'
import { ImportantDates, type ImportantDate } from '@/components/ImportantDates'
import type { Recipient } from '@/types/database.types'
import type { ProfileHubData } from '@/lib/hooks/useProfileHub'

interface PersonInfoCardProps {
  recipient: Recipient
  profileHub: ProfileHubData | null
  profileHubLoading: boolean
  onDatesUpdate: (dates: ImportantDate[]) => void
  isGenericProfile?: boolean
}

function TagGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (items.length === 0) return null
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    rose: 'bg-rose-100 text-rose-800',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
  }
  const cls = colorMap[color] || 'bg-gray-100 text-gray-800'

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</h3>
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span key={item} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}

export function PersonInfoCard({ recipient, profileHub, profileHubLoading, onDatesUpdate, isGenericProfile }: PersonInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* About Section — different for generic profiles */}
      <div className="p-4 md:p-5">
        {isGenericProfile ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Gift Context</h2>
              <Link
                href={`/recipients/${recipient.id}/edit`}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                Edit <Settings className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TagGroup label="Good Choices" items={recipient.gift_dos || []} color="green" />
              <TagGroup label="Avoid" items={recipient.gift_donts || []} color="rose" />
              <TagGroup label="Category Hints" items={recipient.interests || []} color="purple" />
              {!(recipient.gift_dos?.length) && !(recipient.gift_donts?.length) && !(recipient.interests?.length) && (
                <p className="col-span-2 text-xs text-gray-400 italic">
                  No gift context yet.{' '}
                  <Link href={`/recipients/${recipient.id}/edit`} className="text-purple-600 hover:text-purple-700 not-italic font-medium">
                    Add details
                  </Link>
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">About</h2>
              {profileHub && (
                <a
                  href={profileHub.profileHubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Edit <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {profileHubLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(i => <div key={i} className="h-5 w-14 bg-gray-200 rounded-full" />)}
                </div>
              </div>
            ) : profileHub ? (
              <div className="grid grid-cols-2 gap-3">
                <TagGroup label="Interests" items={profileHub.interests} color="purple" />
                <TagGroup label="Hobbies" items={profileHub.hobbies} color="indigo" />
                <TagGroup label="Colors" items={profileHub.favorite_colors} color="rose" />
                <TagGroup label="Brands" items={profileHub.favorite_brands} color="amber" />
                {profileHub.favorite_stores.length > 0 && (
                  <TagGroup label="Stores" items={profileHub.favorite_stores} color="green" />
                )}
                {(profileHub.personality_type || profileHub.school || profileHub.grade) && (
                  <div>
                    {profileHub.personality_type && (
                      <p className="text-xs text-gray-600"><span className="font-semibold text-gray-500">Personality:</span> {profileHub.personality_type}</p>
                    )}
                    {(profileHub.school || profileHub.grade) && (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold text-gray-500">School:</span>{' '}
                        {[profileHub.school, profileHub.grade && `Grade ${profileHub.grade}`].filter(Boolean).join(' - ')}
                      </p>
                    )}
                  </div>
                )}
                {profileHub.interests.length === 0 && profileHub.hobbies.length === 0 && (
                  <p className="col-span-2 text-xs text-gray-400 italic">
                    No profile data yet.{' '}
                    <a href={profileHub.profileHubUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 not-italic font-medium">
                      Add in Profile Hub
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Profile Hub unavailable</p>
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Important Dates */}
      <div className="p-4 md:p-5">
        {((recipient as any).important_dates || []).length > 0 ? (
          <ImportantDates
            recipientId={recipient.id}
            dates={((recipient as any).important_dates || []) as ImportantDate[]}
            onUpdate={onDatesUpdate}
            embedded
          />
        ) : (
          <ImportantDates
            recipientId={recipient.id}
            dates={[]}
            onUpdate={onDatesUpdate}
            embedded
          />
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Gift Settings */}
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Gift Settings</h2>
          <Link
            href={`/recipients/${recipient.id}/edit`}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            Edit <Settings className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recipient.max_budget && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Budget</h3>
              <span className="text-lg font-bold text-green-600">${recipient.max_budget.toFixed(0)}</span>
            </div>
          )}
          {recipient.gift_preferences && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Preferences</h3>
              <p className="text-xs text-gray-600">{recipient.gift_preferences}</p>
            </div>
          )}
          {recipient.gift_dos && recipient.gift_dos.length > 0 && (
            <TagGroup label="Do's" items={recipient.gift_dos} color="green" />
          )}
          {recipient.gift_donts && recipient.gift_donts.length > 0 && (
            <TagGroup label="Don'ts" items={recipient.gift_donts} color="rose" />
          )}
          {!recipient.max_budget && !recipient.gift_preferences &&
           !(recipient.gift_dos?.length) && !(recipient.gift_donts?.length) && (
            <p className="col-span-2 text-xs text-gray-400 italic">
              No gift settings configured.{' '}
              <Link href={`/recipients/${recipient.id}/edit`} className="text-purple-600 hover:text-purple-700 not-italic font-medium">
                Add settings
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
