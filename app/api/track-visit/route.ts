import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { detectAdvancedBot } from "@/lib/advanced-bot-detection"
import { isDatacenterOrProxy } from "@/lib/datacenter-detection"
import { detectAdPlatform } from "@/lib/ad-platform-detection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      websiteId, userAgent = "", referrer = "", url = "/",
      clientBotDetection, detectedCountry: clientCountry = "UNKNOWN",
    } = body

    // ── Get real IP ───────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "127.0.0.1"

    // ── Country from Vercel/Cloudflare header ─────────────
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      clientCountry || "UNKNOWN"

    // ── Get website config ────────────────────────────────
    let website: any = null
    if (isSupabaseConfigured() && websiteId) {
      const { data } = await supabaseAdmin
        .from("websites").select("*").eq("id", Number(websiteId)).single()
      website = data
    }

    const config = website || {
      cloaking_enabled: true,
      allowed_countries: [],
      blocked_ad_platforms: [],
    }

    const selectedPlatforms: string[] = Array.isArray(config.blocked_ad_platforms)
      ? config.blocked_ad_platforms : []

    // ── Bot detection (UA + headers) ──────────────────────
    const headers: Record<string, string | null> = {
      "accept":          request.headers.get("accept"),
      "accept-language": request.headers.get("accept-language"),
      "accept-encoding": request.headers.get("accept-encoding"),
      "connection":      request.headers.get("connection"),
      "sec-fetch-site":  request.headers.get("sec-fetch-site"),
      "sec-fetch-mode":  request.headers.get("sec-fetch-mode"),
    }

    const serverBot = detectAdvancedBot(userAgent, headers, ip)
    const isBot = clientBotDetection?.isBot || serverBot.isBot
    const botType = clientBotDetection?.botType || serverBot.botType

    // ── Decision pipeline ─────────────────────────────────
    let action = "redirect_safe"
    let reason = "qualified_human"
    let page_shown = "safe"
    let detectedPlatformId: string | null = null
    let isDatacenterIP = false

    if (!config.cloaking_enabled) {
      action = "stay_on_landing"; reason = "campaign_paused"; page_shown = "landing"
    }
    else if (isBot) {
      // Check if it's specifically an ad platform bot
      const adCheck = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
      if (adCheck.detected) {
        detectedPlatformId = adCheck.platformId
        action = "stay_on_landing"; reason = `ad_platform_bot:${adCheck.platformId}`; page_shown = "landing"
      } else {
        action = "stay_on_landing"; reason = "bot_detected"; page_shown = "landing"
      }
    }
    else {
      // ── Datacenter/Proxy/VPN check ──────────────────────
      const dcResult = await isDatacenterOrProxy(ip)

      if (dcResult.blocked) {
        isDatacenterIP = true

        // Check if this datacenter IP belongs to a configured ad platform
        const adCheck = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
        if (adCheck.detected) {
          detectedPlatformId = adCheck.platformId
          reason = `ad_platform_ip:${adCheck.platformId}`
        } else {
          reason = dcResult.reason
        }
        action = "stay_on_landing"; page_shown = "landing"
      }
      else {
        // ── Country filter ────────────────────────────────
        if (
          Array.isArray(config.allowed_countries) &&
          config.allowed_countries.length > 0 &&
          country !== "UNKNOWN" &&
          !config.allowed_countries.includes(country)
        ) {
          action = "stay_on_landing"; reason = "blocked_country"; page_shown = "landing"
        }
        // ── Ad platform via referrer (non-datacenter) ─────
        else {
          const adCheck = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
          if (adCheck.detected && selectedPlatforms.includes(adCheck.platformId!)) {
            detectedPlatformId = adCheck.platformId
            action = "stay_on_landing"
            reason = `ad_platform_referrer:${adCheck.platformId}`
            page_shown = "landing"
          }
        }
      }
    }

    // ── Log to DB ─────────────────────────────────────────
    const logEntry = {
      website_id: websiteId ? Number(websiteId) : null,
      ip_address: ip, country, user_agent: userAgent,
      page_shown, is_bot: isBot || isDatacenterIP,
      bot_type: botType || (isDatacenterIP ? "datacenter" : null) || null,
      bot_confidence: serverBot.confidence || null,
      action_taken: action, reason,
      referrer: referrer || null,
      pathname: url || "/",
      ad_platform: detectedPlatformId,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      supabaseAdmin.from("access_logs").insert([logEntry])
        .then(({ error }) => { if (error) console.error("DB log error:", error) })
    }

    const emoji = isBot ? "🤖" : isDatacenterIP ? "🖥️" : detectedPlatformId ? "📢" : "✅"
    console.log(`[TrackVisit] ${emoji} | ${country} | ${reason} | ${ip}`)

    return NextResponse.json({ action, reason, page_shown })

  } catch (err) {
    console.error("track-visit error:", err)
    return NextResponse.json({ action: "redirect_safe", reason: "error_failsafe", page_shown: "safe" })
  }
}
