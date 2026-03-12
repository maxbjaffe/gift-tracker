'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { CalendarDays, Users, BarChart3, Settings, X } from 'lucide-react'

interface MoreSheetProps {
  open: boolean
  onClose: () => void
}

const items = [
  {
    href: '/occasions',
    label: 'Occasions',
    description: 'Upcoming birthdays & holidays',
    icon: CalendarDays,
  },
  {
    href: '/recipients',
    label: 'Recipients',
    description: 'People you buy gifts for',
    icon: Users,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    description: 'Spending & gift insights',
    icon: BarChart3,
  },
  {
    href: '/settings',
    label: 'Settings',
    description: 'Account & preferences',
    icon: Settings,
  },
]

export function MoreSheet({ open, onClose }: MoreSheetProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50 lg:hidden"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">More</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    onClose()
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        {/* Safe area spacer */}
        <div className="pb-safe" />
      </div>
    </>
  )
}
