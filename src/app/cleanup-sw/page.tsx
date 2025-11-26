'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function CleanupServiceWorkerPage() {
  const [status, setStatus] = useState<'checking' | 'cleaning' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState('Checking for service workers...')
  const [details, setDetails] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    cleanupServiceWorkers()
  }, [])

  async function cleanupServiceWorkers() {
    try {
      if (!('serviceWorker' in navigator)) {
        setStatus('success')
        setMessage('No service worker support detected - nothing to clean')
        return
      }

      setStatus('cleaning')
      setMessage('Unregistering service workers...')

      const registrations = await navigator.serviceWorker.getRegistrations()

      if (registrations.length === 0) {
        setStatus('success')
        setMessage('No service workers found - already clean!')
        setDetails(['Your browser has no registered service workers'])
        return
      }

      const results: string[] = []

      for (const registration of registrations) {
        try {
          const scope = registration.scope
          await registration.unregister()
          results.push(`✅ Unregistered: ${scope}`)
        } catch (err: any) {
          results.push(`❌ Failed to unregister ${registration.scope}: ${err.message}`)
        }
      }

      setDetails(results)

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName)
          results.push(`🗑️ Deleted cache: ${cacheName}`)
        }
      }

      setStatus('success')
      setMessage(`Successfully cleaned up ${registrations.length} service worker(s) and ${(await caches.keys()).length} cache(s)`)

    } catch (error: any) {
      setStatus('error')
      setMessage(`Error during cleanup: ${error.message}`)
      setDetails([error.stack || error.toString()])
    }
  }

  function handleContinue() {
    // Clear local storage and session storage for good measure
    localStorage.clear()
    sessionStorage.clear()

    // Hard reload the page
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="max-w-2xl w-full p-6 md:p-8 lg:p-10">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">
            {status === 'checking' && '🔍'}
            {status === 'cleaning' && '🧹'}
            {status === 'success' && '✅'}
            {status === 'error' && '❌'}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Service Worker Cleanup
          </h1>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {status === 'cleaning' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giftstash-orange"></div>
            </div>
          )}
        </div>

        {details.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-sm text-gray-700">Details:</h3>
            <div className="space-y-1 text-xs font-mono">
              {details.map((detail, idx) => (
                <div key={idx} className="text-gray-600">
                  {detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <p className="font-semibold mb-2">✅ Cleanup Complete!</p>
              <p>
                All service workers and caches have been removed. Click below to reload the app with a fresh start.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
            >
              Continue to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <p className="font-semibold mb-2">⚠️ Cleanup Error</p>
              <p>
                There was an error during cleanup. Try manually clearing your browser data or use an incognito window.
              </p>
            </div>

            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full"
            >
              Continue Anyway
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
