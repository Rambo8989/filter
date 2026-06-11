// ============================================================
// Helpers for presenting access_logs rows in the admin UI —
// parsing user-agents and turning raw guard reasons / actions
// into human-readable labels for the Click Log table.
// ============================================================

// Non-browser HTTP clients / scripts — these carry no real browser, OS,
// or device info, so they get their own labels instead of being
// misreported as "Other"/"Unknown"/"Desktop"
const SCRIPT_UA_MAP: Array<[RegExp, string]> = [
  [/^node$|node-fetch|undici/i, "Node.js (Script)"],
  [/axios/i,                    "Axios (Script)"],
  [/go-http-client/i,           "Go HTTP Client"],
  [/okhttp/i,                   "OkHttp (Script)"],
  [/java\//i,                   "Java (Script)"],
  [/libwww-perl/i,              "Perl LWP (Script)"],
  [/apache-httpclient/i,        "Apache HttpClient"],
  [/scrapy/i,                   "Scrapy (Script)"],
  [/^php\b|php\//i,             "PHP (Script)"],
]

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
  for (const [pattern, label] of SCRIPT_UA_MAP) {
    if (pattern.test(ua)) return label
  }
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
  if (/curl\/|wget|python-|postman/i.test(ua)) return "—"
  for (const [pattern] of SCRIPT_UA_MAP) {
    if (pattern.test(ua)) return "—"
  }
  return "Unknown"
}

export function parseDeviceType(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua) return "Unknown"
  if (/bot|crawler|spider/i.test(ua))      return "Bot"
  if (/curl\/|wget|python-|postman/i.test(ua)) return "Bot"
  for (const [pattern] of SCRIPT_UA_MAP) {
    if (pattern.test(ua)) return "Bot"
  }
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

// Extracts the primary tag from an Accept-Language header
// (e.g. "en-US,en;q=0.9" -> "en-US")
export function parseAcceptLanguage(header: string | null | undefined): string | null {
  if (!header) return null
  const primary = header.split(",")[0]?.split(";")[0]?.trim()
  return primary || null
}

// Best-effort device brand from the user-agent string
export function parseDeviceBrand(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua) return "—"
  if (/ipad|iphone|ipod|macintosh/i.test(ua)) return "Apple"
  if (/sm-|samsung|galaxy/i.test(ua))         return "Samsung"
  if (/pixel/i.test(ua))                      return "Google"
  if (/redmi|poco|xiaomi|mi\s\d/i.test(ua))   return "Xiaomi"
  if (/oneplus/i.test(ua))                    return "OnePlus"
  if (/huawei|honor/i.test(ua))               return "Huawei"
  if (/oppo|cph\d/i.test(ua))                 return "OPPO"
  if (/vivo/i.test(ua))                       return "vivo"
  if (/moto/i.test(ua))                       return "Motorola"
  if (/\blg-|\blge?\b/i.test(ua))             return "LG"
  if (/nokia/i.test(ua))                      return "Nokia"
  if (/realme/i.test(ua))                     return "Realme"
  if (/windows phone/i.test(ua))              return "Microsoft"
  if (/windows/i.test(ua))                    return "PC"
  if (/linux/i.test(ua))                      return "Generic"
  return "—"
}

// Best-effort device model from the user-agent string. Reliable for
// iOS (Apple reports a fixed string); for Android, extracts the model
// token reported between "Android X;" and the next "Build/" or ")".
export function parseDeviceModel(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua) return "—"
  if (/ipad/i.test(ua))      return "iPad"
  if (/iphone/i.test(ua))    return "iPhone"
  if (/ipod/i.test(ua))      return "iPod Touch"
  if (/macintosh/i.test(ua)) return "Mac"

  const androidMatch = ua.match(/Android[^;]*;\s*([^);]+?)(?:\s+Build\/[^)]*)?\)/i)
  if (androidMatch?.[1]) {
    const model = androidMatch[1].trim()
    if (model && !/^wv$/i.test(model)) return model
  }

  if (/windows phone/i.test(ua)) return "Windows Phone"
  if (/windows|linux/i.test(ua)) return "PC"
  return "—"
}

// Carrier is only meaningful for mobile connections — for those, the
// ISP returned by IP geolocation is usually the mobile carrier name
export function getCarrier(isp: string | null | undefined, userAgent: string | null | undefined): string {
  if (!isp) return "—"
  if (parseDeviceType(userAgent) !== "Mobile") return "—"
  return isp
}

// Best-effort country -> primary IANA timezone mapping. Countries that
// span multiple timezones (US, RU, CA, AU, BR, etc.) map to their most
// populous/primary zone — treat as approximate.
const COUNTRY_TIMEZONES: Record<string, string> = {
  US: "America/New_York", CA: "America/Toronto", MX: "America/Mexico_City",
  BR: "America/Sao_Paulo", AR: "America/Argentina/Buenos_Aires", CL: "America/Santiago",
  CO: "America/Bogota", PE: "America/Lima", VE: "America/Caracas",
  GB: "Europe/London", IE: "Europe/Dublin", FR: "Europe/Paris", DE: "Europe/Berlin",
  IT: "Europe/Rome", ES: "Europe/Madrid", PT: "Europe/Lisbon", NL: "Europe/Amsterdam",
  BE: "Europe/Brussels", CH: "Europe/Zurich", AT: "Europe/Vienna", SE: "Europe/Stockholm",
  NO: "Europe/Oslo", DK: "Europe/Copenhagen", FI: "Europe/Helsinki", PL: "Europe/Warsaw",
  CZ: "Europe/Prague", GR: "Europe/Athens", RO: "Europe/Bucharest", HU: "Europe/Budapest",
  RU: "Europe/Moscow", UA: "Europe/Kyiv", TR: "Europe/Istanbul",
  IL: "Asia/Jerusalem", AE: "Asia/Dubai", SA: "Asia/Riyadh", QA: "Asia/Qatar", KW: "Asia/Kuwait",
  EG: "Africa/Cairo", ZA: "Africa/Johannesburg", NG: "Africa/Lagos", KE: "Africa/Nairobi",
  MA: "Africa/Casablanca",
  IN: "Asia/Kolkata", PK: "Asia/Karachi", BD: "Asia/Dhaka", LK: "Asia/Colombo", NP: "Asia/Kathmandu",
  JP: "Asia/Tokyo", KR: "Asia/Seoul", CN: "Asia/Shanghai", HK: "Asia/Hong_Kong", TW: "Asia/Taipei",
  SG: "Asia/Singapore", MY: "Asia/Kuala_Lumpur", TH: "Asia/Bangkok", VN: "Asia/Ho_Chi_Minh",
  PH: "Asia/Manila", ID: "Asia/Jakarta", KH: "Asia/Phnom_Penh", MM: "Asia/Yangon",
  AU: "Australia/Sydney", NZ: "Pacific/Auckland",
}

export function getCountryTimezone(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null
  return COUNTRY_TIMEZONES[countryCode.toUpperCase()] || null
}

// UTC offset for a given IANA timezone (e.g. "UTC+05:30")
export function getTimezoneOffset(timeZone: string | null, date: Date = new Date()): string {
  if (!timeZone) return "—"
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(date)
    const part = parts.find((p) => p.type === "timeZoneName")
    return part?.value.replace("GMT", "UTC") || "—"
  } catch {
    return "—"
  }
}
