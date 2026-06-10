import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      websiteId,
      ipAddress,
      country,
      userAgent,
      pageShown,
      isBot,
      botType,
      botConfidence,
      referrer,
      pathname,
      additionalData,
    } = body

    // Validate required fields
    if (!websiteId || !ipAddress || !userAgent) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: websiteId, ipAddress, userAgent" },
        { status: 400 },
      )
    }

    // Log to console for debugging
    console.log("📊 Access Log Request:", {
      websiteId,
      ip: ipAddress,
      country: country || "Unknown",
      page: pageShown || "unknown",
      bot: isBot ? `${botType || "Unknown Bot"} (${Math.round((botConfidence || 0) * 100)}%)` : "Human",
      path: pathname || "/",
      referrer: referrer || "Direct",
    })

    // Try to log to database if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // First, ensure we have a website record
        let websiteIdNum = Number.parseInt(websiteId.toString())
        if (isNaN(websiteIdNum)) {
          websiteIdNum = 1 // Default to 1 if invalid
        }

        // Check if website exists
        const { data: existingWebsite } = await supabaseAdmin
          .from("websites")
          .select("id")
          .eq("id", websiteIdNum)
          .maybeSingle()

        if (!existingWebsite) {
          // Create a default website if it doesn't exist
          const { data: newWebsite } = await supabaseAdmin
            .from("websites")
            .insert([
              {
                name: "Default Website",
                domain: "localhost:3000",
                landing_page_url: "/pricing",
                safe_page_url: "/safe",
                allowed_countries: ["US", "CA", "GB"],
                blocked_ad_platforms: ["facebook", "google"],
                max_visit_limit: 10,
                visit_limit_time_hours: 24,
                is_active: true,
                cloaking_enabled: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select("id")
            .single()

          if (newWebsite) {
            websiteIdNum = newWebsite.id
          }
        }

        // Insert access log
        const { data, error } = await supabaseAdmin
          .from("access_logs")
          .insert([
            {
              website_id: websiteIdNum,
              ip_address: ipAddress,
              country: country || "Unknown",
              user_agent: userAgent,
              page_shown: pageShown || "unknown",
              is_bot: isBot || false,
              bot_type: botType || null,
              bot_confidence: botConfidence || null,
              referrer: referrer || null,
              pathname: pathname || "/",
              action: isBot ? "blocked" : "allowed",
              created_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) {
          console.error("❌ Database insert error:", error)
          return NextResponse.json(
            {
              success: false,
              error: `Database error: ${error.message}`,
              logged: false,
            },
            { status: 500 },
          )
        }

        console.log("✅ Access logged to database successfully")

        return NextResponse.json({
          success: true,
          message: "Access logged successfully",
          logged: true,
          data: data?.[0] || null,
        })
      } catch (dbError) {
        console.error("❌ Database operation failed:", dbError)
        return NextResponse.json(
          {
            success: false,
            error: `Database operation failed: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
            logged: false,
          },
          { status: 500 },
        )
      }
    } else {
      console.log("⚠️ Supabase not configured, access logged to console only")
      return NextResponse.json({
        success: true,
        message: "Access logged to console (database not configured)",
        logged: false,
      })
    }
  } catch (error) {
    console.error("❌ Error in log-access API:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
        logged: false,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: "Database not configured",
        data: [],
      })
    }

    let query = supabaseAdmin.from("access_logs").select("*").order("created_at", { ascending: false }).limit(limit)

    if (websiteId && websiteId !== "all") {
      const websiteIdNum = Number.parseInt(websiteId)
      if (!isNaN(websiteIdNum)) {
        query = query.eq("website_id", websiteIdNum)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching access logs:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          data: [],
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("Error in GET access logs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: [],
      },
      { status: 500 },
    )
  }
}
