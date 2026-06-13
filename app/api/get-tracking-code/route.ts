import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { generateCode, CODE_VARIANTS } from "@/lib/generate-tracking-code"
import { getSessionUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const auth = getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")
    const variant   = searchParams.get("variant") || "html"

    if (!websiteId) return NextResponse.json({ success: false, error: "websiteId required" }, { status: 400 })

    const host   = request.headers.get("host") || "localhost:3000"
    const proto  = request.headers.get("x-forwarded-proto") || "https"
    const appUrl = process.env.APP_URL || `${proto}://${host}`

    let website: any = null
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin.from("websites").select("*").eq("id", Number(websiteId)).eq("user_id", auth.userId).single()
      website = data

      if (!website) {
        return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 })
      }
    } else {
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
