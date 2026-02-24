"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"

const loginSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  password: z.string({ required_error: "Please enter your password." }).min(6, "Password must be at least 6 characters."),
})

const signupSchema = loginSchema
  .extend({
    confirmPassword: z.string({ required_error: "Please confirm your password." }).min(6, "Password must be at least 6 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

const TAB_MAP = {
  login: "login",
  signup: "signup",
} as const

const SIGNUP_SUCCESS_MESSAGE = "Sign-up successful. Please check your inbox to confirm before signing in."

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = useMemo(() => {
    const view = searchParams.get("view")
    return view === TAB_MAP.signup ? TAB_MAP.signup : TAB_MAP.login
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<typeof TAB_MAP[keyof typeof TAB_MAP]>(initialTab)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupMessage, setSignupMessage] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resendInfo, setResendInfo] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const supabase = getSupabaseBrowserClient()

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace("/profile")
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/profile")
      }
    })

    void syncSession()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleLogin = async (values: LoginFormValues) => {
    setLoginLoading(true)
    setLoginError(null)
    setSignupMessage(null)
    setResendInfo(null)
    setPendingEmail(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setLoginError(error.message ?? "Unable to sign in. Please try again.")
        return
      }

      router.replace("/profile")
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unexpected error signing in.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (values: SignupFormValues) => {
    setSignupLoading(true)
    setSignupMessage(null)
    setResendInfo(null)
    setPendingEmail(null)
    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth?view=login` : undefined
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      })

      if (error) {
        setSignupMessage(error.message ?? "Sign up failed. Please try again.")
        return
      }

      if (data.session) {
        router.replace("/profile")
        return
      }

      setPendingEmail(values.email)
      setSignupMessage(SIGNUP_SUCCESS_MESSAGE)
      setActiveTab(TAB_MAP.login)
      loginForm.reset({ email: values.email, password: "" })
    } catch (err) {
      setSignupMessage(err instanceof Error ? err.message : "Unexpected error signing up.")
    } finally {
      setSignupLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!pendingEmail) {
      return
    }

    setResendLoading(true)
    setResendInfo(null)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
      })

      if (error) {
        setResendInfo({
          type: "error",
          message: error.message ?? "Unable to resend the confirmation email. Please try again later.",
        })
        return
      }

      setResendInfo({
        type: "success",
        message: "Confirmation email resent. Please check your inbox (and spam folder).",
      })
    } catch (err) {
      setResendInfo({
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error resending confirmation email.",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in or create an account with your email to start using Pointer.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TAB_MAP.login}>Sign in</TabsTrigger>
            <TabsTrigger value={TAB_MAP.signup}>Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_MAP.login} className="mt-6">
            <Form {...loginForm}>
              <form
                className="space-y-6"
                onSubmit={loginForm.handleSubmit((values) => {
                  void handleLogin(values)
                })}
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 6 characters" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value={TAB_MAP.signup} className="mt-6">
            <Form {...signupForm}>
              <form
                className="space-y-6"
                onSubmit={signupForm.handleSubmit((values) => {
                  void handleSignup(values)
                })}
              >
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 6 characters" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Re-enter your password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {signupMessage ? (
                  <div className="space-y-3">
                    <p
                      className={`text-sm ${signupMessage === SIGNUP_SUCCESS_MESSAGE ? "text-emerald-600" : "text-destructive"}`}
                    >
                      {signupMessage}
                    </p>
                    {signupMessage === SIGNUP_SUCCESS_MESSAGE && pendingEmail ? (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-left">
                        <p className="text-xs text-muted-foreground">
                          Didn&apos;t receive the email? You can resend it to{" "}
                          <span className="font-medium text-foreground">{pendingEmail}</span>.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              void handleResendConfirmation()
                            }}
                            disabled={resendLoading}
                          >
                            {resendLoading ? "Resending..." : "Resend confirmation email"}
                          </Button>
                          {resendInfo ? (
                            <p
                              className={`text-xs ${
                                resendInfo.type === "success" ? "text-emerald-600" : "text-destructive"
                              }`}
                            >
                              {resendInfo.message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? "Creating account..." : "Sign up"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <div className="flex items-center gap-3 rounded-full bg-background/80 px-6 py-3 shadow-lg backdrop-blur">
        <Spinner className="size-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Loading authentication…</span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthPageContent />
    </Suspense>
  )
}
