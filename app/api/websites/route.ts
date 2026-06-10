import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

function generateCampaignCode(name: string): string {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${slug}-${rand}`
}

function verifyAuth(request: NextRequest): { userId: string } | null {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

// ── GET: List all websites ─────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, data: [] })
  }

  const { data, error } = await supabaseAdmin
    .from("websites")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data || [] })
}

// ── POST: Create website ───────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const {
      name, domain, landingPageUrl, safePageUrl,
      allowedCountries = [], blockedAdPlatforms = [],
      maxVisitLimit = 10, visitLimitTimeHours = 24,
      isActive = true, cloakingEnabled = true,
    } = body

    if (!name || !domain || !landingPageUrl || !safePageUrl) {
      return NextResponse.json({ success: false, error: "name, domain, landingPageUrl and safePageUrl are required" }, { status: 400 })
    }

    const campaignCode = generateCampaignCode(name)

    const { data, error } = await supabaseAdmin
      .from("websites")
      .insert([{
        name,
        domain: domain.replace(/^https?:\/\//, ""),
        landing_page_url: landingPageUrl,
        safe_page_url: safePageUrl,
        allowed_countries: Array.isArray(allowedCountries) ? allowedCountries : [],
        blocked_ad_platforms: Array.isArray(blockedAdPlatforms) ? blockedAdPlatforms : [],
        max_visit_limit: maxVisitLimit,
        visit_limit_time_hours: visitLimitTimeHours,
        is_active: isActive,
        cloaking_enabled: cloakingEnabled,
        campaign_code: campaignCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("POST /api/websites error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// ── PUT: Update website ────────────────────────────────────
export async function PUT(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return NextResponse.json({ success: false, error: "Website ID required" }, { status: 400 })

    const updateData: any = { updated_at: new Date().toISOString() }
    if (rest.name !== undefined) updateData.name = rest.name
    if (rest.domain !== undefined) updateData.domain = rest.domain
    if (rest.landingPageUrl !== undefined) updateData.landing_page_url = rest.landingPageUrl
    if (rest.safePageUrl !== undefined) updateData.safe_page_url = rest.safePageUrl
    if (rest.allowedCountries !== undefined) updateData.allowed_countries = rest.allowedCountries
    if (rest.blockedAdPlatforms !== undefined) updateData.blocked_ad_platforms = rest.blockedAdPlatforms
    if (rest.maxVisitLimit !== undefined) updateData.max_visit_limit = rest.maxVisitLimit
    if (rest.visitLimitTimeHours !== undefined) updateData.visit_limit_time_hours = rest.visitLimitTimeHours
    if (rest.isActive !== undefined) updateData.is_active = rest.isActive
    if (rest.cloakingEnabled !== undefined) updateData.cloaking_enabled = rest.cloakingEnabled

    const { data, error } = await supabaseAdmin
      .from("websites")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// ── DELETE: Remove website ─────────────────────────────────
export async function DELETE(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })

  const { error } = await supabaseAdmin.from("websites").delete().eq("id", id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: "Deleted successfully" })
}
