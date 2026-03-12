'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Recipient } from '@/types/database.types'

interface ProfileCompletenessCardProps {
  recipients: Recipient[]
}

function getCompleteness(r: Recipient): { score: number; missing: string[] } {
  let score = 0
  const missing: string[] = []

  if (r.birthday) score += 25
  else missing.push('birthday')

  if (r.interests && r.interests.length > 0) score += 25
  else missing.push('interests')

  if (r.relationship) score += 25
  else missing.push('relationship')

  if (r.hobbies && r.hobbies.length > 0) score += 25
  else missing.push('hobbies')

  return { score, missing }
}

export function ProfileCompletenessCard({ recipients }: ProfileCompletenessCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (recipients.length === 0) return null

  const profiles = recipients.map(r => ({
    recipient: r,
    ...getCompleteness(r),
  }))

  const avgScore = Math.round(profiles.reduce((sum, p) => sum + p.score, 0) / profiles.length)

  // Only show incomplete profiles
  const incomplete = profiles.filter(p => p.score < 100).slice(0, 5)
  if (incomplete.length === 0) return null

  return (
    <div className="bg-white/60 rounded-2xl shadow-sm p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profiles</h3>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{avgScore}%</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2.5">
          {incomplete.map((p) => (
            <div key={p.recipient.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{p.recipient.name}</span>
                <span className="text-[10px] text-gray-500">{p.score}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${p.score}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Add {p.missing.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
