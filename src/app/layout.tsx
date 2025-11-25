// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import Image from 'next/image'
import { UserMenu } from '@/components/shared/UserMenu'
import { MobileNav } from '@/components/shared/MobileNav'
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isGiftStashApp, getCurrentAppConfig } from '@/lib/app-config'

const inter = Inter({ subsets: ['latin'] })

const appConfig = getCurrentAppConfig()

export const metadata: Metadata = {
  title: appConfig.title,
  description: appConfig.description,
  manifest: '/manifest.json',
  themeColor: '#f97316',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GiftStash',
  },
  openGraph: {
    title: appConfig.title,
    description: appConfig.description,
    images: [
      {
        url: '/images/GiftStashOG.png',
        width: 1200,
        height: 634,
        alt: 'GiftStash - Never forget a gift idea again',
      },
    ],
    siteName: appConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.title,
    description: appConfig.description,
    images: ['/images/GiftStashOG.png'],
  },
  icons: {
    icon: [
      { url: '/images/GiftStashIcon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/images/GiftStashIcon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/images/GiftStashIcon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/GiftStashIcon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/GiftStashIcon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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

  // Only show Family Hub header when not in GiftStash mode
  // GiftStash landing page has its own header
  const showFamilyHubHeader = !isGiftStashApp()

  return (
    <html lang="en">
      <body className={inter.className}>
        {showFamilyHubHeader && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl">🏠</span>
                <span className="text-lg md:text-xl font-bold">Family Hub</span>
              </Link>
              <div className="h-8 w-px bg-border hidden md:block" />
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/images/GiftStashIconGSv2.png"
                  alt="GiftStash"
                  width={80}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="ml-auto hidden md:flex items-center gap-8">
              {/* GiftStash Section */}
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-base font-semibold text-giftstash-orange hover:text-giftstash-orange-light transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/recipients"
                  className="text-base font-semibold text-giftstash-blue hover:text-giftstash-blue-light transition-colors"
                >
                  Recipients
                </Link>
                <Link
                  href="/gifts"
                  className="text-base font-semibold text-giftstash-blue hover:text-giftstash-blue-light transition-colors"
                >
                  Gifts
                </Link>
                <Link
                  href="/inspiration"
                  className="text-base font-semibold text-giftstash-blue hover:text-giftstash-blue-light transition-colors flex items-center gap-1.5"
                >
                  <span className="text-lg">✨</span> Inspiration
                </Link>
                <Link
                  href="/analytics"
                  className="text-base font-semibold text-giftstash-blue hover:text-giftstash-blue-light transition-colors"
                >
                  Analytics
                </Link>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-border" />

              {/* Accountability Section */}
              <div className="flex items-center gap-6">
                <Link
                  href="/accountability"
                  className="text-base font-semibold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-lg">🎯</span> Accountability
                </Link>
                <Link
                  href="/accountability/analytics"
                  className="text-base font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Stats
                </Link>
                <Link
                  href="/emails"
                  className="text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-lg">📧</span> School Emails
                </Link>
                <Link
                  href="/family-info"
                  className="text-base font-semibold text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-lg">📋</span> Family Info
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
        )}

        <main className={showFamilyHubHeader ? "min-h-[calc(100vh-4rem)]" : ""}>{children}</main>

        {showFamilyHubHeader && (
        <footer className="border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container py-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-3">
              <Image
                src="/images/GiftStashIconGSv2.png"
                alt="GiftStash"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <span className="font-semibold text-gray-900">Family Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 GiftStash & Family Hub. Built with Next.js, Supabase, and Claude AI.
            </p>
          </div>
        </footer>
        )}

        <Toaster />
        <PWAUpdatePrompt />
      </body>
    </html>
  )
}