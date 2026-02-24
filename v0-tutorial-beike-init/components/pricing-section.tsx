"use client"

import { useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"

type PricingButtonTone = "neutral" | "secondary" | "inverted" | "primary"

type PricingPlan = {
  id: string
  slug: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  currency: string
  features: string[]
  featureHeading: string
  ctaLabel: string
  ctaHref: string | null
  highlight: boolean
  badgeLabel: string | null
  buttonTone: PricingButtonTone
}

const skeletonSlots = Array.from({ length: 3 })
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
      delay: index * 0.08,
    },
  }),
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

function getCardClasses(highlight: boolean) {
  return highlight
    ? "bg-primary text-primary-foreground shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.10)]"
    : "bg-gradient-to-b from-background/80 to-background/20 border border-border text-foreground"
}

function getMutedTextClass(highlight: boolean) {
  return highlight ? "text-primary-foreground/70" : "text-muted-foreground"
}

function getButtonClass(tone: PricingButtonTone) {
  switch (tone) {
    case "inverted":
      return "bg-primary-foreground text-primary shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] hover:bg-primary-foreground/90"
    case "secondary":
      return "bg-secondary text-secondary-foreground shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] hover:bg-secondary/90"
    case "primary":
      return "bg-primary text-primary-foreground shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] hover:bg-primary/90"
    case "neutral":
    default:
      return "bg-zinc-300 text-zinc-900 shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] outline outline-[0.5px] outline-white/10 hover:bg-zinc-200"
  }
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { redirect } = useAuthRedirect()

  useEffect(() => {
    const controller = new AbortController()

    const loadPlans = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/pricing", { signal: controller.signal })
        if (!response.ok) {
          throw new Error("Failed to fetch pricing plans")
        }

        const result = (await response.json()) as { plans: PricingPlan[] }
        setPlans(result.plans ?? [])
        setError(null)
      } catch (err) {
        if ((err as DOMException).name === "AbortError") {
          return
        }
        console.error("Failed to load pricing plans", err)
        setError("无法加载价格信息，请稍后再试。")
      } finally {
        setLoading(false)
      }
    }

    void loadPlans()

    return () => controller.abort()
  }, [])

  const planContent = useMemo(() => {
    if (loading) {
      return (
        <div className="self-stretch px-5 flex flex-col md:flex-row justify-start items-start gap-4 md:gap-6 mt-6 max-w-[1100px] mx-auto">
          {skeletonSlots.map((_, index) => (
            <div key={index} className="flex-1 space-y-4 rounded-xl border border-border bg-background/40 p-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="mt-10 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-6 py-8 text-center text-destructive">
          {error}
        </div>
      )
    }

    if (!plans.length) {
      return (
        <div className="mt-10 rounded-lg border border-border bg-background/40 px-6 py-8 text-center text-muted-foreground">
          暂无定价数据，请稍后再试。
        </div>
      )
    }

    return (
      <div className="self-stretch px-5 flex flex-col md:flex-row justify-start items-start gap-4 md:gap-6 mt-6 max-w-[1100px] mx-auto">
        {plans.map((plan, index) => {
          const highlight = plan.highlight
          const annualPrice = formatCurrency(plan.annualPrice, plan.currency)
          const monthlyPrice = formatCurrency(plan.monthlyPrice, plan.currency)
          const placeholderPrice = annualPrice.length >= monthlyPrice.length ? annualPrice : monthlyPrice
          const defaultCtaHref = plan.ctaHref ?? "/auth?view=signup"
          const handlePlanClick = () => {
            void redirect({ unauthenticatedHref: defaultCtaHref })
          }

          return (
            <motion.article
              key={plan.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 p-4 overflow-hidden rounded-xl flex flex-col justify-start items-start gap-6 transition-shadow ${getCardClasses(highlight)}`}
            >
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch flex flex-col justify-start items-start gap-8">
                  <div className={`w-full text-sm font-medium leading-tight ${highlight ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {plan.name}
                    {plan.badgeLabel ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-normal text-primary-foreground">
                        {plan.badgeLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <div className="flex justify-start items-center gap-1.5">
                      <div className="relative h-10 flex items-center text-3xl font-medium leading-10">
                        <span className="invisible">{placeholderPrice}</span>
                        <span
                          className="absolute inset-0 flex items-center transition-all duration-500"
                          style={{
                            opacity: isAnnual ? 1 : 0,
                            transform: `scale(${isAnnual ? 1 : 0.8})`,
                            filter: `blur(${isAnnual ? 0 : 4}px)`,
                          }}
                          aria-hidden={!isAnnual}
                        >
                          {annualPrice}
                        </span>
                        <span
                          className="absolute inset-0 flex items-center transition-all duration-500"
                          style={{
                            opacity: !isAnnual ? 1 : 0,
                            transform: `scale(${!isAnnual ? 1 : 0.8})`,
                            filter: `blur(${!isAnnual ? 0 : 4}px)`,
                          }}
                          aria-hidden={isAnnual}
                        >
                          {monthlyPrice}
                        </span>
                      </div>
                      <div className={`text-center text-sm font-medium leading-tight ${getMutedTextClass(highlight)}`}>/month</div>
                    </div>
                    <div className={`self-stretch text-sm font-medium leading-tight ${getMutedTextClass(highlight)}`}>{plan.description}</div>
                  </div>
                </div>
                <Button
                  className={`w-full rounded-[40px] px-5 py-2 ${getButtonClass(plan.buttonTone)}`}
                  onClick={handlePlanClick}
                >
                  {plan.ctaLabel}
                </Button>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className={`self-stretch text-sm font-medium leading-tight ${getMutedTextClass(highlight)}`}>
                  {plan.featureHeading}
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  {plan.features.map((feature) => (
                    <div key={`${plan.id}-${feature}`} className="self-stretch flex justify-start items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center">
                        <Check
                          className={`h-full w-full ${highlight ? "text-primary-foreground" : "text-muted-foreground"}`}
                          strokeWidth={2}
                        />
                      </div>
                      <div className={`text-left text-sm font-normal leading-tight ${highlight ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    )
  }, [error, isAnnual, loading, plans, redirect])

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-4xl md:text-5xl font-semibold leading-tight md:leading-[40px]">
            Pricing built for every developer
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-tight">
            Choose a plan that fits your coding workflow, from individuals starting out to <br /> growing professionals
            and large organizations.
          </p>
        </div>
        <div className="pt-4">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 outline outline-1 outline-[#0307120a] outline-offset-[-1px]">
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`pl-2 pr-1 py-1 flex items-center gap-2 rounded-md transition-all ${isAnnual ? "bg-accent text-accent-foreground shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)]" : "text-zinc-400"}`}
            >
              <span className="text-sm font-medium leading-tight">Annually</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-2 py-1 flex items-center rounded-md transition-all ${!isAnnual ? "bg-accent text-accent-foreground shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.08)]" : "text-zinc-400"}`}
            >
              <span className="text-sm font-medium leading-tight">Monthly</span>
            </button>
          </div>
        </div>
      </div>
      {planContent}
    </section>
  )
}
