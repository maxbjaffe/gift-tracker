// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gift Tracker - Never Forget a Gift Again',
  description: 'AI-powered family gift management with price tracking and smart recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎁</span>
              <Link href="/" className="text-xl font-bold">
                Gift Tracker
              </Link>
            </div>

            <nav className="ml-auto flex items-center gap-6">
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
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        <footer className="border-t">
          <div className="container py-8 text-center text-sm text-muted-foreground">
            © 2025 Gift Tracker. Built with Next.js, Supabase, and Claude AI.
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  )
}