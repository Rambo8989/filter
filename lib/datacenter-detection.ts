import { checkAdPlatformByASN } from "./ad-platform-detection"
// ============================================================
// DATACENTER & PROXY DETECTION
// Uses ip-api.com (free, 1000 req/hr) — no API key needed
// Includes CIDR-based fallback for known cloud ranges
// ============================================================

export interface IPAnalysis {
  isDatacenter: boolean
  isProxy: boolean
  isVPN: boolean
  isHosting: boolean
  isTor: boolean
  provider: string | null
  country: string
  city: string
  isp: string
  org: string
  asn: string
  riskLevel: "low" | "medium" | "high" | "critical"
  signals: string[]
}

// ── Known datacenter ASN prefixes (Autonomous System Numbers) ──
// These are the major cloud/hosting providers by ASN
const DATACENTER_ASN_KEYWORDS = [
  "amazon", "aws", "microsoft", "azure", "google", "gcp", "digitalocean",
  "linode", "akamai", "cloudflare", "fastly", "hetzner", "ovh", "vultr",
  "rackspace", "softlayer", "ibm cloud", "alibaba", "tencent cloud",
  "oracle cloud", "scaleway", "packet", "equinix", "leaseweb",
  "choopa", "constant contact", "psychz", "quadranet", "hostwinds",
  "hostgator", "bluehost", "dreamhost", "godaddy hosting", "siteground",
  "hosting", "datacenter", "data center", "colocation", "colo",
  "dedicated server", "cloud server", "vps", "virtual private",
]

// ── Known VPN / Proxy provider name keywords ──
const VPN_PROVIDER_KEYWORDS = [
  "nordvpn", "expressvpn", "surfshark", "cyberghost", "purevpn", "ipvanish",
  "private internet access", "pia", "protonvpn", "mullvad", "windscribe",
  "tunnelbear", "hotspotshield", "hidemyass", "hma", "torguard", "vyprvpn",
  "vpn", "proxy", "anonymous", "anonymizer", "hide.me", "perfect privacy",
]

