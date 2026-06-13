import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { getSessionUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const auth = getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          totalWebsites: 0, activeWebsites: 0,
          totalVisits24h: 0, humanVisits24h: 0, botVisits24h: 0,
          blockedToday: 0, humanRate: 0, websites: [],
        },
        message: "Database not configured — connect Supabase to see real data",
      })
    }

    const websitesRes = await supabaseAdmin
      .from("websites")
      .select("*")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })

    const websites = websitesRes.data || []
    const websiteIds = websites.map((w: any) => w.id)

    const logsRes = websiteIds.length > 0
      ? await supabaseAdmin
          .from("access_logs")
          .select("is_bot, action_taken, created_at")
          .in("website_id", websiteIds)
          .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      : { data: [] }

    const logs = logsRes.data || []

    const totalVisits24h = logs.length
    const humanVisits24h = logs.filter(l => !l.is_bot).length
    const botVisits24h = logs.filter(l => l.is_bot).length
    const blockedToday = logs.filter(l => l.action_taken === "stay_on_landing").length
    const humanRate = totalVisits24h > 0 ? +((humanVisits24h / totalVisits24h) * 100).toFixed(1) : 0

    return NextResponse.json({
      success: true,
      data: {
        totalWebsites: websites.length,
        activeWebsites: websites.filter((w: any) => w.is_active).length,
        totalVisits24h,
        humanVisits24h,
        botVisits24h,
        blockedToday,
        humanRate,
        websites: websites.slice(0, 5),
      },
    })
  } catch (err) {
    console.error("dashboard-data error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
