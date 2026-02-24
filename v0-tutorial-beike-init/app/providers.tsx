"use client"

import type { PropsWithChildren } from "react"

import { SupabaseSessionProvider } from "@/hooks/use-supabase-session"

export default function Providers({ children }: PropsWithChildren) {
  return <SupabaseSessionProvider>{children}</SupabaseSessionProvider>
}

