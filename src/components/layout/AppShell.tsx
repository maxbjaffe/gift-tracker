'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { UserMenu } from '@/components/shared/UserMenu'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/about', '/terms', '/privacy', '/sms-terms', '/how-it-works', '/home']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // Skip shell for public/marketing routes
  const isPublic = PUBLIC_ROUTES.includes(pathname || '')
  if (isPublic) {
    return <>{children}</>
  }

  // Skip shell for share pages
  if (pathname?.startsWith('/share/')) {
    return <>{children}</>
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Top bar with user menu */}
      <header className="flex items-center justify-end px-4 py-2 border-b border-gray-200/50 bg-white/60 backdrop-blur-sm lg:pl-14">
        <UserMenu user={user} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-[60px] lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
