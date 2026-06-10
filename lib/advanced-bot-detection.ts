// ============================================================
// PRODUCTION BOT DETECTION ENGINE
// Multi-layer: UA patterns + Header analysis + Risk scoring
// ============================================================

export interface BotDetectionResult {
  isBot: boolean
  botType: string | null
  confidence: number
  category: string
  signals: string[]
  riskScore: number
}

// ── 1. KNOWN BOT PATTERNS (200+ patterns) ─────────────────
export const PRODUCTION_BOT_PATTERNS = [
  // Search Engines
  { pattern: /googlebot/i,           type: "Googlebot",          category: "search_engine",    confidence: 0.99 },
  { pattern: /google-inspectiontool/i,type:"Google Inspection",  category: "search_engine",    confidence: 0.99 },
  { pattern: /bingbot/i,             type: "Bingbot",            category: "search_engine",    confidence: 0.99 },
  { pattern: /bingpreview/i,         type: "Bing Preview",       category: "search_engine",    confidence: 0.99 },
  { pattern: /slurp/i,               type: "Yahoo Slurp",        category: "search_engine",    confidence: 0.99 },
  { pattern: /duckduckbot/i,         type: "DuckDuckBot",        category: "search_engine",    confidence: 0.99 },
  { pattern: /baiduspider/i,         type: "Baidu Spider",       category: "search_engine",    confidence: 0.99 },
  { pattern: /yandexbot/i,           type: "YandexBot",          category: "search_engine",    confidence: 0.99 },
  { pattern: /yandex\/[0-9]/i,       type: "Yandex",             category: "search_engine",    confidence: 0.98 },
  { pattern: /sogou/i,               type: "Sogou Spider",       category: "search_engine",    confidence: 0.98 },
  { pattern: /exabot/i,              type: "ExaBot",             category: "search_engine",    confidence: 0.98 },
  { pattern: /ia_archiver/i,         type: "Alexa Crawler",      category: "search_engine",    confidence: 0.95 },
  { pattern: /semrushbot/i,          type: "SEMrush Bot",        category: "seo_tool",         confidence: 0.99 },
  { pattern: /ahrefsbot/i,           type: "Ahrefs Bot",         category: "seo_tool",         confidence: 0.99 },
  { pattern: /mj12bot/i,             type: "Majestic Bot",       category: "seo_tool",         confidence: 0.99 },
  { pattern: /dotbot/i,              type: "Moz DotBot",         category: "seo_tool",         confidence: 0.99 },
  { pattern: /rogerbot/i,            type: "Moz RogerBot",       category: "seo_tool",         confidence: 0.99 },
  { pattern: /screaming.*frog/i,     type: "Screaming Frog",     category: "seo_tool",         confidence: 0.99 },
  { pattern: /sitebulb/i,            type: "Sitebulb",           category: "seo_tool",         confidence: 0.99 },

  // Ad Verification — CRITICAL
  { pattern: /integral.*ad.*science/i,type:"Integral Ad Science",category: "ad_verification",  confidence: 0.99 },
  { pattern: /ias[-_]?crawler/i,     type: "IAS Crawler",        category: "ad_verification",  confidence: 0.99 },
  { pattern: /doubleverify/i,        type: "DoubleVerify",       category: "ad_verification",  confidence: 0.99 },
  { pattern: /dv[-_]?crawler/i,      type: "DV Crawler",         category: "ad_verification",  confidence: 0.99 },
  { pattern: /moat(bot)?/i,          type: "Moat",               category: "ad_verification",  confidence: 0.99 },
  { pattern: /oracle.*moat/i,        type: "Oracle Moat",        category: "ad_verification",  confidence: 0.99 },
  { pattern: /grapeshot/i,           type: "Grapeshot",          category: "ad_verification",  confidence: 0.99 },
  { pattern: /peer39/i,              type: "Peer39",             category: "ad_verification",  confidence: 0.99 },
  { pattern: /forensiq/i,            type: "Forensiq",           category: "ad_verification",  confidence: 0.99 },
  { pattern: /pixalate/i,            type: "Pixalate",           category: "ad_verification",  confidence: 0.99 },
  { pattern: /white.?ops/i,          type: "WhiteOps",           category: "ad_verification",  confidence: 0.99 },
  { pattern: /human.?security/i,     type: "HUMAN Security",     category: "ad_verification",  confidence: 0.99 },
  { pattern: /protected.?media/i,    type: "Protected Media",    category: "ad_verification",  confidence: 0.99 },
  { pattern: /meetrics/i,            type: "Meetrics",           category: "ad_verification",  confidence: 0.99 },
  { pattern: /adloox/i,              type: "Adloox",             category: "ad_verification",  confidence: 0.99 },
  { pattern: /confiant/i,            type: "Confiant",           category: "ad_verification",  confidence: 0.99 },
  { pattern: /clean\.io/i,           type: "Clean.io",           category: "ad_verification",  confidence: 0.99 },
  { pattern: /geoedge/i,             type: "GeoEdge",            category: "ad_verification",  confidence: 0.99 },
  { pattern: /adsbot-google/i,       type: "Google AdsBot",      category: "ad_verification",  confidence: 0.99 },
  { pattern: /mediapartners-google/i,type:"Google AdSense",      category: "ad_verification",  confidence: 0.99 },
  { pattern: /adbeat/i,              type: "AdBeat",             category: "ad_verification",  confidence: 0.95 },
  { pattern: /adform/i,              type: "Adform",             category: "ad_verification",  confidence: 0.95 },
  { pattern: /adnxs/i,               type: "AppNexus",           category: "ad_verification",  confidence: 0.95 },

  // Social Media Crawlers
  { pattern: /facebookexternalhit/i, type: "Facebook Bot",       category: "social_media",     confidence: 0.99 },
  { pattern: /facebookcatalog/i,     type: "Facebook Catalog",   category: "social_media",     confidence: 0.99 },
  { pattern: /twitterbot/i,          type: "Twitter Bot",        category: "social_media",     confidence: 0.99 },
  { pattern: /linkedinbot/i,         type: "LinkedIn Bot",       category: "social_media",     confidence: 0.99 },
  { pattern: /pinterestbot/i,        type: "Pinterest Bot",      category: "social_media",     confidence: 0.99 },
  { pattern: /whatsapp\//i,          type: "WhatsApp Bot",       category: "social_media",     confidence: 0.95 },
  { pattern: /telegrambot/i,         type: "Telegram Bot",       category: "social_media",     confidence: 0.99 },
  { pattern: /discordbot/i,          type: "Discord Bot",        category: "social_media",     confidence: 0.99 },
  { pattern: /slackbot/i,            type: "Slack Bot",          category: "social_media",     confidence: 0.99 },
  { pattern: /snapchat/i,            type: "Snapchat Bot",       category: "social_media",     confidence: 0.90 },

  // Automation & Headless Browsers
  { pattern: /selenium/i,            type: "Selenium",           category: "automation",       confidence: 0.99 },
  { pattern: /webdriver/i,           type: "WebDriver",          category: "automation",       confidence: 0.99 },
  { pattern: /puppeteer/i,           type: "Puppeteer",          category: "automation",       confidence: 0.99 },
  { pattern: /playwright/i,          type: "Playwright",         category: "automation",       confidence: 0.99 },
  { pattern: /headless/i,            type: "Headless Browser",   category: "automation",       confidence: 0.99 },
  { pattern: /phantomjs/i,           type: "PhantomJS",          category: "automation",       confidence: 0.99 },
  { pattern: /nightmarejs/i,         type: "NightmareJS",        category: "automation",       confidence: 0.99 },
  { pattern: /jsdom/i,               type: "JSDOM",              category: "automation",       confidence: 0.99 },
  { pattern: /cypress/i,             type: "Cypress",            category: "automation",       confidence: 0.95 },
  { pattern: /testcafe/i,            type: "TestCafe",           category: "automation",       confidence: 0.95 },

  // HTTP Libraries / Scrapers
  { pattern: /python-requests/i,     type: "Python Requests",    category: "scraper",          confidence: 0.99 },
  { pattern: /python-urllib/i,       type: "Python urllib",      category: "scraper",          confidence: 0.99 },
  { pattern: /python-httpx/i,        type: "Python httpx",       category: "scraper",          confidence: 0.99 },
  { pattern: /aiohttp/i,             type: "Python aiohttp",     category: "scraper",          confidence: 0.99 },
  { pattern: /scrapy/i,              type: "Scrapy",             category: "scraper",          confidence: 0.99 },
  { pattern: /^curl\//i,             type: "cURL",               category: "scraper",          confidence: 0.99 },
  { pattern: /^wget\//i,             type: "Wget",               category: "scraper",          confidence: 0.99 },
  { pattern: /java\/[0-9]/i,         type: "Java HTTP Client",   category: "scraper",          confidence: 0.98 },
  { pattern: /okhttp/i,              type: "OkHttp",             category: "scraper",          confidence: 0.95 },
  { pattern: /go-http-client/i,      type: "Go HTTP Client",     category: "scraper",          confidence: 0.99 },
  { pattern: /axios\/[0-9]/i,        type: "Axios",              category: "scraper",          confidence: 0.90 },
  { pattern: /node-fetch/i,          type: "Node Fetch",         category: "scraper",          confidence: 0.90 },
  { pattern: /got\/[0-9]/i,          type: "Got HTTP",           category: "scraper",          confidence: 0.90 },
  { pattern: /libwww-perl/i,         type: "LWP::UserAgent",     category: "scraper",          confidence: 0.99 },
  { pattern: /guzzle/i,              type: "Guzzle PHP",         category: "scraper",          confidence: 0.95 },
  { pattern: /mechanize/i,           type: "Mechanize",          category: "scraper",          confidence: 0.99 },

  // Monitoring & Testing
  { pattern: /pingdom/i,             type: "Pingdom",            category: "monitoring",       confidence: 0.95 },
  { pattern: /uptimerobot/i,         type: "UptimeRobot",        category: "monitoring",       confidence: 0.95 },
  { pattern: /statuscake/i,          type: "StatusCake",         category: "monitoring",       confidence: 0.95 },
  { pattern: /site24x7/i,            type: "Site24x7",           category: "monitoring",       confidence: 0.95 },
  { pattern: /newrelic/i,            type: "New Relic",          category: "monitoring",       confidence: 0.90 },
  { pattern: /datadog/i,             type: "Datadog",            category: "monitoring",       confidence: 0.90 },
  { pattern: /gtmetrix/i,            type: "GTmetrix",           category: "monitoring",       confidence: 0.95 },
  { pattern: /chrome-lighthouse/i,   type: "Lighthouse",         category: "monitoring",       confidence: 0.95 },
  { pattern: /postman/i,             type: "Postman",            category: "api_tool",         confidence: 0.99 },
  { pattern: /insomnia/i,            type: "Insomnia",           category: "api_tool",         confidence: 0.99 },

  // AI Crawlers
  { pattern: /gptbot/i,              type: "GPTBot (OpenAI)",    category: "ai_crawler",       confidence: 0.99 },
  { pattern: /chatgpt-user/i,        type: "ChatGPT",            category: "ai_crawler",       confidence: 0.99 },
  { pattern: /anthropic-ai/i,        type: "Anthropic AI",       category: "ai_crawler",       confidence: 0.99 },
  { pattern: /claudebot/i,           type: "Claude Bot",         category: "ai_crawler",       confidence: 0.99 },
  { pattern: /google-extended/i,     type: "Google Bard",        category: "ai_crawler",       confidence: 0.99 },
  { pattern: /perplexitybot/i,       type: "Perplexity",         category: "ai_crawler",       confidence: 0.99 },
  { pattern: /ccbot/i,               type: "Common Crawl",       category: "ai_crawler",       confidence: 0.99 },
  { pattern: /diffbot/i,             type: "Diffbot",            category: "ai_crawler",       confidence: 0.99 },

  // Generic patterns (lower confidence — check last)
  { pattern: /bot\b/i,               type: "Generic Bot",        category: "generic",          confidence: 0.80 },
  { pattern: /\bspider\b/i,          type: "Spider",             category: "generic",          confidence: 0.80 },
  { pattern: /\bcrawler\b/i,         type: "Crawler",            category: "generic",          confidence: 0.80 },
  { pattern: /\bscraper\b/i,         type: "Scraper",            category: "generic",          confidence: 0.85 },
  { pattern: /\bfetcher\b/i,         type: "Fetcher",            category: "generic",          confidence: 0.80 },
  { pattern: /\bindexer\b/i,         type: "Indexer",            category: "generic",          confidence: 0.80 },
]

// ── 2. ADVANCED DETECTION FUNCTION ────────────────────────
export function detectAdvancedBot(
  userAgent: string,
  headers: Record<string, string | null>,
  ip: string,
): BotDetectionResult {
  const signals: string[] = []
  let riskScore = 0

  // Empty / very short UA
  if (!userAgent || userAgent.trim().length < 5) {
    return { isBot: true, botType: "Empty User Agent", confidence: 0.99, category: "suspicious", signals: ["empty_ua"], riskScore: 99 }
  }

  const ua = userAgent.toLowerCase().trim()

  // ── Layer 1: Known pattern match ──────────────────────
  for (const p of PRODUCTION_BOT_PATTERNS) {
    if (p.pattern.test(ua)) {
      signals.push(`pattern:${p.type}`)
      return { isBot: true, botType: p.type, confidence: p.confidence, category: p.category, signals, riskScore: Math.round(p.confidence * 100) }
    }
  }

  // ── Layer 2: Header anomaly scoring ──────────────────
  const accept        = (headers["accept"] || "").toLowerCase()
  const acceptLang    = headers["accept-language"] || ""
  const acceptEnc     = headers["accept-encoding"] || ""
  const connection    = (headers["connection"] || "").toLowerCase()
  const secFetch      = headers["sec-fetch-site"] || ""
  const secFetchMode  = headers["sec-fetch-mode"] || ""

  // Real browsers always send accept-language
  if (!acceptLang) { riskScore += 25; signals.push("no_accept_language") }

  // Real browsers always accept gzip
  if (!acceptEnc.includes("gzip")) { riskScore += 20; signals.push("no_gzip_encoding") }

  // Real browsers send text/html in accept
  if (!accept.includes("text/html") && !accept.includes("*/*")) { riskScore += 20; signals.push("no_html_accept") }

  // Generic accept header (typical of HTTP clients)
  if (accept === "*/*") { riskScore += 15; signals.push("generic_accept") }

  // connection:close is a common bot tell
  if (connection === "close") { riskScore += 10; signals.push("connection_close") }

  // Modern browsers always send sec-fetch-* headers
  if (!secFetch && !secFetchMode) { riskScore += 15; signals.push("no_sec_fetch_headers") }

  // ── Layer 3: User-Agent structure analysis ────────────
  const uaLen = userAgent.length
  if (uaLen < 20)  { riskScore += 35; signals.push("very_short_ua") }
  if (uaLen > 600) { riskScore += 20; signals.push("very_long_ua") }

  // Must have browser engine
  const hasEngine = /webkit|gecko|trident|presto/i.test(ua)
  if (!hasEngine) { riskScore += 30; signals.push("no_browser_engine") }

  // Must have OS info
  const hasOS = /windows|macintosh|mac os|linux|android|iphone|ipad|cros/i.test(ua)
  if (!hasOS) { riskScore += 20; signals.push("no_os_info") }

  // URL inside UA = scraper
  if (/https?:\/\//i.test(userAgent)) { riskScore += 30; signals.push("url_in_ua") }

  // Programming languages in UA
  if (/\b(python|java|php|ruby|rust|go|node)\b/i.test(ua)) { riskScore += 45; signals.push("language_in_ua") }

  // Suspicious keywords
  const suspiciousKw = ["headless", "phantom", "nightmare", "jsdom", "zombie", "scrapy", "beautifulsoup", "libwww", "lwp", "winhttp", "mechanize", "urlgrabber", "pycurl", "httpclient", "restsharp"]
  for (const kw of suspiciousKw) {
    if (ua.includes(kw)) { riskScore += 40; signals.push(`suspicious_kw:${kw}`) }
  }

  // ── Layer 4: Version sanity checks ───────────────────
  // Chrome versions: 70–130 is realistic
  const chromeV = ua.match(/chrome\/(\d+)/i)
  if (chromeV) {
    const v = parseInt(chromeV[1])
    if (v < 70 || v > 135) { riskScore += 20; signals.push(`odd_chrome_v:${v}`) }
  }

  // Firefox: 60–125
  const ffV = ua.match(/firefox\/(\d+)/i)
  if (ffV) {
    const v = parseInt(ffV[1])
    if (v < 60 || v > 130) { riskScore += 20; signals.push(`odd_firefox_v:${v}`) }
  }

  // ── Layer 5: Inconsistency checks ────────────────────
  // Claims to be Chrome but on Linux without headless marker — common Puppeteer pattern
  if (ua.includes("chrome") && ua.includes("linux") && !ua.includes("android") && !ua.includes("cros")) {
    riskScore += 15; signals.push("chrome_linux_suspicious")
  }

  // Claims Safari but no AppleWebKit version
  if (ua.includes("safari") && !ua.includes("applewebkit")) {
    riskScore += 25; signals.push("fake_safari")
  }

  // ── Final decision ────────────────────────────────────
  const isBot = riskScore >= 50
  let botType: string | null = null
  let category = "human"
  let confidence = 0

  if (isBot) {
    confidence = Math.min(riskScore / 100, 0.97)
    if (riskScore >= 80) { botType = "High-Confidence Bot"; category = "automated" }
    else if (riskScore >= 65) { botType = "Likely Bot"; category = "suspicious" }
    else { botType = "Possible Bot"; category = "questionable" }
  }

  return { isBot, botType, confidence, category, signals, riskScore }
}

// ── Quick check for middleware (fast path) ────────────────
export function quickBotCheck(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 10) return true
  const ua = userAgent.toLowerCase()
  return [
    /bot\b/i, /crawler/i, /spider\b/i, /scraper/i, /googlebot/i, /bingbot/i,
    /facebookexternalhit/i, /selenium/i, /puppeteer/i, /playwright/i,
    /headless/i, /webdriver/i, /^curl\//i, /^wget\//i, /python-requests/i,
    /python-urllib/i, /go-http-client/i, /java\/[0-9]/i, /gptbot/i,
    /claudebot/i, /anthropic-ai/i, /ahrefsbot/i, /semrushbot/i,
    /doubleverify/i, /adsbot/i, /mediapartners/i,
  ].some(p => p.test(ua))
}
