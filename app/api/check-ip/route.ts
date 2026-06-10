import { type NextRequest, NextResponse } from "next/server"

// Enhanced IP checking API endpoint
const BLOCKED_AUTOMATED_IPS = [
  // Google Crawler IP ranges (Updated 2024)
  "66.249.64.0/19",
  "66.249.80.0/20",
  "66.249.96.0/19",
  "209.85.128.0/17",
  "216.239.32.0/19",
  "172.217.0.0/16",
  "173.194.0.0/16",
  "74.125.0.0/16",
  "64.233.160.0/19",
  "72.14.192.0/18",
  "203.208.32.0/19",

  // Microsoft Bing Crawler IP ranges
  "40.77.167.0/24",
  "157.55.39.0/24",
  "207.46.13.0/24",
  "207.46.199.0/24",
  "65.52.104.0/24",
  "65.55.213.0/24",
  "131.253.26.0/24",
  "131.253.27.0/24",
  "40.77.188.0/24",
  "157.56.229.0/24",

  // Facebook/Meta Crawler IP ranges (Updated)
  "31.13.24.0/21",
  "31.13.64.0/18",
  "31.13.68.0/22",
  "31.13.72.0/21",
  "31.13.80.0/20",
  "31.13.96.0/19",
  "66.220.144.0/20",
  "66.220.160.0/19",
  "69.63.176.0/20",
  "69.171.224.0/19",
  "74.119.76.0/22",
  "103.4.96.0/22",
  "129.134.0.0/17",
  "157.240.0.0/17",
  "173.252.64.0/18",
  "179.60.192.0/22",
  "185.60.216.0/22",
  "204.15.20.0/22",

  // Twitter Crawler IP ranges
  "199.16.156.0/22",
  "199.59.148.0/22",
  "192.133.76.0/22",
  "69.195.160.0/19",

  // LinkedIn Crawler IP ranges
  "108.174.0.0/16",
  "144.2.0.0/16",

  // Amazon/Alexa Crawler IP ranges
  "72.21.196.0/22",
  "75.101.128.0/17",
  "174.129.0.0/16",
  "184.72.0.0/15",
  "50.16.0.0/15",
  "107.20.0.0/14",

  // Yandex Crawler IP ranges
  "5.45.192.0/18",
  "37.9.64.0/18",
  "37.140.128.0/18",
  "77.88.0.0/16",
  "87.250.224.0/19",
  "93.158.128.0/18",
  "95.108.128.0/17",
  "178.154.128.0/17",
  "199.21.96.0/22",
  "213.180.192.0/19",

  // Ad Verification Networks (CRITICAL TO BLOCK)
  "52.0.0.0/12", // AWS ranges often used by verification services
  "54.0.0.0/8", // More AWS ranges
  "23.20.0.0/14", // Akamai ranges used by verification
]

