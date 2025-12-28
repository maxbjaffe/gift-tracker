// GiftStash app configuration

export const APP_CONFIG = {
  name: 'GiftStash',
  domain: 'giftstash.app',
  title: 'GiftStash - Your Personal Gift Idea Tracker',
  description: 'Never forget a gift idea again. Save, track, and organize gift ideas for everyone special in your life.',
  features: [
    {
      icon: '🛒',
      title: 'Browser Extension',
      description: 'Save gift ideas from any website with one click',
    },
    {
      icon: '📱',
      title: 'SMS Integration',
      description: 'Text gift ideas on the go - we\'ll save them for you',
    },
    {
      icon: '🤖',
      title: 'AI Recommendations',
      description: 'Get personalized gift suggestions powered by AI',
    },
    {
      icon: '💰',
      title: 'Price Tracking',
      description: 'Track prices and get notified of deals',
    },
    {
      icon: '👥',
      title: 'Recipient Management',
      description: 'Organize gifts by person, occasion, and category',
    },
    {
      icon: '📊',
      title: 'Budget Tracking',
      description: 'Stay on budget with spending insights and analytics',
    },
  ],
}

// =============================================================================
// PWA Feature Flags
// =============================================================================
// Modular PWA configuration to enable features incrementally and safely.
// This prevents the issues we had before where PWA caching broke auth sessions.
//
// Rollout phases:
// 1. MANIFEST_ONLY: Just installable, no service worker (safest)
// 2. SHARE_TARGET: Enable share target handler
// 3. STATIC_CACHING: Cache fonts/images only
// 4. OFFLINE_PAGE: Add offline fallback page
// 5. (Never recommended): Aggressive page/API caching

export const PWA_CONFIG = {
  // Master kill switch - if false, no PWA features are enabled
  enabled: process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',

  // Individual feature flags (only apply if enabled is true)
  features: {
    // Injects manifest link - makes app installable
    manifest: true,

    // Enables share target handler at /share-target
    shareTarget: process.env.NEXT_PUBLIC_PWA_SHARE_TARGET !== 'false',

    // Enables service worker registration
    serviceWorker: process.env.NEXT_PUBLIC_PWA_SERVICE_WORKER === 'true',

    // Enables caching of static assets (fonts, images)
    // Only applies if serviceWorker is true
    staticCaching: process.env.NEXT_PUBLIC_PWA_STATIC_CACHING === 'true',

    // Enables offline fallback page
    // Only applies if serviceWorker is true
    offlinePage: process.env.NEXT_PUBLIC_PWA_OFFLINE_PAGE === 'true',
  },

  // Service worker version - bump this to force update
  swVersion: 'v1.0.0',
}

// Helper functions for PWA features
export const isPWAEnabled = () => PWA_CONFIG.enabled
export const isPWAFeatureEnabled = (feature: keyof typeof PWA_CONFIG.features) =>
  PWA_CONFIG.enabled && PWA_CONFIG.features[feature]

// Nuclear option: Check if we should show the unregister button
// Always available when PWA is enabled, for debugging
export const shouldShowPWADebug = () => PWA_CONFIG.enabled
