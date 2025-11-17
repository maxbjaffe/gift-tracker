// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { UserMenu } from '@/components/shared/UserMenu'
import { MobileNav } from '@/components/shared/MobileNav'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Family Hub - Gift Tracking & Accountability',
  description: 'All-in-one family management platform with gift tracking, accountability features, and SMS control',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl">🏠</span>
                <span className="text-lg md:text-xl font-bold">Family Hub</span>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="ml-auto hidden md:flex items-center gap-6">
              {/* Gift Tracker Section */}
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/recipients"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Recipients
                </Link>
                <Link
                  href="/gifts"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Gifts
                </Link>
                <Link
                  href="/inspiration"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  ✨ Inspiration
                </Link>
                <Link
                  href="/analytics"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Analytics
                </Link>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-border" />

              {/* Accountability Section */}
              <div className="flex items-center gap-4">
                <Link
                  href="/accountability"
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                >
                  🎯 Accountability
                </Link>
                <Link
                  href="/accountability/analytics"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Stats
                </Link>
              </div>

              <UserMenu user={user} />
            </nav>

            {/* Mobile Navigation - Visible only on mobile */}
            <div className="ml-auto md:hidden">
              <MobileNav user={user} />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        <footer className="border-t">
          <div className="container py-8 text-center text-sm text-muted-foreground">
            © 2025 Family Hub. Built with Next.js, Supabase, and Claude AI.
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  )
}