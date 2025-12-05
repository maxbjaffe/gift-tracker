// =============================================================================
// PWA Configuration
// =============================================================================
// PWA is controlled via environment variables:
// - NEXT_PUBLIC_PWA_ENABLED: Master switch for all PWA features
// - NEXT_PUBLIC_PWA_SERVICE_WORKER: Enable service worker (caching)
// - NEXT_PUBLIC_PWA_STATIC_CACHING: Enable static asset caching
//
// Rollout phases:
// 1. PWA_ENABLED=true only: Manifest + installable, no service worker
// 2. Add SERVICE_WORKER=true: Enables SW registration
// 3. Add STATIC_CACHING=true: Enables font/image caching
//
// IMPORTANT: Never cache pages or API routes - this broke auth before!

const isPWAEnabled = process.env.NEXT_PUBLIC_PWA_ENABLED === 'true'
const isServiceWorkerEnabled = process.env.NEXT_PUBLIC_PWA_SERVICE_WORKER === 'true'
const isStaticCachingEnabled = process.env.NEXT_PUBLIC_PWA_STATIC_CACHING === 'true'

// Minimal caching strategy - only static assets that can't break auth
const minimalCaching = [
  {
    // Google Fonts - safe to cache aggressively
    urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
      }
    }
  },
  {
    // Local font files
    urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'local-fonts',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60
      }
    }
  },
  {
    // Static images in /images folder only
    urlPattern: /\/images\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-images',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },
  // IMPORTANT: Everything else goes to network - NO catch-all caching!
  // This prevents auth session issues
]

// No caching at all - safest option
const noCaching = []

const withPWA = require('next-pwa')({
  dest: 'public',
  // Only register SW if both PWA and service worker are enabled
  register: isPWAEnabled && isServiceWorkerEnabled,
  skipWaiting: true,
  // Disable completely if PWA feature flag is off
  disable: !isPWAEnabled || !isServiceWorkerEnabled,
  // Use minimal caching only if static caching is enabled
  runtimeCaching: isStaticCachingEnabled ? minimalCaching : noCaching,
  // Don't cache pages - this is what broke auth
  buildExcludes: [/middleware-manifest\.json$/],
  // Exclude all pages and API routes from precaching
  publicExcludes: ['!api/**/*', '!**/*.html'],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: Fix all type errors and re-enable
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'target.scene7.com',
      },
      {
        protocol: 'https',
        hostname: 'www.ugg.com',
      },
      {
        protocol: 'https',
        hostname: '*.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Allow kiosk routes to be embedded in iframes (for Dakboard, etc.)
        source: '/kiosk/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
      {
        // Cache static images for 1 year (immutable)
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache avatars for 1 year
        source: '/avatars/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js optimized images for 1 year
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache static JS/CSS chunks for 1 year (they have hashes in filenames)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