// ── CIDR check utility ──────────────────────────────────────
function ipToLong(ip: string): number {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return 0
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function isInCIDR(ip: string, cidr: string): boolean {
  try {
    const [range, bits] = cidr.split("/")
    const mask = bits ? (~0 << (32 - parseInt(bits))) >>> 0 : 0xffffffff
    return (ipToLong(ip) & mask) === (ipToLong(range) & mask)
  } catch { return false }
}

// ── Known cloud/datacenter CIDR ranges (major providers) ───
const KNOWN_DATACENTER_CIDRS = [
  // AWS
  "3.0.0.0/9", "13.32.0.0/15", "13.224.0.0/14", "13.248.0.0/14",
  "15.177.0.0/18", "18.64.0.0/10", "52.0.0.0/11", "52.32.0.0/11",
  "52.64.0.0/11", "52.96.0.0/11", "52.192.0.0/11", "54.64.0.0/11",
  "54.128.0.0/9", "54.160.0.0/11", "54.192.0.0/11", "54.224.0.0/11",
  // Google Cloud
  "34.0.0.0/10", "34.64.0.0/10", "34.128.0.0/10", "35.184.0.0/13",
  "35.192.0.0/11", "35.224.0.0/12", "104.154.0.0/15", "104.196.0.0/14",
  // Azure
  "13.64.0.0/11", "13.96.0.0/13", "13.104.0.0/13", "20.0.0.0/8",
  "40.64.0.0/10", "40.112.0.0/13", "40.120.0.0/14", "51.0.0.0/9",
  // Cloudflare
  "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "104.16.0.0/13",
  "104.24.0.0/14", "108.162.192.0/18", "131.0.72.0/22", "141.101.64.0/18",
  "162.158.0.0/15", "172.64.0.0/13", "173.245.48.0/20", "188.114.96.0/20",
  "190.93.240.0/20", "197.234.240.0/22", "198.41.128.0/17",
  // DigitalOcean
  "45.55.0.0/16", "64.225.0.0/16", "104.131.0.0/16", "107.170.0.0/16",
  "138.197.0.0/16", "138.68.0.0/16", "159.65.0.0/16", "159.89.0.0/16",
  "165.232.0.0/16", "174.138.0.0/16",
  // Linode / Akamai
  "23.92.0.0/16", "45.33.0.0/16", "45.56.0.0/16", "50.116.0.0/16",
  "66.175.208.0/20", "69.164.192.0/18", "72.14.176.0/20",
  // Hetzner
  "5.9.0.0/16", "5.75.0.0/16", "23.88.0.0/16", "65.108.0.0/16",
  "65.109.0.0/16", "78.46.0.0/15", "88.198.0.0/16", "95.216.0.0/16",
  "116.202.0.0/15", "128.140.0.0/17", "157.90.0.0/16", "159.69.0.0/16",
  "168.119.0.0/16", "176.9.0.0/16", "178.63.0.0/16",
  // Vultr
  "45.63.0.0/18", "45.76.0.0/15", "66.42.64.0/18", "104.207.128.0/17",
  "108.61.64.0/18", "155.138.128.0/17", "207.246.64.0/18",
  // OVH
  "51.38.0.0/16", "51.68.0.0/16", "51.75.0.0/16", "51.77.0.0/16",
  "51.89.0.0/16", "51.195.0.0/16", "54.36.0.0/14", "135.125.0.0/16",
  "137.74.0.0/16", "145.239.0.0/16", "158.69.0.0/16", "185.14.184.0/22",
  "198.27.64.0/18", "217.182.0.0/15",
]

// ── KNOWN PROXY / TOR EXIT NODE RANGES (subset) ────────────
const KNOWN_PROXY_CIDRS = [
  "198.96.155.0/24",  // TOR exit nodes (sample)
  "199.87.154.0/24",
  "185.220.0.0/16",   // Known TOR exit range
  "23.129.64.0/18",
]

// ── Main function: checks ip-api.com + local CIDR ──────────
export async function analyzeIP(ip: string): Promise<IPAnalysis> {
  const defaultResult: IPAnalysis = {
    isDatacenter: false, isProxy: false, isVPN: false,
    isHosting: false, isTor: false,
    provider: null, country: "UNKNOWN", city: "Unknown",
    isp: "Unknown", org: "Unknown", asn: "",
    riskLevel: "low", signals: [],
  }

  // Skip private/local IPs
  if (!ip || ip === "127.0.0.1" || ip === "::1" ||
      ip.startsWith("192.168.") || ip.startsWith("10.") ||
      ip.startsWith("172.16.") || ip.startsWith("172.17.") ||
      ip.startsWith("172.18.") || ip.startsWith("172.31.")) {
    return { ...defaultResult, country: "LOCAL", riskLevel: "low" }
  }

  const signals: string[] = []
  let isDatacenter = false, isProxy = false, isVPN = false, isHosting = false, isTor = false

  // ── CIDR check first (fast, no network call) ─────────
  if (KNOWN_DATACENTER_CIDRS.some(cidr => isInCIDR(ip, cidr))) {
    isDatacenter = true; isHosting = true
    signals.push("known_datacenter_cidr")
  }

  if (KNOWN_PROXY_CIDRS.some(cidr => isInCIDR(ip, cidr))) {
    isTor = true; isProxy = true
    signals.push("known_proxy_cidr")
  }

  // ── ip-api.com lookup (free, real-time) ──────────────
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,isp,org,as,hosting,proxy,mobile`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()

      if (data.status === "success") {
        // Use api flags
        if (data.hosting) { isHosting = true; isDatacenter = true; signals.push("api:hosting=true") }
        if (data.proxy)   { isProxy = true;   signals.push("api:proxy=true") }

        // Keyword match on ISP/Org/ASN
        const ispLower = (data.isp || "").toLowerCase()
        const orgLower = (data.org || "").toLowerCase()
        const asLower  = (data.as || "").toLowerCase()

        if (DATACENTER_ASN_KEYWORDS.some(k => ispLower.includes(k) || orgLower.includes(k) || asLower.includes(k))) {
          isDatacenter = true; isHosting = true; signals.push("datacenter_asn_keyword")
        }

        if (VPN_PROVIDER_KEYWORDS.some(k => ispLower.includes(k) || orgLower.includes(k))) {
          isVPN = true; isProxy = true; signals.push("vpn_provider_keyword")
        }

        return {
          isDatacenter, isProxy, isVPN, isHosting, isTor,
          provider: data.org || data.isp || null,
          country: data.countryCode || "UNKNOWN",
          city: data.city || "Unknown",
          isp: data.isp || "Unknown",
          org: data.org || "Unknown",
          asn: data.as || "",
          riskLevel: getRiskLevel(isDatacenter, isProxy, isVPN, isTor),
          signals,
        }
      }
    }
  } catch (err) {
    // Network error — fall back to CIDR result
    signals.push("api_timeout_cidr_only")
  }

  return {
    ...defaultResult,
    isDatacenter, isProxy, isVPN, isHosting, isTor,
    riskLevel: getRiskLevel(isDatacenter, isProxy, isVPN, isTor),
    signals,
  }
}

function getRiskLevel(
  isDatacenter: boolean, isProxy: boolean, isVPN: boolean, isTor: boolean
): "low" | "medium" | "high" | "critical" {
  if (isTor) return "critical"
  if (isProxy && isDatacenter) return "critical"
  if (isVPN) return "high"
  if (isDatacenter) return "high"
  if (isProxy) return "medium"
  return "low"
}

// ── Simple wrapper for track-visit route ──────────────────
export async function isDatacenterOrProxy(ip: string): Promise<{
  blocked: boolean
  reason: string
  analysis: IPAnalysis
}> {
  const analysis = await analyzeIP(ip)
  const blocked = analysis.isDatacenter || analysis.isProxy || analysis.isVPN || analysis.isTor
  let reason = "clean_ip"
  if (analysis.isTor)        reason = "tor_exit_node"
  else if (analysis.isVPN)   reason = "vpn_detected"
  else if (analysis.isProxy) reason = "proxy_detected"
  else if (analysis.isDatacenter) reason = "datacenter_ip"
  return { blocked, reason, analysis }
}

// ── Re-export for convenience in track-visit ──────────────
export { checkAdPlatformByASN } from "./ad-platform-detection"
