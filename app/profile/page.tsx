"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { user, loading } = useSupabaseSession()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?view=login")
    }
  }, [loading, router, user])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.replace("/")
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
        <div className="flex items-center gap-3 rounded-full bg-background/80 px-6 py-3 shadow-lg backdrop-blur">
          <Spinner className="size-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Loading profile…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
    // Redirect handled by effect above
  }

  const displayName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name
      : user.email?.split("@")[0]) ?? "User"
  const createdAtLabel = user.created_at ? new Date(user.created_at).toLocaleString() : "Unknown"
  const emailConfirmed = user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleString() : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <Card className="w-full max-w-3xl bg-background/80 shadow-xl backdrop-blur">
        <CardHeader className="gap-1">
          <CardTitle className="text-3xl font-semibold text-foreground">Profile</CardTitle>
          <CardDescription className="text-base">
            You are signed in as <span className="font-medium text-foreground">{user.email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1 rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display name</p>
            <p className="text-lg font-semibold text-foreground">{displayName}</p>
          </div>
          <div className="space-y-1 rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User ID</p>
            <p className="text-sm font-mono text-foreground break-words">{user.id}</p>
          </div>
          <div className="space-y-1 rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account created</p>
            <p className="text-sm text-foreground">{createdAtLabel}</p>
          </div>
          <div className="space-y-1 rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email confirmation</p>
            <p className="text-sm text-foreground">
              {emailConfirmed ? `Verified on ${emailConfirmed}` : "Pending email verification"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Back to home
          </Button>
          <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
