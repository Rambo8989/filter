import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")
    let websiteIdNum: number | null = null

    // Fix websiteId parsing
    if (websiteId && websiteId !== "all") {
      websiteIdNum = Number.parseInt(websiteId)
      if (isNaN(websiteIdNum)) {
        websiteIdNum = null
      }
    }

    console.log("GET /api/real-time-data - Fetching real-time data", { websiteId })

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get active visitors (last 5 minutes)
    let activeQuery = supabaseAdmin
      .from("access_logs")
      .select("ip_address")
      .gte("created_at", fiveMinutesAgo.toISOString())

    if (websiteIdNum) {
      activeQuery = activeQuery.eq("website_id", websiteIdNum)
    }

    const { data: activeVisits, error: activeError } = await activeQuery

    if (activeError) {
      console.error("Error fetching active visitors:", activeError)
    }

    // Count unique IPs for active visitors
    const uniqueActiveIPs = new Set(activeVisits?.map((visit) => visit.ip_address) || [])
    const activeVisitors = uniqueActiveIPs.size

    // Get today's visits
    let todayQuery = supabaseAdmin.from("access_logs").select("is_bot").gte("created_at", todayStart.toISOString())

    if (websiteIdNum) {
      todayQuery = todayQuery.eq("website_id", websiteIdNum)
    }

    const { data: todayVisits, error: todayError } = await todayQuery

    if (todayError) {
      console.error("Error fetching today's visits:", todayError)
    }

    const visitsToday = todayVisits?.length || 0
    const automatedToday = todayVisits?.filter((visit) => visit.is_bot).length || 0
    const humanToday = visitsToday - automatedToday
    const conversionToday = visitsToday > 0 ? (humanToday / visitsToday) * 100 : 0

    // Get recent visits (last 10)
    let recentQuery = supabaseAdmin
      .from("access_logs")
      .select("created_at, country, is_bot, user_agent")
      .order("created_at", { ascending: false })
      .limit(10)

    if (websiteIdNum) {
      recentQuery = recentQuery.eq("website_id", websiteIdNum)
    }

    const { data: recentVisits, error: recentError } = await recentQuery

    if (recentError) {
      console.error("Error fetching recent visits:", recentError)
    }

    const recentVisitsFormatted =
      recentVisits?.map((visit) => ({
        timestamp: visit.created_at,
        country: visit.country || "Unknown",
        isAutomated: visit.is_bot,
        userAgent: visit.user_agent || "",
      })) || []

    const realTimeData = {
      activeVisitors,
      visitsToday,
      automatedToday,
      conversionToday: Number.parseFloat(conversionToday.toFixed(1)),
      recentVisits: recentVisitsFormatted,
    }

    return NextResponse.json({
      success: true,
      data: realTimeData,
    })
  } catch (error) {
    console.error("Error in GET /api/real-time-data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch real-time data" }, { status: 500 })
  }
}
