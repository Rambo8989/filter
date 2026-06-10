import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { generateCode, CODE_VARIANTS } from "@/lib/generate-tracking-code"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    jwt.verify(token, JWT_SECRET)

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")
    const variant   = searchParams.get("variant") || "html"

    if (!websiteId) return NextResponse.json({ success: false, error: "websiteId required" }, { status: 400 })

    const host   = request.headers.get("host") || "localhost:3000"
    const proto  = request.headers.get("x-forwarded-proto") || "https"
    const appUrl = `${proto}://${host}`

    let website: any = null
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin.from("websites").select("*").eq("id", Number(websiteId)).single()
      website = data
    }

    if (!website) {
      website = {
        id: websiteId, name: "My Website", domain: "example.com",
        landing_page_url: "https://example.com/landing",
        safe_page_url: "https://example.com/",
        allowed_countries: ["US","CA","GB"],
        blocked_ad_platforms: ["google","facebook"],
        max_visit_limit: 5, visit_limit_time_hours: 24, cloaking_enabled: true,
      }
    }

    const code = generateCode(variant, website, appUrl)
    const variantInfo = CODE_VARIANTS.find(v => v.id === variant)

    return NextResponse.json({
      success: true, code, variant,
      filename: `tfp-filter.${variantInfo?.ext || "html"}`,
      appUrl,
    })
  } catch (err) {
    console.error("get-tracking-code error:", err)
    return NextResponse.json({ success: false, error: "Failed to generate code" }, { status: 500 })
  }
}
