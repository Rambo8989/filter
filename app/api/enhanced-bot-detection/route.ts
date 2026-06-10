import { type NextRequest, NextResponse } from "next/server"
import { EnhancedBotDetector } from "@/lib/enhanced-bot-detection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAgent, referrer, ip, blockedPlatforms = [] } = body

    if (!userAgent) {
      return NextResponse.json(
        {
          success: false,
          error: "User agent is required",
        },
        { status: 400 },
      )
    }

    // Perform bot detection
    const detectionResult = await EnhancedBotDetector.detectBot(userAgent, referrer, ip)

    // Determine if should block
    const shouldBlock = EnhancedBotDetector.shouldBlock(detectionResult, blockedPlatforms)

    return NextResponse.json({
      success: true,
      data: {
        ...detectionResult,
        shouldBlock,
        blockedPlatforms,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Enhanced bot detection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Bot detection failed",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Return available platforms for blocking
    const platforms = Object.keys(EnhancedBotDetector["AD_PLATFORM_PATTERNS"])

    return NextResponse.json({
      success: true,
      data: {
        availablePlatforms: platforms,
        categories: {
          search: ["google", "bing", "yahoo", "yandex", "baidu"],
          social: ["facebook", "twitter", "linkedin", "pinterest", "snapchat", "tiktok", "reddit"],
          display: ["amazon", "criteo", "outbrain", "taboola", "revcontent"],
          programmatic: ["thetradedesk", "adobe", "mediamath"],
          mobile: ["admob", "unity", "applovin", "ironsource", "chartboost"],
          affiliate: ["commission_junction", "shareasale", "clickbank", "rakuten"],
          native: ["nativo", "sharethrough"],
          regional: ["vk_ads", "wechat_ads", "line_ads"],
          pop_push: [
            "propellerads",
            "popads",
            "popcash",
            "adsterra",
            "hilltopads",
            "popunder",
            "clickadu",
            "pushground",
            "richpush",
            "pushwelcome",
            "megapush",
            "pushhouse",
            "zeropark",
            "popuptraffic",
            "trafficnomads",
            "adcash",
            "adscompass",
            "exoclick",
            "juicyads",
            "plugrush",
            "popmyads",
            "adnow",
            "richads",
            "onenetworkdirect",
            "adoperator",
            "popundernetwork",
            "pushup",
            "smartyads",
            "adspyglass",
            "mgid",
          ],
        },
      },
    })
  } catch (error) {
    console.error("Error fetching platforms:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch platforms",
      },
      { status: 500 },
    )
  }
}
