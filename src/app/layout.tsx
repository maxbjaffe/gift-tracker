// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { APP_CONFIG, PWA_CONFIG } from '@/lib/app-config'
import { PWAProvider } from '@/components/pwa/PWAProvider'
import { AppShell } from '@/components/layout/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
  // Manifest is injected conditionally by PWAProvider based on feature flags
  // This prevents PWA features from activating when disabled
  ...(PWA_CONFIG.enabled && { manifest: '/manifest.json' }),
  themeColor: '#f97316',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GiftStash',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
    images: [
      {
        url: '/images/GiftStashOG.png',
        width: 1200,
        height: 634,
        alt: 'GiftStash - Never forget a gift idea again',
      },
    ],
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
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
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWAProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </PWAProvider>
      </body>
    </html>
  )
}
