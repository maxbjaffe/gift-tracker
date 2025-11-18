// Server-side Supabase client for App Router
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/Types/database.types'

// For development: Use service role key to bypass RLS
export function createServiceSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  // In development, use service role key if no auth cookies present
  const authCookie = cookieStore.get('sb-access-token') || cookieStore.get('sb-xjeemfudbujwqrnkuwvb-auth-token')

  if (!authCookie && process.env.NODE_ENV === 'development') {
    return createServiceSupabaseClient()
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Export as createClient for convenience
export const createClient = createServerSupabaseClient;
