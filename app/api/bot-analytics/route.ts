import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import jwt from "jsonwebtoken"

function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"
    const category = searchParams.get("category")

    if (!isSupabaseConfigured()) {
      // Return empty analytics for development
      return NextResponse.json({
        success: true,
        data: {
          totalPatterns: 0,
          activePatterns: 0,
          totalDetections: 0,
          avgConfidence: 0,
          topCategories: [],
          recentDetections: [],
          detectionTimeline: [],
        },
      })
    }

    // Calculate date range
    const now = new Date()
    const daysBack = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 7
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get bot pattern statistics
    const { data: patternStats, error: patternError } = await supabaseAdmin.rpc("get_bot_detection_stats")

    if (patternError) {
      console.error("Pattern stats error:", patternError)
      return NextResponse.json({
        success: true,
        data: {
          totalPatterns: 0,
          activePatterns: 0,
          totalDetections: 0,
          avgConfidence: 0,
          topCategories: [],
          recentDetections: [],
          detectionTimeline: [],
        },
      })
    }

    // Get category breakdown
    let categoryQuery = supabaseAdmin
      .from("bot_patterns")
      .select("category, detection_count, confidence")
      .eq("is_active", true)

    if (category) {
      categoryQuery = categoryQuery.eq("category", category)
    }

    const { data: categoryData, error: categoryError } = await categoryQuery

    if (categoryError) {
      console.error("Category data error:", categoryError)
    }

    // Group by category and calculate stats
    const categoryStats = (categoryData || []).reduce((acc: any, pattern: any) => {
      if (!acc[pattern.category]) {
        acc[pattern.category] = {
          category: pattern.category,
          patternCount: 0,
          totalDetections: 0,
          avgConfidence: 0,
          confidenceSum: 0,
        }
      }
      acc[pattern.category].patternCount += 1
      acc[pattern.category].totalDetections += pattern.detection_count || 0
      acc[pattern.category].confidenceSum += pattern.confidence || 0
      acc[pattern.category].avgConfidence = acc[pattern.category].confidenceSum / acc[pattern.category].patternCount
      return acc
    }, {})

    const topCategories = Object.values(categoryStats)
      .sort((a: any, b: any) => b.totalDetections - a.totalDetections)
      .slice(0, 10)

    // Get recent detections from access logs
    const { data: recentDetections, error: detectionsError } = await supabaseAdmin
      .from("access_logs")
      .select("*")
      .eq("is_bot", true)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(50)

    if (detectionsError) {
      console.error("Recent detections error:", detectionsError)
    }

    // Create detection timeline (hourly buckets)
    const timeline: any[] = []
    const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)

      const hourDetections = (recentDetections || []).filter((detection: any) => {
        const detectionTime = new Date(detection.created_at)
        return detectionTime >= hourStart && detectionTime < hourEnd
      })

      timeline.push({
        timestamp: hourStart.toISOString(),
        detections: hourDetections.length,
        hour: hourStart.getHours(),
      })
    }

    const stats = patternStats?.[0] || {
      total_patterns: 0,
      active_patterns: 0,
      total_detections: 0,
      avg_confidence: 0,
      top_category: null,
      last_detection: null,
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPatterns: stats.total_patterns || 0,
        activePatterns: stats.active_patterns || 0,
        totalDetections: stats.total_detections || 0,
        avgConfidence: stats.avg_confidence || 0,
        topCategories: topCategories,
        recentDetections: recentDetections || [],
        detectionTimeline: timeline,
        lastDetection: stats.last_detection,
        topCategory: stats.top_category,
      },
    })
  } catch (error) {
    console.error("Error fetching bot analytics:", error)
    return NextResponse.json({
      success: true,
      data: {
        totalPatterns: 0,
        activePatterns: 0,
        totalDetections: 0,
        avgConfidence: 0,
        topCategories: [],
        recentDetections: [],
        detectionTimeline: [],
      },
    })
  }
}
