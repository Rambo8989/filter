import { detectBot, analyzeUserAgent, getCountryFromTimezone } from "./bot-detection"

export interface EnhancedBotDetectionResult {
  isBot: boolean
  botType: string | null
  confidence: number
  category: string
  riskScore: number
  reasons: string[]
  fingerprint: string
  recommendation: "allow" | "block" | "monitor"
}

export interface VisitorFingerprint {
  userAgent: string
  ip: string
  country: string
  timezone: string
  referrer: string
  language: string
  screenResolution: string
  colorDepth: number
  platform: string
  plugins: string[]
  features: Record<string, boolean>
}

export class EnhancedBotDetector {
  private static readonly RISK_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
  }

  private static readonly CATEGORY_WEIGHTS = {
    ad_verification: 100,
    automation: 90,
    suspicious: 80,
    content_discovery: 60,
    search_engine: 20,
    social_media: 10,
    human: 0,
  }

  static async analyze(fingerprint: VisitorFingerprint): Promise<EnhancedBotDetectionResult> {
    const reasons: string[] = []
    let riskScore = 0

    // Basic bot detection
    const botResult = detectBot(fingerprint.userAgent, fingerprint.ip)

    if (botResult.isBot) {
      reasons.push(`Bot pattern detected: ${botResult.botType}`)
      riskScore += this.CATEGORY_WEIGHTS[botResult.category as keyof typeof this.CATEGORY_WEIGHTS] || 50
    }

    // User agent analysis
    const uaAnalysis = analyzeUserAgent(fingerprint.userAgent)

    if (uaAnalysis.suspicious) {
      reasons.push("Suspicious user agent patterns detected")
      riskScore += 30
    }

    // Check for missing or suspicious referrer
    if (!fingerprint.referrer) {
      reasons.push("Missing referrer")
      riskScore += 10
    } else if (this.isSuspiciousReferrer(fingerprint.referrer)) {
      reasons.push("Suspicious referrer detected")
      riskScore += 20
    }

    // Check timezone vs country mismatch
    const expectedCountry = getCountryFromTimezone(fingerprint.timezone)
    if (expectedCountry !== "unknown" && expectedCountry !== fingerprint.country) {
      reasons.push("Timezone/country mismatch detected")
      riskScore += 15
    }

    // Check for automation indicators
    if (this.hasAutomationIndicators(fingerprint)) {
      reasons.push("Automation indicators detected")
      riskScore += 25
    }

    // Check for ad verification patterns
    if (this.isAdVerificationBot(fingerprint.userAgent)) {
      reasons.push("Ad verification bot detected")
      riskScore = 100 // Maximum risk for ad verification
    }

    // Generate fingerprint hash
    const fingerprintHash = this.generateFingerprint(fingerprint)

    // Determine recommendation
    let recommendation: "allow" | "block" | "monitor" = "allow"

    if (riskScore >= this.RISK_THRESHOLDS.HIGH) {
      recommendation = "block"
    } else if (riskScore >= this.RISK_THRESHOLDS.MEDIUM) {
      recommendation = "monitor"
    }

    // Override for critical bots
    if (botResult.category === "ad_verification") {
      recommendation = "block"
    }

    return {
      isBot: botResult.isBot,
      botType: botResult.botType,
      confidence: botResult.confidence,
      category: botResult.category,
      riskScore: Math.min(riskScore, 100),
      reasons,
      fingerprint: fingerprintHash,
      recommendation,
    }
  }

  private static isSuspiciousReferrer(referrer: string): boolean {
    const suspiciousPatterns = [
      /^https?:\/\/[^/]*\.onion\//,   // Tor hidden services
      /^https?:\/\/\d+\.\d+\.\d+\.\d+/,  // Raw IP referrer
    ]
    return suspiciousPatterns.some((pattern) => pattern.test(referrer))
  }

  private static hasAutomationIndicators(fingerprint: VisitorFingerprint): boolean {
    const indicators = [
      // Headless browser indicators
      !fingerprint.features.webGL,
      !fingerprint.features.plugins || fingerprint.plugins.length === 0,
      fingerprint.platform === "Linux" && fingerprint.userAgent.includes("Chrome"),
      fingerprint.screenResolution === "1024x768", // Common headless resolution
      fingerprint.colorDepth < 24,
    ]

    return indicators.filter(Boolean).length >= 2
  }

  private static isAdVerificationBot(userAgent: string): boolean {
    const adVerificationPatterns = [
      /integral.*ad.*science/i,
      /doubleverify/i,
      /moat/i,
      /grapeshot/i,
      /peer39/i,
      /pixalate/i,
      /forensiq/i,
      /whiteops/i,
      /human.*security/i,
      /protected.*media/i,
    ]

    return adVerificationPatterns.some((pattern) => pattern.test(userAgent))
  }

  private static generateFingerprint(data: VisitorFingerprint): string {
    const components = [
      data.userAgent,
      data.language,
      data.screenResolution,
      data.colorDepth.toString(),
      data.platform,
      data.timezone,
      JSON.stringify(data.features),
      data.plugins.join(","),
    ]

    // Simple hash function (in production, use a proper hash library)
    let hash = 0
    const str = components.join("|")

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
  }

  static getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
    if (score >= 90) return "critical"
    if (score >= this.RISK_THRESHOLDS.HIGH) return "high"
    if (score >= this.RISK_THRESHOLDS.MEDIUM) return "medium"
    return "low"
  }

  static shouldBlock(result: EnhancedBotDetectionResult): boolean {
    return result.recommendation === "block" || result.riskScore >= this.RISK_THRESHOLDS.HIGH
  }

  static shouldMonitor(result: EnhancedBotDetectionResult): boolean {
    return result.recommendation === "monitor" || result.riskScore >= this.RISK_THRESHOLDS.MEDIUM
  }
}

export default EnhancedBotDetector
