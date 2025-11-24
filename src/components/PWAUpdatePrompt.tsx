'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';

/**
 * PWA Update Prompt Component
 *
 * Detects when a new version of the PWA is available and prompts
 * the user to reload to get the latest features and bug fixes.
 *
 * How it works:
 * - Listens for service worker updates
 * - Shows a banner when new version is detected
 * - User can reload immediately or dismiss
 * - Reappears on next app open if dismissed
 */
export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Only run in browser with service worker support
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check if there's already a waiting service worker
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdatePrompt(true);
      }
    });

    // Listen for new service worker updates
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60000);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        }
      });
    });

    // Listen for controller change (new SW has taken over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload to show new version
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    // Will show again next time they open the app
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Update Available!</h3>
            </div>
            <p className="text-sm text-white/90 mb-3">
              A new version of GiftStash is ready with the latest features and improvements.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-white text-giftstash-orange hover:bg-white/90 font-semibold"
              >
                Update Now
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
