'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isPWAFeatureEnabled } from '@/lib/app-config'
import Link from 'next/link'

/**
 * ShareTargetPage - Handles incoming shares from the PWA share target
 *
 * When users share a URL/text to GiftStash from another app, this page:
 * 1. Captures the shared data from URL params (GET) or form data (POST)
 * 2. Extracts product information if a URL was shared
 * 3. Redirects to the gift creation form with pre-filled data
 *
 * The manifest.json declares this as the share_target action endpoint.
 */

interface SharedData {
  title?: string
  text?: string
  url?: string
}

function ShareTargetContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'error' | 'not-enabled'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [sharedData, setSharedData] = useState<SharedData>({})

  useEffect(() => {
    // Check if share target feature is enabled
    if (!isPWAFeatureEnabled('shareTarget')) {
      setStatus('not-enabled')
      return
    }

    handleShare()
  }, [searchParams])

  const handleShare = async () => {
    try {
      // Get shared data from URL params (this is how the manifest delivers it)
      const title = searchParams.get('title') || ''
      const text = searchParams.get('text') || ''
      const url = searchParams.get('url') || ''

      // Sometimes the URL comes in the text field
      const sharedUrl = url || extractUrlFromText(text)
      const sharedTitle = title || extractTitleFromText(text, sharedUrl)

      setSharedData({ title: sharedTitle, text, url: sharedUrl })

      // Check if user is authenticated
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Store shared data in sessionStorage and redirect to login
        sessionStorage.setItem('pendingShare', JSON.stringify({
          title: sharedTitle,
          text,
          url: sharedUrl
        }))
        router.push('/login?redirect=/share-target/resume')
        return
      }

      setStatus('processing')

      // If we have a URL, try to extract product info
      if (sharedUrl) {
        try {
          const response = await fetch('/api/extract-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: sharedUrl })
          })

          const result = await response.json()

          if (result.success && result.data) {
            // Build query params for the new gift page
            const params = new URLSearchParams()
            params.set('name', result.data.name || sharedTitle || '')
            params.set('url', sharedUrl)
            if (result.data.price) params.set('price', result.data.price.toString())
            if (result.data.store) params.set('store', result.data.store)
            if (result.data.brand) params.set('brand', result.data.brand)
            if (result.data.category) params.set('category', result.data.category)
            if (result.data.image_url) params.set('image_url', result.data.image_url)
            if (result.data.description) params.set('description', result.data.description)
            params.set('from', 'share')

            setStatus('success')
            router.push(`/gifts/new?${params.toString()}`)
            return
          }
        } catch {
          // Extraction failed, continue with basic data
          console.log('[ShareTarget] Product extraction failed, using basic data')
        }
      }

      // No URL or extraction failed - redirect with what we have
      const params = new URLSearchParams()
      if (sharedTitle) params.set('name', sharedTitle)
      if (sharedUrl) params.set('url', sharedUrl)
      if (text && !sharedUrl) params.set('notes', text)
      params.set('from', 'share')

      setStatus('success')
      router.push(`/gifts/new?${params.toString()}`)

    } catch (error) {
      console.error('[ShareTarget] Error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process shared content')
      setStatus('error')
    }
  }

  // Helper to extract URL from text that might contain both description and URL
  const extractUrlFromText = (text: string): string => {
    const urlRegex = /https?:\/\/[^\s]+/gi
    const matches = text.match(urlRegex)
    return matches ? matches[0] : ''
  }

  // Helper to extract title from text (remove the URL part)
  const extractTitleFromText = (text: string, url: string): string => {
    if (!url) return text.trim()
    return text.replace(url, '').trim()
  }

  // Render based on status
  if (status === 'not-enabled') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Target Not Enabled</h1>
          <p className="text-gray-600 mb-6">
            The share target feature is currently disabled. Please contact support if you believe this is an error.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          {sharedData.url && (
            <p className="text-sm text-gray-500 mb-6 break-all">
              Shared URL: {sharedData.url}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href={`/gifts/new${sharedData.url ? `?url=${encodeURIComponent(sharedData.url)}` : ''}`}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Gift Manually
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Loading/Processing state
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="animate-bounce text-6xl mb-4">🎁</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'processing' ? 'Processing Gift...' : 'Loading...'}
        </h1>
        <p className="text-gray-600">
          {status === 'processing'
            ? "We're extracting product details for you..."
            : 'Getting your shared content ready...'
          }
        </p>
        {sharedData.url && (
          <p className="text-sm text-gray-500 mt-4 break-all">
            {sharedData.url}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">🎁</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <ShareTargetContent />
    </Suspense>
  )
}
