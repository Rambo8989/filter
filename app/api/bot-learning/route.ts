import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { botDetector } from "@/lib/bot-detection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, pattern, category, confidence, userAgent, ipAddress } = body

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      )
    }

    switch (action) {
      case "add_pattern":
        if (!pattern || !category || confidence === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: pattern, category, confidence",
            },
            { status: 400 },
          )
        }

        const success = await botDetector.addPattern(pattern, category, confidence)
        return NextResponse.json({
          success,
          message: success ? "Pattern added successfully" : "Failed to add pattern",
        })

      case "analyze_user_agent":
        if (!userAgent) {
          return NextResponse.json(
            {
              success: false,
              error: "User agent is required",
            },
            { status: 400 },
          )
        }

        const detection = await botDetector.detectBot(userAgent, ipAddress)
        return NextResponse.json({
          success: true,
          detection,
        })

      case "bulk_analyze":
        const { userAgents } = body
        if (!Array.isArray(userAgents)) {
          return NextResponse.json(
            {
              success: false,
              error: "userAgents must be an array",
            },
            { status: 400 },
          )
        }

        const results = []
        for (const ua of userAgents) {
          const result = await botDetector.detectBot(ua)
          results.push({
            userAgent: ua,
            detection: result,
          })
        }

        return NextResponse.json({
          success: true,
          results,
        })

      case "train_from_logs":
        // Analyze recent logs to discover new patterns
        const { data: recentLogs, error } = await supabaseAdmin
          .from("access_logs")
          .select("user_agent, is_bot, bot_type")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .not("user_agent", "is", null)
          .limit(1000)

        if (error) {
          return NextResponse.json(
            {
              success: false,
              error: error.message,
            },
            { status: 400 },
          )
        }

        let newPatternsFound = 0
        const potentialBots = recentLogs?.filter((log) => log.is_bot) || []

        for (const log of potentialBots) {
          // Extract potential patterns from user agent
          const patterns = extractPatternsFromUserAgent(log.user_agent)

          for (const extractedPattern of patterns) {
            // Check if pattern already exists
            const { data: existing } = await supabaseAdmin
              .from("bot_patterns")
              .select("id")
              .eq("pattern", extractedPattern)
              .single()

            if (!existing) {
              // Add new pattern
              const { error: insertError } = await supabaseAdmin.from("bot_patterns").insert({
                pattern: extractedPattern,
                category: "auto_discovered",
                confidence: 0.7,
                detection_count: 1,
                last_seen: new Date().toISOString(),
                is_active: true,
                auto_added: true,
                learning_source: "log_analysis",
              })

              if (!insertError) {
                newPatternsFound++
              }
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Training completed. Found ${newPatternsFound} new patterns.`,
          newPatternsFound,
          logsAnalyzed: recentLogs?.length || 0,
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Error in bot learning API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      )
    }

    switch (action) {
      case "get_patterns":
        const { data: patterns, error } = await supabaseAdmin
          .from("bot_patterns")
          .select("*")
          .order("confidence", { ascending: false })
          .order("detection_count", { ascending: false })

        if (error) {
          return NextResponse.json(
            {
              success: false,
              error: error.message,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          patterns: patterns || [],
          total: patterns?.length || 0,
        })

      case "get_stats":
        const { data: stats } = await supabaseAdmin.rpc("get_bot_learning_stats")

        return NextResponse.json({
          success: true,
          stats: stats || {
            total_patterns: 0,
            active_patterns: 0,
            auto_added_patterns: 0,
            categories: [],
            recent_detections: 0,
          },
        })

      case "get_recent_updates":
        const { data: updates, error: updatesError } = await supabaseAdmin
          .from("bot_update_logs")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(10)

        if (updatesError) {
          return NextResponse.json(
            {
              success: false,
              error: updatesError.message,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          updates: updates || [],
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Error in bot learning GET API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

function extractPatternsFromUserAgent(userAgent: string): string[] {
  const patterns: string[] = []
  const lowerUA = userAgent.toLowerCase()

  // Extract bot-like keywords
  const botKeywords = ["bot", "crawler", "spider", "scraper", "fetcher", "monitor", "checker", "validator", "analyzer"]

  for (const keyword of botKeywords) {
    if (lowerUA.includes(keyword)) {
      patterns.push(keyword)
    }
  }

  // Extract company/service names that might be bots
  const companyPatterns = userAgent.match(/\b[a-z]+bot\b/gi) || []
  patterns.push(...companyPatterns.map((p) => p.toLowerCase()))

  // Extract service patterns like "ServiceName/1.0"
  const servicePatterns = userAgent.match(/\b[a-z]+\/\d+\.\d+\b/gi) || []
  patterns.push(...servicePatterns.map((p) => p.split("/")[0].toLowerCase()))

  // Extract parenthetical content that might indicate bots
  const parentheticalContent = userAgent.match(/$$[^)]+$$/g) || []
  for (const content of parentheticalContent) {
    const cleaned = content.replace(/[()]/g, "").toLowerCase()
    if (cleaned.includes("bot") || cleaned.includes("crawler") || cleaned.includes("spider")) {
      patterns.push(cleaned)
    }
  }

  return [...new Set(patterns)] // Remove duplicates
}