const AUTOMATED_PATTERNS = [
  // Search Engine Crawlers (usually allowed but monitored)
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /sogou/i,
  /exabot/i,

  // Social Media Crawlers
  /facebookexternalhit/i,
  /facebookcatalog/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterestbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /instagram/i,
  /snapchat/i,
  /tiktok/i,
  /discord/i,

  // Campaign Verification Systems (CRITICAL TO BLOCK)
  /integral.*ad.*science/i,
  /ias.*crawler/i,
  /doubleverify/i,
  /dv.*crawler/i,
  /moat/i,
  /oracle.*moat/i,
  /grapeshot/i,
  /peer39/i,
  /forensiq/i,
  /pixalate/i,
  /white.*ops/i,
  /human.*security/i,
  /protected.*media/i,
  /meetrics/i,
  /adloox/i,
  /confiant/i,
  /clean\.io/i,
  /geoedge/i,

  // Ad Network Verification (CRITICAL)
  /google.*ads.*overview/i,
  /facebook.*ads.*crawler/i,
  /microsoft.*ads.*crawler/i,
  /twitter.*ads.*crawler/i,
  /linkedin.*ads.*crawler/i,
  /pinterest.*ads.*crawler/i,
  /snapchat.*ads.*crawler/i,
  /tiktok.*ads.*crawler/i,
  /amazon.*ads.*crawler/i,
  /yahoo.*ads.*crawler/i,
  /bing.*ads.*crawler/i,

  // Affiliate Network Verification
  /commission.*junction.*crawler/i,
  /cj.*crawler/i,
  /shareasale.*crawler/i,
  /clickbank.*verification/i,
  /clickbank.*crawler/i,
  /maxbounty.*crawler/i,
  /impact.*radius.*crawler/i,
  /partnerize.*crawler/i,
  /rakuten.*advertising.*crawler/i,
  /awin.*crawler/i,
  /tradedoubler.*crawler/i,

  // AI/LLM Systems (CRITICAL)
  /gptbot/i,
  /chatgpt/i,
  /claude/i,
  /anthropic/i,
  /bard/i,
  /gemini/i,
  /perplexity/i,
  /you\.com/i,
  /character\.ai/i,
  /replika/i,
  /jasper/i,
  /copy\.ai/i,
  /writesonic/i,
  /rytr/i,
  /quillbot/i,
  /grammarly/i,

  // SEO Tools (HIGH PRIORITY)
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i, // Majestic
  /dotbot/i, // Moz
  /spyfu/i,
  /similarweb/i,
  /screaming.*frog/i,
  /sitebulb/i,
  /deepcrawl/i,
  /botify/i,
  /oncrawl/i,
  /sistrix/i,
  /searchmetrics/i,
  /brightedge/i,
  /conductor/i,

  // Content Discovery & Advertising
  /taboola/i,
  /outbrain/i,
  /revcontent/i,
  /mgid/i,
  /content\.ad/i,
  /media\.net/i,
  /criteo/i,
  /doubleclick/i,
  /googleadservices/i,
  /googlesyndication/i,
  /adsbot-google/i,
  /mediapartners-google/i,

  // Pop/Push Networks (CRITICAL)
  /bidvertiser/i,
  /adstera/i,
  /propellerads/i,
  /popads/i,
  /popcash/i,
  /adcash/i,
  /clickadu/i,
  /hilltopads/i,
  /richads/i,
  /adsterra/i,
  /evadav/i,
  /pushground/i,
  /megapush/i,
  /datspush/i,
  /pushhouse/i,
  /zeropark/i,
  /popunder\.net/i,
  /adnium/i,
  /trafficstars/i,
  /exoclick/i,
  /juicyads/i,
  /plugrush/i,

  // Automation & Testing Tools
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i,
  /phantom/i,
  /headless/i,
  /chrome-lighthouse/i,
  /cypress/i,
  /testcafe/i,
  /webdriverio/i,
  /protractor/i,
  /nightwatch/i,

  // Programming Languages & HTTP Clients
  /python.*requests/i,
  /python.*urllib/i,
  /python.*httpx/i,
  /python.*aiohttp/i,
  /node.*js/i,
  /axios/i,
  /fetch.*api/i,
  /java.*http.*client/i,
  /okhttp/i,
  /apache.*http.*client/i,
  /php.*curl/i,
  /guzzle.*http/i,
  /ruby.*net.*http/i,
  /go.*http.*client/i,
  /rust.*reqwest/i,
  /curl/i,
  /wget/i,
  /httpie/i,

  // Security & Vulnerability Scanners
  /nmap/i,
  /nikto/i,
  /sqlmap/i,
  /burp.*suite/i,
  /owasp.*zap/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /qualys/i,
  /rapid7/i,
  /tenable/i,
  /veracode/i,
  /checkmarx/i,

  // Monitoring & Uptime Services
  /pingdom/i,
  /uptimerobot/i,
  /statuscake/i,
  /site24x7/i,
  /newrelic/i,
  /datadog/i,
  /dynatrace/i,
  /appdynamics/i,

  // Content Scraping & Aggregation
  /scrapy/i,
  /beautifulsoup/i,
  /mechanize/i,
  /content.*scraper/i,
  /article.*scraper/i,
  /news.*scraper/i,
  /blog.*scraper/i,
  /web.*scraper/i,
  /data.*scraper/i,
  /price.*scraper/i,
  /product.*scraper/i,

  // Feed Readers & RSS
  /feedburner/i,
  /feedfetcher/i,
  /feedly/i,
  /flipboard/i,
  /newsblur/i,
  /inoreader/i,

  // API Testing Tools
  /postman/i,
  /insomnia/i,
  /rest.*client/i,
  /api.*client/i,
  /http.*tester/i,

  // Load Testing Tools
  /jmeter/i,
  /loadrunner/i,
  /gatling/i,
  /artillery/i,
  /k6/i,
  /locust/i,

  // Mobile App Testing
  /appium/i,
  /espresso/i,
  /xcuitest/i,
  /detox/i,
  /calabash/i,

  // Cloud Testing Services
  /browserstack/i,
  /saucelabs/i,
  /lambdatest/i,
  /crossbrowsertesting/i,

  // Compliance & Legal
  /gdpr.*compliance/i,
  /ccpa.*compliance/i,
  /privacy.*scanner/i,
  /cookie.*scanner/i,
  /accessibility.*scanner/i,
  /ada.*compliance/i,
  /wcag.*scanner/i,

  // Brand Protection
  /brand.*protection/i,
  /anti.*piracy/i,
  /copyright.*scanner/i,
  /dmca.*scanner/i,
  /trademark.*scanner/i,

  // Threat Intelligence
  /threat.*intelligence/i,
  /malware.*scanner/i,
  /virus.*scanner/i,
  /phishing.*detector/i,
  /spam.*filter/i,
  /blacklist.*checker/i,

  // Financial & Trading
  /trading.*system/i,
  /forex.*system/i,
  /crypto.*system/i,
  /stock.*system/i,
  /market.*data/i,
  /price.*feed/i,

  // E-commerce & Price Monitoring
  /price.*monitor/i,
  /price.*comparison/i,
  /shopping.*system/i,
  /inventory.*checker/i,
  /stock.*monitor/i,

  // Generic Automated Patterns (Enhanced)
  /crawler/i,
  /spider/i,
  /scraper/i,
  /fetcher/i,
  /parser/i,
  /extractor/i,
  /monitor/i,
  /checker/i,
  /validator/i,
  /indexer/i,
  /harvester/i,
  /gatherer/i,
  /collector/i,
  /aggregator/i,
  /scanner/i,
  /probe/i,
  /audit/i,
  /analyze/i,
  /inspect/i,
  /verify/i,
  /validate/i,
  /compliance/i,
  /quality/i,

  // Suspicious or Empty User Agents
  /^$/,
  /^\s*$/,
  /unknown/i,
  /null/i,
  /undefined/i,
  /test/i,
  /example/i,
  /sample/i,
  /demo/i,
  /default/i,
  /mozilla\/4\.0$/i,
  /mozilla\/5\.0$/i,
  /^mozilla$/i,
  /^user.*agent$/i,
  /^http/i,
  /^www/i,
  /^web/i,
  /^internet/i,
  /^browser/i,

  // Specific Library Patterns
  /libwww/i,
  /lwp/i,
  /winhttp/i,
  /okhttp/i,
  /apache/i,
  /jersey/i,
  /restsharp/i,
  /unirest/i,
  /guzzle/i,
  /httpclient/i,
  /urlconnection/i,
  /webclient/i,
  /resttemplate/i,
  /feign/i,
  /retrofit/i,
  /volley/i,
  /alamofire/i,
  /afnetworking/i,
  /nsurlsession/i,
]

