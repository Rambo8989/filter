import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { detectAdvancedBot } from "@/lib/advanced-bot-detection"
import { isDatacenterOrProxy, detectProxyHeaders, type IPAnalysis } from "@/lib/datacenter-detection"
import { detectAdPlatform } from "@/lib/ad-platform-detection"
import { parseAcceptLanguage } from "@/lib/log-format"
import {
  getIPReputation,
  markIPBlocked,
  markIPClean,
  isRepeatOffender,
} from "@/lib/ip-reputation"

// Without a protocol, browsers/redirects treat "google.com" as a path on the
// current domain (e.g. limbun.online/google.com) instead of redirecting away
function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      websiteId, campaignCode, userAgent = "", referrer = "", url = "/",
      clientBotDetection, detectedCountry: clientCountry = "UNKNOWN",
    } = body

    // ── Extract real IP (handles Cloudflare, Vercel, plain) ──
    const rawXFF = request.headers.get("x-forwarded-for") || ""
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip")        ||
      rawXFF.split(",")[0]?.trim()             ||
      "127.0.0.1"

    // ── Country ───────────────────────────────────────────────
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry")        ||
      request.headers.get("x-country")           ||
      clientCountry || "UNKNOWN"

    // ── Build full header map ─────────────────────────────────
    const headers: Record<string, string | null> = {
      "accept":           request.headers.get("accept"),
      "accept-language":  request.headers.get("accept-language"),
      "accept-encoding":  request.headers.get("accept-encoding"),
      "connection":       request.headers.get("connection"),
      "sec-fetch-site":   request.headers.get("sec-fetch-site"),
      "sec-fetch-mode":   request.headers.get("sec-fetch-mode"),
      "via":              request.headers.get("via"),
      "proxy-connection": request.headers.get("proxy-connection"),
      "x-forwarded-for":  rawXFF || null,
      "x-real-ip":        request.headers.get("x-real-ip"),
    }

    // ── Load website config — by websiteId OR campaignCode ───
    let website: any = null
    if (isSupabaseConfigured()) {
      if (campaignCode) {
        const { data } = await supabaseAdmin
          .from("websites").select("*").eq("campaign_code", campaignCode).single()
        website = data
      } else if (websiteId) {
        const { data } = await supabaseAdmin
          .from("websites").select("*").eq("id", Number(websiteId)).single()
        website = data
      }
    }

    const config = website || {
      cloaking_enabled: true,
      allowed_countries: [],
      blocked_ad_platforms: [],
    }

    const selectedPlatforms: string[] = Array.isArray(config.blocked_ad_platforms)
      ? config.blocked_ad_platforms : []

    // ── Decision pipeline ─────────────────────────────────────
    let action = "redirect_money"     // default: send to money page
    let reason = "qualified_human"
    let page_shown = "money"
    let detectedPlatformId: string | null = null
    let isBlockedIP = false
    let blockCategory = ""
    let geoAnalysis: IPAnalysis | null = null

    const stay = (r: string, cat: string) => {
      action = "stay_on_safe"; reason = r; page_shown = "safe"
      isBlockedIP = true; blockCategory = cat
    }

    // ── Guard 0: Campaign paused ──────────────────────────────
    if (!config.cloaking_enabled) {
      action = "stay_on_safe"; reason = "campaign_paused"; page_shown = "safe"

    // ── Guard 1: Repeat offender cache hit (instant, no API) ─
    } else if (isRepeatOffender(ip)) {
      stay("repeat_offender", "repeat")

    // ── Guard 2: IP reputation cache hit ─────────────────────
    } else {
      const cached = getIPReputation(ip)
      if (cached?.blocked) {
        stay(cached.reason, cached.category)
      } else {
        // ── Guard 3: Proxy header chain ───────────────────────
        const proxyCheck = detectProxyHeaders(headers)
        if (proxyCheck.isProxy) {
          markIPBlocked(ip, "proxy_headers", "proxy")
          stay("proxy_headers_detected", "proxy")
        }

        // ── Guard 4: Bot detection (UA + header analysis) ─────
        if (!isBlockedIP) {
          const serverBot = detectAdvancedBot(userAgent, headers, ip)
          const isBot = clientBotDetection?.isBot || serverBot.isBot
          const botType = clientBotDetection?.botType || serverBot.botType

          if (isBot) {
            markIPBlocked(ip, `bot:${botType || "unknown"}`, "bot")
            const adCheck = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
            if (adCheck.detected) {
              detectedPlatformId = adCheck.platformId
              stay(`ad_platform_bot:${adCheck.platformId}`, "bot")
            } else {
              stay(`bot:${botType || "unknown"}`, "bot")
            }
          }
        }

        // ── Guard 5: Datacenter / VPN / TOR / Human reviewer ─
        if (!isBlockedIP) {
          const dcResult = await isDatacenterOrProxy(ip)
          geoAnalysis = dcResult.analysis

          if (dcResult.blocked) {
            const cat = dcResult.analysis.isTor         ? "tor"
                      : dcResult.analysis.isHumanReviewer ? "reviewer"
                      : dcResult.analysis.isVPN          ? "vpn"
                      : dcResult.analysis.isProxy        ? "proxy"
                      : "datacenter"

            markIPBlocked(ip, dcResult.reason, cat as any)

            const adCheck = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
            if (adCheck.detected) {
              detectedPlatformId = adCheck.platformId
              stay(`ad_platform_ip:${adCheck.platformId}`, cat)
            } else {
              stay(dcResult.reason, cat)
            }
          }
        }

        // ── Guard 6: Country filter ───────────────────────────
        if (!isBlockedIP) {
          if (
            Array.isArray(config.allowed_countries) &&
            config.allowed_countries.length > 0 &&
            country !== "UNKNOWN" &&
            !config.allowed_countries.includes(country)
          ) {
            stay("blocked_country", "geo")
          }
        }

        // ── Guard 7: Ad platform referrer (non-datacenter) ───
        if (!isBlockedIP) {
          const adCheck = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
          if (adCheck.detected && selectedPlatforms.includes(adCheck.platformId!)) {
            detectedPlatformId = adCheck.platformId
            stay(`ad_platform_referrer:${adCheck.platformId}`, "reviewer")
          }
        }

        // ── Passed all guards: real human ─────────────────────
        if (!isBlockedIP) {
          markIPClean(ip)
        }
      }
    }

    // ── Log to DB ─────────────────────────────────────────────
    const logEntry = {
      website_id:     websiteId ? Number(websiteId) : null,
      ip_address:     ip,
      country,
      user_agent:     userAgent,
      page_shown,
      is_bot:         isBlockedIP,
      bot_type:       blockCategory || null,
      bot_confidence: null,
      action_taken:   action,
      reason,
      referrer:       referrer || null,
      pathname:       url || "/",
      ad_platform:    detectedPlatformId,
      region:         geoAnalysis && geoAnalysis.region !== "Unknown" ? geoAnalysis.region : null,
      city:           geoAnalysis && geoAnalysis.city !== "Unknown" ? geoAnalysis.city : null,
      isp:            geoAnalysis && geoAnalysis.isp !== "Unknown" ? geoAnalysis.isp : null,
      organization:   geoAnalysis && geoAnalysis.org !== "Unknown" ? geoAnalysis.org : null,
      asn:            geoAnalysis?.asn || null,
      language:       parseAcceptLanguage(headers["accept-language"]),
      created_at:     new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      supabaseAdmin.from("access_logs").insert([logEntry])
        .then(({ error }: { error: unknown }) => { if (error) console.error("DB log error:", error) })
    }

    const tag = page_shown === "money" ? "✅" : blockCategory === "bot" ? "🤖"
              : blockCategory === "vpn" ? "🔒" : blockCategory === "tor" ? "☠️"
              : blockCategory === "reviewer" ? "👁️" : blockCategory === "datacenter" ? "🖥️"
              : blockCategory === "proxy" ? "🔄" : "🚫"
    console.log(`[TrackVisit] ${tag} | ${country} | ${reason} | ${ip}`)

    const redirectUrl = (action === "redirect_money" && website?.landing_page_url)
      ? normalizeUrl(website.landing_page_url) : null

    return NextResponse.json({ action, reason, page_shown, redirectUrl })

  } catch (err) {
    console.error("track-visit error:", err)
    // Fail open — on error let the visitor through rather than blocking everyone
    return NextResponse.json({ action: "redirect_money", reason: "error_failsafe", page_shown: "money", redirectUrl: null })
  }
}
