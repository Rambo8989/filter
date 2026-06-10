// Advanced bot detection patterns and utilities
export const BOT_PATTERNS = [
  // Search Engine Bots
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,

  // Ad Verification Bots (CRITICAL - These must be blocked)
  /integral.*ad.*science/i,
  /doubleverify/i,
  /moat/i,
  /grapeshot/i,
  /adsystem/i,
  /adnxs/i,
  /adsbot/i,
  /adbeat/i,
  /adform/i,
  /adsense/i,

  // Content Discovery & Native Ad Platforms
  /taboola/i,
  /outbrain/i,
  /revcontent/i,
  /mgid/i,
  /zemanta/i,
  /content\.ad/i,

  // Generic Bot Patterns
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i,
]

export interface BotDetectionResult {
  isBot: boolean
  botType: string | null
  confidence: number
  category: string
  pattern?: string
}

export function detectBot(userAgent: string, _ip?: string): BotDetectionResult {
  const ua = userAgent.toLowerCase()

  // Check for bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      // Identify specific bot type and category
      if (/googlebot/i.test(ua))
        return {
          isBot: true,
          botType: "Googlebot",
          confidence: 0.95,
          category: "search_engine",
          pattern: pattern.source,
        }
      if (/bingbot/i.test(ua))
        return {
          isBot: true,
          botType: "Bingbot",
          confidence: 0.95,
          category: "search_engine",
          pattern: pattern.source,
        }
      if (/facebookexternalhit/i.test(ua))
        return {
          isBot: true,
          botType: "Facebook Bot",
          confidence: 0.9,
          category: "social_media",
          pattern: pattern.source,
        }
      if (/integral.*ad.*science/i.test(ua))
        return {
          isBot: true,
          botType: "Integral Ad Science",
          confidence: 0.99,
          category: "ad_verification",
          pattern: pattern.source,
        }
      if (/doubleverify/i.test(ua))
        return {
          isBot: true,
          botType: "DoubleVerify",
          confidence: 0.99,
          category: "ad_verification",
          pattern: pattern.source,
        }
      if (/moat/i.test(ua))
        return {
          isBot: true,
          botType: "Moat",
          confidence: 0.99,
          category: "ad_verification",
          pattern: pattern.source,
        }
      if (/taboola/i.test(ua))
        return {
          isBot: true,
          botType: "Taboola",
          confidence: 0.85,
          category: "content_discovery",
          pattern: pattern.source,
        }
      if (/outbrain/i.test(ua))
        return {
          isBot: true,
          botType: "Outbrain",
          confidence: 0.85,
          category: "content_discovery",
          pattern: pattern.source,
        }

      return {
        isBot: true,
        botType: "Unknown Bot",
        confidence: 0.7,
        category: "unknown",
        pattern: pattern.source,
      }
    }
  }

  // Additional checks for suspicious patterns
  if (ua.includes("headless") || ua.includes("phantom") || ua.includes("selenium")) {
    return {
      isBot: true,
      botType: "Automation Tool",
      confidence: 0.8,
      category: "automation",
      pattern: "automation_tools",
    }
  }

  return {
    isBot: false,
    botType: null,
    confidence: 0,
    category: "human",
  }
}

export function analyzeUserAgent(userAgent: string): {
  browser: string
  os: string
  device: string
  suspicious: boolean
} {
  const ua = userAgent.toLowerCase()

  // Browser detection
  let browser = "Unknown"
  if (ua.includes("chrome")) browser = "Chrome"
  else if (ua.includes("firefox")) browser = "Firefox"
  else if (ua.includes("safari")) browser = "Safari"
  else if (ua.includes("edge")) browser = "Edge"
  else if (ua.includes("opera")) browser = "Opera"

  // OS detection
  let os = "Unknown"
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac")) os = "macOS"
  else if (ua.includes("linux")) os = "Linux"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("ios")) os = "iOS"

  // Device detection
  let device = "Desktop"
  if (ua.includes("mobile")) device = "Mobile"
  else if (ua.includes("tablet")) device = "Tablet"

  // Suspicious patterns
  const suspicious =
    ua.includes("headless") ||
    ua.includes("phantom") ||
    ua.includes("selenium") ||
    ua.includes("webdriver") ||
    ua.includes("bot") ||
    ua.includes("crawler") ||
    ua.includes("spider")

  return { browser, os, device, suspicious }
}

export function getCountryFromTimezone(timezone: string): string {
  const timezoneToCountry: Record<string, string> = {
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Europe/Rome": "IT",
    "Europe/Madrid": "ES",
    "Europe/Amsterdam": "NL",
    "Asia/Tokyo": "JP",
    "Asia/Shanghai": "CN",
    "Asia/Seoul": "KR",
    "Asia/Hong_Kong": "HK",
    "Asia/Singapore": "SG",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
  }

  return timezoneToCountry[timezone] || "unknown"
}


export function calculateRiskScore(userAgent: string, _ip: string, referrer: string, country: string): number {
  let score = 0

  // Bot detection adds high risk
  const botResult = detectBot(userAgent, _ip)
  if (botResult.isBot) {
    score += botResult.confidence * 100
  }

  // User agent analysis
  const uaAnalysis = analyzeUserAgent(userAgent)
  if (uaAnalysis.suspicious) {
    score += 30
  }

  // Only penalize completely missing referrer for non-direct traffic
  if (!referrer) {
    score += 5
  }

  // High-risk countries (example)
  const highRiskCountries = ["CN", "RU", "KP", "IR"]
  if (highRiskCountries.includes(country)) {
    score += 20
  }

  return Math.min(score, 100) // Cap at 100
}

// Main bot detector object for export
export const botDetector = {
  detectBot,
  analyzeUserAgent,
  calculateRiskScore,
  BOT_PATTERNS,
}

// Default export
export default botDetector
