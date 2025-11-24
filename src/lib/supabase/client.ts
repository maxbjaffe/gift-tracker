// Browser-side Supabase client
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use localStorage for session persistence in PWA mode
        // This ensures the session persists when the PWA is closed and reopened
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'giftstash-auth',
        // Persist session across PWA restarts
        persistSession: true,
        // Detect session in URL (for magic links, etc.)
        detectSessionInUrl: true,
        // Auto-refresh token before expiry
        autoRefreshToken: true,
      },
    }
  )
}
