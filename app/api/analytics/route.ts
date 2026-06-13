import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { getSessionUser, getUserWebsiteIds } from "@/lib/session"

function getStartDate(timeRange: string): Date {
  const now = new Date()
  switch (timeRange) {
    case "1h":  now.setHours(now.getHours() - 1); break
    case "7d":  now.setDate(now.getDate() - 7); break
    case "30d": now.setDate(now.getDate() - 30); break
    default:    now.setDate(now.getDate() - 1) // 24h default
  }
  return now
}

export async function GET(request: NextRequest) {
  try {
    const auth = getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")
    const timeRange = searchParams.get("timeRange") || "24h"

    const empty = {
      success: true, totalVisits: 0, humanVisits: 0, automatedVisits: 0,
      blockedVisits: 0, conversionRate: 0,
      topCountries: [], botTypes: [], recentActivity: [], hourlyStats: [],
    }

    if (!isSupabaseConfigured()) return NextResponse.json(empty)

    const ownedIds = await getUserWebsiteIds(auth.userId)

    // Requested a specific campaign that isn't (or no longer is) this user's
    if (websiteId && websiteId !== "all" && !ownedIds.includes(Number(websiteId))) {
      return NextResponse.json(empty)
    }

    // User has no campaigns at all — nothing to show
    if ((!websiteId || websiteId === "all") && ownedIds.length === 0) {
      return NextResponse.json(empty)
    }

    const startDate = getStartDate(timeRange)
    let query = supabaseAdmin
      .from("access_logs")
      .select("id,ip_address,country,user_agent,is_bot,bot_type,action_taken,reason,page_shown,ad_platform,created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(2000)

    if (websiteId && websiteId !== "all") {
      query = query.eq("website_id", Number(websiteId))
    } else {
      query = query.in("website_id", ownedIds)
    }

    const { data: logs, error } = await query
    if (error) { console.error("Analytics error:", error); return NextResponse.json(empty) }

    const all = logs || []
    const totalVisits    = all.length
    const humanVisits    = all.filter(l => !l.is_bot).length
    const automatedVisits= all.filter(l => l.is_bot).length
    const blockedVisits  = all.filter(l => l.action_taken === "stay_on_landing").length
    const conversionRate = totalVisits > 0 ? +((humanVisits / totalVisits) * 100).toFixed(1) : 0

    // ── Top countries ─────────────────────────────────────
    const countryMap: Record<string, number> = {}
    all.forEach(l => { const c = l.country || "UNKNOWN"; countryMap[c] = (countryMap[c]||0) + 1 })
    const topCountries = Object.entries(countryMap)
      .map(([country, visits]) => ({ country, visits, percentage: totalVisits > 0 ? +((visits/totalVisits)*100).toFixed(1) : 0 }))
      .sort((a,b) => b.visits - a.visits).slice(0, 8)

    // ── Bot type breakdown ────────────────────────────────
    const botMap: Record<string, number> = {}
    all.filter(l => l.is_bot).forEach(l => {
      const t = l.bot_type || "Unknown Bot"
      botMap[t] = (botMap[t]||0) + 1
    })
    // Also count datacenter IPs
    all.filter(l => !l.is_bot && l.reason?.includes("datacenter")).forEach(l => {
      botMap["Datacenter IP"] = (botMap["Datacenter IP"]||0) + 1
    })
    const botTypes = Object.entries(botMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a,b) => b.count - a.count).slice(0, 10)

    // ── Recent activity ───────────────────────────────────
    const recentActivity = all.slice(0, 50).map(l => ({
      id: String(l.id),
      timestamp: l.created_at,
      ip: l.ip_address,
      country: l.country || "UNKNOWN",
      userAgent: l.user_agent || "",
      isBot: l.is_bot,
      botType: l.bot_type || null,
      action: l.action_taken || "unknown",
      reason: l.reason || null,
      pageShown: l.page_shown || "landing",
      adPlatform: l.ad_platform || null,
    }))

    // ── Hourly stats ──────────────────────────────────────
    const hourlyMap: Record<string, {humans:number; bots:number}> = {}
    all.forEach(l => {
      const hour = new Date(l.created_at).toISOString().slice(0, 13)
      if (!hourlyMap[hour]) hourlyMap[hour] = { humans: 0, bots: 0 }
      if (l.is_bot) hourlyMap[hour].bots++; else hourlyMap[hour].humans++
    })
    const hourlyStats = Object.entries(hourlyMap)
      .map(([hour, s]) => ({ hour, ...s }))
      .sort((a,b) => a.hour.localeCompare(b.hour))
      .slice(-48)

    return NextResponse.json({
      success: true, totalVisits, humanVisits, automatedVisits,
      blockedVisits, conversionRate, topCountries, botTypes,
      recentActivity, hourlyStats,
    })
  } catch (err) {
    console.error("Analytics error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
