'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Home,
  MessageSquare,
  Package,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react'

const SIDEBAR_COLLAPSED_KEY = 'giftstash-sidebar-collapsed'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const primaryItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/stash', label: 'Stash', icon: Package },
]

const secondaryItems: NavItem[] = [
  { href: '/occasions', label: 'Occasions', icon: CalendarDays },
  { href: '/recipients', label: 'Recipients', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`relative w-full flex items-center gap-3 rounded-lg transition-colors duration-150 ${
        collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
      } ${
        isActive
          ? 'bg-orange-50 text-orange-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r-full" />
      )}
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </button>
  )
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
      if (saved !== null) setCollapsed(saved === 'true')
    }
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
    }
  }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-gray-200 bg-white/80 backdrop-blur-sm h-full transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center gap-2 px-3 py-4 ${collapsed ? 'justify-center' : ''}`}>
          <Image
            src="/images/GiftStashIconGSv2.png"
            alt="GiftStash"
            width={32}
            height={32}
            className="w-8 h-8 flex-shrink-0"
          />
          {!collapsed && (
            <span className="font-semibold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent text-sm tracking-wide">
              GiftStash
            </span>
          )}
        </div>

        {/* Primary nav */}
        <div className="px-2 space-y-0.5">
          {primaryItems.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              collapsed={collapsed}
              onClick={() => router.push(item.href)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 my-3 border-t border-gray-200" />

        {/* Secondary nav */}
        <div className="px-2 space-y-0.5 flex-1 overflow-y-auto">
          {secondaryItems.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              collapsed={collapsed}
              onClick={() => router.push(item.href)}
            />
          ))}
        </div>

        {/* Collapse toggle */}
        <div className="px-2 pb-3 border-t border-gray-200 pt-3">
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5 mx-auto" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
