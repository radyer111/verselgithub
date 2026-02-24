"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { useSupabaseSession } from "./use-supabase-session"

const PROFILE_ROUTE = "/profile"
const DEFAULT_AUTH_ROUTE = "/auth?view=signup"

interface RedirectOptions {
  unauthenticatedHref?: string
  authenticatedHref?: string
}

export function useAuthRedirect(defaultUnauthenticatedHref = DEFAULT_AUTH_ROUTE) {
  const { user, refresh } = useSupabaseSession()
  const router = useRouter()

  const redirect = useCallback(
    async (options?: RedirectOptions) => {
      const authedTarget = options?.authenticatedHref ?? PROFILE_ROUTE
      const unauthTarget = options?.unauthenticatedHref ?? defaultUnauthenticatedHref

      if (user) {
        router.push(authedTarget)
        return
      }

      const latestSession = await refresh()
      router.push(latestSession ? authedTarget : unauthTarget)
    },
    [defaultUnauthenticatedHref, refresh, router, user]
  )

  return {
    isAuthenticated: Boolean(user),
    redirect,
  }
}