const BLOCKED_IP_RANGES = [
  // Example blocked IP ranges (you would populate this from your database)
  "192.168.1.0/24",
  "10.0.0.0/8",
  // Add more IP ranges as needed
]

const ALLOWED_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "AU",
  "DE",
  "FR",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
  "CH",
  "AT",
  "BE",
  "IT",
  "ES",
  "PT",
  "IE",
  "NZ",
]

function ipToNumber(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0
}

function isIPInRange(ip: string, range: string): boolean {
  const [rangeIP, prefixLength] = range.split("/")
  const prefix = Number.parseInt(prefixLength, 10)

  const ipNum = ipToNumber(ip)
  const rangeNum = ipToNumber(rangeIP)
  const mask = (0xffffffff << (32 - prefix)) >>> 0

  return (ipNum & mask) === (rangeNum & mask)
}

function isAutomated(userAgent: string): { isAutomated: boolean; automatedType?: string; confidence: number } {
  if (!userAgent) {
    return { isAutomated: true, automatedType: "no_user_agent", confidence: 0.9 }
  }

  // Check against known automated patterns
  for (const pattern of AUTOMATED_PATTERNS) {
    if (pattern.test(userAgent)) {
      const automatedType = userAgent.toLowerCase().includes("google")
        ? "googlebot"
        : userAgent.toLowerCase().includes("bing")
          ? "bingbot"
          : userAgent.toLowerCase().includes("facebook")
            ? "facebook"
            : userAgent.toLowerCase().includes("ias")
              ? "integral_ad_science"
              : userAgent.toLowerCase().includes("doubleverify")
                ? "double_verify"
                : userAgent.toLowerCase().includes("moat")
                  ? "moat"
                  : "generic_automated"

      return { isAutomated: true, automatedType, confidence: 0.95 }
    }
  }

  // Additional heuristics for automated detection
  const suspiciousPatterns = [/^Mozilla\/5\.0$/, /^$/, /python/i, /curl/i, /wget/i, /http/i, /request/i]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return { isAutomated: true, automatedType: "suspicious_pattern", confidence: 0.7 }
    }
  }

  return { isAutomated: false, confidence: 0.1 }
}

