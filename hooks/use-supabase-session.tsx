"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react"
import type { Session, User } from "@supabase/supabase-js"

import { getSupabaseBrowserClient } from "@/lib/supabase"

interface SessionState {
  session: Session | null
  user: User | null
  loading: boolean
  refresh: () => Promise<Session | null>
}

const SupabaseSessionContext = createContext<SessionState | undefined>(undefined)

export function SupabaseSessionProvider({ children }: PropsWithChildren) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession()
      const nextSession = data.session ?? null
      setSession(nextSession)
      return nextSession
    } catch {
      setSession(null)
      return null
    }
  }, [supabase])

  useEffect(() => {
    let active = true

    const initialiseSession = async () => {
      try {
        await refresh()
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void initialiseSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [refresh, supabase])

  const value = useMemo<SessionState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      refresh,
    }),
    [session, loading, refresh]
  )

  return <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>
}

export function useSupabaseSession(): SessionState {
  const context = useContext(SupabaseSessionContext)
  if (!context) {
    throw new Error("useSupabaseSession must be used within a SupabaseSessionProvider")
  }
  return context
}
