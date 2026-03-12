'use client'

import { useRouter } from 'next/navigation'
import { Plus, ShoppingCart, Package } from 'lucide-react'

export function QuickActionsCard() {
  const router = useRouter()

  const actions = [
    {
      label: 'Add Gift Idea',
      icon: Plus,
      prefix: 'I want to save a gift idea: ',
    },
    {
      label: 'Log Purchase',
      icon: ShoppingCart,
      prefix: 'I just bought a gift: ',
    },
    {
      label: 'Check Stash',
      icon: Package,
      prefix: "What gifts do I have on hand?",
    },
  ]

  return (
    <div className="bg-white/60 rounded-2xl shadow-sm p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => router.push(`/chat?prefix=${encodeURIComponent(action.prefix)}`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
