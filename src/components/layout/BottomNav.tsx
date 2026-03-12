'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, MessageSquare, Package, MoreHorizontal, type LucideIcon } from 'lucide-react'
import { MoreSheet } from './MoreSheet'

interface TabItem {
  href: string
  label: string
  icon: LucideIcon
}

const tabs: TabItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/stash', label: 'Stash', icon: Package },
]

const secondaryPaths = ['/occasions', '/recipients', '/analytics', '/settings']

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')
  const isSecondaryActive = secondaryPaths.some(p => isActive(p))

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 h-[60px] pb-safe">
        <div className="flex items-center justify-around h-full px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href)
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  active ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                {active && (
                  <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-orange-500 rounded-b-full" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              isSecondaryActive ? 'text-orange-600' : 'text-gray-400'
            }`}
          >
            {isSecondaryActive && (
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-orange-500 rounded-b-full" />
            )}
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}
