// ============================================================
// Helpers for presenting access_logs rows in the admin UI —
// parsing user-agents and turning raw guard reasons / actions
// into human-readable labels for the Click Log table.
// ============================================================

export function parseBrowser(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua) return "Unknown"
  if (/edg\//i.test(ua))                          return "Edge"
  if (/opr\/|opera/i.test(ua))                    return "Opera"
  if (/samsungbrowser/i.test(ua))                 return "Samsung Internet"
  if (/ucbrowser/i.test(ua))                      return "UC Browser"
  if (/firefox\/|fxios\//i.test(ua))              return "Firefox"
  if (/crios\//i.test(ua))                        return "Chrome"
  if (/chrome\//i.test(ua))                       return "Chrome"
  if (/version\/[\d.]+.*safari/i.test(ua))        return "Safari"
  if (/safari\//i.test(ua))                       return "Safari"
  if (/msie|trident/i.test(ua))                   return "Internet Explorer"
  if (/curl\//i.test(ua))                         return "curl"
  if (/wget/i.test(ua))                           return "Wget"
  if (/python-requests|python-urllib/i.test(ua))  return "Python"
  if (/postman/i.test(ua))                        return "Postman"
  if (/bot|crawler|spider|slurp|facebookexternalhit/i.test(ua)) return "Bot"
  return "Other"
}

export function parseOS(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua) return "Unknown"
  if (/windows nt 10/i.test(ua))   return "Windows 10/11"
  if (/windows nt 6\.3/i.test(ua)) return "Windows 8.1"
  if (/windows nt 6\.2/i.test(ua)) return "Windows 8"
  if (/windows nt 6\.1/i.test(ua)) return "Windows 7"
  if (/windows/i.test(ua))         return "Windows"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/android/i.test(ua))         return "Android"
  if (/mac os x/i.test(ua))        return "macOS"
  if (/cros/i.test(ua))            return "ChromeOS"
  if (/linux/i.test(ua))           return "Linux"
  return "Unknown"
}

export function parseDeviceType(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua) return "Unknown"
  if (/bot|crawler|spider/i.test(ua))      return "Bot"
  if (/ipad|tablet|kindle|playbook|silk/i.test(ua)) return "Tablet"
  if (/mobile|iphone|ipod|windows phone/i.test(ua)) return "Mobile"
  if (/android/i.test(ua))                 return "Tablet"
  return "Desktop"
}

// Strips protocol/path, keeping just the referring domain
export function getReferrerDomain(referrer: string | null | undefined): string {
  if (!referrer) return "Direct"
  try {
    return new URL(referrer).hostname.replace(/^www\./, "")
  } catch {
    return referrer.length > 30 ? `${referrer.slice(0, 30)}…` : referrer
  }
}

// Turns raw guard reason codes (e.g. "ad_platform_bot:facebook") into
// readable labels for the Click Log table
export function humanizeReason(reason: string | null | undefined): string {
  if (!reason) return "—"

  const knownReasons: Record<string, string> = {
    qualified_human:          "No Reason",
    campaign_paused:          "Campaign Paused",
    blocked_country:          "Geo Blocked",
    repeat_offender:          "Repeat Offender",
    proxy_headers_detected:   "Proxy Headers",
    vpn_detected:             "VPN Detected",
    proxy_detected:           "Proxy Detected",
    tor_exit_node:            "Tor Exit Node",
    datacenter_ip:            "Datacenter IP",
    human_reviewer:           "Ad Reviewer",
    error_failsafe:           "Error (Failsafe)",
    clean_ip:                 "No Reason",
  }
  if (knownReasons[reason]) return knownReasons[reason]

  if (reason.startsWith("bot:"))
    return `Bot: ${reason.slice(4).replace(/_/g, " ")}`
  if (reason.startsWith("ad_platform_bot:"))
    return `Ad Bot (${reason.split(":")[1]})`
  if (reason.startsWith("ad_platform_ip:"))
    return `Ad Platform IP (${reason.split(":")[1]})`
  if (reason.startsWith("ad_platform_referrer:"))
    return `Ad Referrer (${reason.split(":")[1]})`

  return reason.replace(/_/g, " ")
}

// Formats an ISO timestamp in a chosen timezone for display
export function formatLogDate(iso: string, timeZone: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  if (timeZone === "browser") {
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })
  }
  return d.toLocaleString("en-US", { timeZone, dateStyle: "medium", timeStyle: "medium" })
}
