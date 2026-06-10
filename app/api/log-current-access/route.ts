import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!isSupabaseConfigured()) {
      // Silently succeed — middleware will still work without DB
      return NextResponse.json({ success: true, mode: "no-db" })
    }

    const logEntry = {
      website_id: body.website_id || null,
      ip_address: body.ip_address || "unknown",
      country: body.country || "UNKNOWN",
      user_agent: body.user_agent || "",
      page_shown: body.page_shown || "landing",
      is_bot: body.is_bot ?? false,
      bot_type: body.bot_type || null,
      bot_confidence: body.bot_confidence || null,
      action_taken: body.action || body.action_taken || "unknown",
      reason: body.reason || null,
      referrer: body.referrer || null,
      pathname: body.pathname || "/",
      created_at: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin.from("access_logs").insert([logEntry])

    if (error) {
      console.error("log-current-access error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("log-current-access exception:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
