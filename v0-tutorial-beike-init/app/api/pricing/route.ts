import { NextResponse } from "next/server"

import { createSupabaseAdminClient } from "@/lib/supabase"

type PricingPlanRow = {
  id: string
  slug: string
  name: string
  description: string
  monthly_price: string
  annual_price: string
  currency_code: string
  features: string[] | null
  feature_heading: string | null
  cta_label: string
  cta_href: string | null
  highlight: boolean
  badge_label: string | null
  button_tone: string | null
  sort_order: number
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from("pricing_plans")
      .select(
        `
        id,
        slug,
        name,
        description,
        monthly_price,
        annual_price,
        currency_code,
        features,
        feature_heading,
        cta_label,
        cta_href,
        highlight,
        badge_label,
        button_tone,
        sort_order
      `
      )
      .order("sort_order", { ascending: true })

    if (error) {
      throw error
    }

    const plans = (data as PricingPlanRow[] | null)?.map((plan) => ({
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      description: plan.description,
      monthlyPrice: Number(plan.monthly_price),
      annualPrice: Number(plan.annual_price),
      currency: plan.currency_code,
      features: plan.features ?? [],
      featureHeading: plan.feature_heading ?? "Get started today:",
      ctaLabel: plan.cta_label,
      ctaHref: plan.cta_href,
      highlight: plan.highlight,
      badgeLabel: plan.badge_label,
      buttonTone: plan.button_tone ?? "neutral",
    })) ?? []

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("[pricing][GET]", error)
    return NextResponse.json({ error: "Failed to load pricing data" }, { status: 500 })
  }
}
