// App configuration for multi-deployment setup
// This allows the same codebase to power both Family Hub and GiftStash standalone app

export type AppMode = 'family-hub' | 'giftstash'

// Determine which app we're running based on environment variable
export const APP_MODE: AppMode = (process.env.NEXT_PUBLIC_APP_MODE as AppMode) || 'family-hub'

// Helper functions
export const isGiftStashApp = () => APP_MODE === 'giftstash'
export const isFamilyHubApp = () => APP_MODE === 'family-hub'

// App-specific configuration
export const APP_CONFIG = {
  'giftstash': {
    name: 'GiftStash',
    domain: 'giftstash.app',
    title: 'GiftStash - Your Personal Gift Idea Tracker',
    description: 'Never forget a gift idea again. Save, track, and organize gift ideas for everyone special in your life.',
    navigation: {
      showAccountability: false,
      showSchoolEmails: false,
      showFamilyInfo: false,
      showGiftStash: true,
    },
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
  },
  'family-hub': {
    name: 'Family Hub',
    domain: null,
    title: 'Family Hub - All-in-One Family Management',
    description: 'Manage your family with GiftStash, Accountability, School Emails, and more.',
    navigation: {
      showAccountability: true,
      showSchoolEmails: true,
      showFamilyInfo: true,
      showGiftStash: true,
    },
    features: [],
  },
}

// Get current app config
export const getCurrentAppConfig = () => APP_CONFIG[APP_MODE]

// Check if we should show the public landing page (GiftStash only)
export const shouldShowLandingPage = () => isGiftStashApp()
