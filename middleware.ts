import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { quickBotCheck } from "@/lib/advanced-bot-detection"

// These paths are PUBLIC — never filter them
const PUBLIC_PATHS = ["/login", "/signup", "/api", "/_next", "/favicon", "/safe", "/blocked", "/contact", "/robots"]
// Admin paths need auth check
const ADMIN_PATHS = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths + static files
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Admin paths: just pass through — auth is handled by the layout (client-side /api/auth/me check)
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // For public pages (homepage etc): only quick bot UA check
  const userAgent = request.headers.get("user-agent") || ""
  const isBot = quickBotCheck(userAgent)

  if (isBot) {
    // Fire & forget log
    const origin = request.nextUrl.origin
    fetch(`${origin}/api/log-current-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
        country: request.headers.get("x-vercel-ip-country") || "UNKNOWN",
        user_agent: userAgent,
        page_shown: "landing",
        is_bot: true,
        bot_type: "ua_pattern",
        action_taken: "stay_on_landing",
        pathname,
      }),
    }).catch(() => {})
    // Don't redirect bots from homepage — just let them see it
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
}
