'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/about', '/terms', '/privacy', '/sms-terms', '/how-it-works', '/home']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Skip shell for public/marketing routes
  const isPublic = PUBLIC_ROUTES.includes(pathname || '')
  if (isPublic) {
    return <>{children}</>
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-[60px] lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
