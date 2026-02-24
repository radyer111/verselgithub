import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | undefined

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  if (!url) {
    throw new Error(
      "Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL (and optionally SUPABASE_URL for server usage) in your environment variables."
    )
  }
  return url
}

function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error("Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.")
  }
  return key
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }

  return browserClient
}

export function createSupabaseAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable for server-side Supabase client.")
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