function getCountryFromIP(ip: string): string {
  // In a real implementation, you would use a GeoIP service
  // For demo purposes, we'll return a random country or US
  const countries = ["US", "CA", "GB", "AU", "DE", "FR", "CN", "RU", "IN", "BR"]
  return countries[Math.floor(Math.random() * countries.length)]
}

function isIPBlocked(ip: string): boolean {
  // In a real implementation, you would check against your database
  // For demo purposes, we'll block some example IPs
  const blockedIPs = ["192.168.1.100", "10.0.0.50", "127.0.0.1"]
  return blockedIPs.includes(ip) || BLOCKED_IP_RANGES.some((range) => isIPInRange(ip, range))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAgent, fingerprint, domain, websiteId, ipAddress, referrer, url, pathname } = body

    // Get real IP address from request headers
    const realIP =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "127.0.0.1"

    // Enhanced bot detection
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /telegram/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i,
      /ruby/i,
      /go-http/i,
      /node/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /webdriver/i,
    ]

    const isBot = botPatterns.some((pattern) => pattern.test(userAgent))

    // Suspicious patterns
    const suspiciousPatterns = [
      /mozilla\/5\.0.*windows nt 10\.0.*chrome\/\d+\.0\.0\.0.*safari\/537\.36$/i,
      /^mozilla\/5\.0$/i,
      /python-requests/i,
      /postman/i,
      /insomnia/i,
    ]

    const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(userAgent))

    // Check for missing or invalid fingerprint
    const hasValidFingerprint = fingerprint && fingerprint !== "error" && !fingerprint.startsWith("error-")

    // Determine if visitor should be allowed
    let allowed = true
    let action = "allow"
    let page = "main"
    let confidence = 0

    if (isBot) {
      allowed = false
      action = "redirect"
      page = "landing"
      confidence = 0.9
    } else if (isSuspicious || !hasValidFingerprint) {
      allowed = false
      action = "redirect"
      page = "landing"
      confidence = 0.7
    }

    // Additional checks for automation
    let automatedType = null
    if (isBot) {
      if (/google/i.test(userAgent)) automatedType = "search_engine"
      else if (/facebook|twitter|linkedin/i.test(userAgent)) automatedType = "social_media"
      else if (/headless|phantom|selenium/i.test(userAgent)) automatedType = "automation_tool"
      else automatedType = "generic_bot"
    }

    const result = {
      allowed,
      action,
      page,
      details: {
        ipAddress: realIP,
        isAutomated: isBot || isSuspicious,
        automatedType,
        confidence,
        country: "US", // You can integrate with IP geolocation service
        userAgent,
        fingerprint: hasValidFingerprint ? fingerprint : "invalid",
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in check-ip:", error)

    // Fail-safe: allow visitor if there's an error
    return NextResponse.json({
      allowed: true,
      action: "allow",
      page: "main",
      details: {
        error: "Processing failed",
        isAutomated: false,
        confidence: 0,
      },
    })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ip = searchParams.get("ip")
  const userAgent = searchParams.get("userAgent")
  const domain = searchParams.get("domain")

  if (!ip || !userAgent || !domain) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  // Reuse the same logic as POST
  return POST(request)
}
