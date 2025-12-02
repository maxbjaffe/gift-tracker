'use client'

import { useEffect, useState } from 'react'
import { PWA_CONFIG } from '@/lib/app-config'

/**
 * PWAProvider - Handles all PWA-related client-side setup
 *
 * This component conditionally:
 * 1. Injects the manifest link (if PWA enabled)
 * 2. Registers the service worker (if enabled)
 * 3. Handles service worker updates
 *
 * All PWA functionality is isolated here for easy debugging and removal.
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Skip if PWA is disabled
    if (!PWA_CONFIG.enabled) {
      return
    }

    // Inject manifest link dynamically (only if not already present)
    if (PWA_CONFIG.features.manifest) {
      const existingManifest = document.querySelector('link[rel="manifest"]')
      if (!existingManifest) {
        const link = document.createElement('link')
        link.rel = 'manifest'
        link.href = '/manifest.json'
        document.head.appendChild(link)
      }
    }

    // Register service worker if enabled
    if (PWA_CONFIG.features.serviceWorker && 'serviceWorker' in navigator) {
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      setSwRegistration(registration)

      // Check for updates on page load
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available - could show update prompt here
              console.log('[PWA] New service worker available')
            }
          })
        }
      })

      console.log('[PWA] Service worker registered:', PWA_CONFIG.swVersion)
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error)
    }
  }

  return <>{children}</>
}

/**
 * Utility function to unregister all service workers
 * Can be called from settings or debug UI
 */
export async function unregisterAllServiceWorkers(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(reg => reg.unregister()))

    // Clear all caches
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))

    console.log('[PWA] All service workers unregistered and caches cleared')
    return true
  } catch (error) {
    console.error('[PWA] Failed to unregister service workers:', error)
    return false
  }
}

/**
 * Check if the app is running as an installed PWA
 */
export function isRunningAsPWA(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if the browser supports PWA installation
 */
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false

  // Check for beforeinstallprompt support (Chrome, Edge, etc.)
  return 'BeforeInstallPromptEvent' in window ||
    // Safari on iOS - check if not already installed
    ((window.navigator as any).standalone === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent))
}
