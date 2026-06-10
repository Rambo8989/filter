import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Advanced ML-based bot detection patterns
const ML_BOT_PATTERNS = {
  // Search Engine Bots
  search_engines: [/googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i, /yandexbot/i],

  // Social Media Bots
  social_media: [/facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i],

  // Ad Verification Bots (Critical to block)
  ad_verification: [
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
  ],

  // Content Discovery Platforms
  content_discovery: [/taboola/i, /outbrain/i, /revcontent/i, /mgid/i, /zemanta/i, /content\.ad/i],

  // Generic Bot Patterns
  generic_bots: [
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
  ],
}

interface BotDetectionResult {
  isBot: boolean
  botType: string | null
  confidence: number
  category: string
  patterns_matched: string[]
  risk_score: number
}

function detectBotWithML(userAgent: string, ip: string, additionalData: any = {}): BotDetectionResult {
  const ua = userAgent.toLowerCase()
  let confidence = 0
  let botType = null
  let category = "unknown"
  const patterns_matched: string[] = []
  let risk_score = 0

  // Check each category of bot patterns
  for (const [categoryName, patterns] of Object.entries(ML_BOT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(ua)) {
        patterns_matched.push(pattern.source)

        // Assign confidence and category based on pattern type
        switch (categoryName) {
          case "search_engines":
            confidence = 0.95
            category = "search_engine"
            risk_score = 0.1 // Low risk - legitimate
            if (/googlebot/i.test(ua)) botType = "Googlebot"
            else if (/bingbot/i.test(ua)) botType = "Bingbot"
            else botType = "Search Engine Bot"
            break

          case "social_media":
            confidence = 0.9
            category = "social_media"
            risk_score = 0.2 // Low risk - legitimate
            if (/facebookexternalhit/i.test(ua)) botType = "Facebook Bot"
            else if (/twitterbot/i.test(ua)) botType = "Twitter Bot"
            else botType = "Social Media Bot"
            break

          case "ad_verification":
            confidence = 0.99
            category = "ad_verification"
            risk_score = 0.95 // Very high risk - must block
            if (/integral.*ad.*science/i.test(ua)) botType = "Integral Ad Science"
            else if (/doubleverify/i.test(ua)) botType = "DoubleVerify"
            else if (/moat/i.test(ua)) botType = "Moat"
            else botType = "Ad Verification Bot"
            break

          case "content_discovery":
            confidence = 0.85
            category = "content_discovery"
            risk_score = 0.7 // High risk
            if (/taboola/i.test(ua)) botType = "Taboola"
            else if (/outbrain/i.test(ua)) botType = "Outbrain"
            else botType = "Content Discovery Bot"
            break

          case "generic_bots":
            confidence = 0.8
            category = "generic_bot"
            risk_score = 0.6 // Medium-high risk
            if (/headless/i.test(ua)) botType = "Headless Browser"
            else if (/selenium/i.test(ua)) botType = "Selenium"
            else if (/puppeteer/i.test(ua)) botType = "Puppeteer"
            else botType = "Generic Bot"
            break
        }

        // Return immediately on first match for efficiency
        return {
          isBot: true,
          botType,
          confidence,
          category,
          patterns_matched,
          risk_score,
        }
      }
    }
  }

  // Additional ML-based checks for suspicious patterns
  let suspicion_score = 0

  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 20) {
    suspicion_score += 0.3
    patterns_matched.push("short_user_agent")
  }

  // Check for automation indicators
  if (ua.includes("headless") || ua.includes("phantom") || ua.includes("selenium")) {
    suspicion_score += 0.4
    patterns_matched.push("automation_tools")
  }

  // Check for unusual browser patterns
  if (!ua.includes("mozilla") && !ua.includes("chrome") && !ua.includes("safari") && !ua.includes("firefox")) {
    suspicion_score += 0.2
    patterns_matched.push("unusual_browser")
  }

  // If suspicion score is high enough, classify as bot
  if (suspicion_score >= 0.5) {
    return {
      isBot: true,
      botType: "Suspicious Bot",
      confidence: suspicion_score,
      category: "suspicious",
      patterns_matched,
      risk_score: suspicion_score,
    }
  }

  // Not a bot
  return {
    isBot: false,
    botType: null,
    confidence: 0,
    category: "human",
    patterns_matched: [],
    risk_score: 0,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAgent, ipAddress, additionalData } = body

    if (!userAgent) {
      return NextResponse.json({ success: false, error: "User agent is required" }, { status: 400 })
    }

    // Perform ML bot detection
    const detection = detectBotWithML(userAgent, ipAddress || "", additionalData || {})

    // Log the detection result
    console.log("🤖 ML Bot Detection Result:", {
      userAgent: userAgent.substring(0, 100),
      isBot: detection.isBot,
      botType: detection.botType,
      confidence: Math.round(detection.confidence * 100) + "%",
      category: detection.category,
      riskScore: Math.round(detection.risk_score * 100) + "%",
      patternsMatched: detection.patterns_matched.length,
    })

    // Store detection result in database if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabaseAdmin.from("bot_detections").insert([
          {
            user_agent: userAgent,
            ip_address: ipAddress || "unknown",
            is_bot: detection.isBot,
            bot_type: detection.botType,
            confidence: detection.confidence,
            category: detection.category,
            risk_score: detection.risk_score,
            patterns_matched: detection.patterns_matched,
            created_at: new Date().toISOString(),
          },
        ])
      } catch (dbError) {
        console.warn("Failed to store detection result:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isBot: detection.isBot,
        botType: detection.botType,
        confidence: detection.confidence,
        category: detection.category,
        riskScore: detection.risk_score,
        patternsMatched: detection.patterns_matched,
        recommendation: detection.risk_score > 0.7 ? "block" : detection.risk_score > 0.3 ? "monitor" : "allow",
      },
    })
  } catch (error) {
    console.error("Error in ML bot detection:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAgent = searchParams.get("userAgent")
    const ipAddress = searchParams.get("ipAddress")

    if (!userAgent) {
      return NextResponse.json({ success: false, error: "User agent parameter is required" }, { status: 400 })
    }

    const detection = detectBotWithML(userAgent, ipAddress || "")

    return NextResponse.json({
      success: true,
      data: detection,
    })
  } catch (error) {
    console.error("Error in GET ML bot detection:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
