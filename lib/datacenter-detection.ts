// ============================================================
// DATACENTER, VPN, PROXY & HUMAN REVIEWER DETECTION
// Layer 1: Proxy headers  (instant, no API call)
// Layer 2: CIDR matching  (instant, no API call)
// Layer 3: ip-api.com     (real-time, cached 10 min)
// ============================================================

export interface IPAnalysis {
  isDatacenter: boolean
  isProxy: boolean
  isVPN: boolean
  isHosting: boolean
  isTor: boolean
  isHumanReviewer: boolean   // ad platform employee/contractor
  provider: string | null
  country: string
  city: string
  isp: string
  org: string
  asn: string
  riskLevel: "low" | "medium" | "high" | "critical"
  signals: string[]
}

// ── Datacenter ASN keywords ──────────────────────────────────
const DATACENTER_ASN_KEYWORDS = [
  "amazon", "aws", "microsoft", "azure", "google", "gcp",
  "digitalocean", "linode", "akamai", "cloudflare", "fastly",
  "hetzner", "ovh", "vultr", "rackspace", "softlayer",
  "ibm cloud", "alibaba", "tencent cloud", "oracle cloud",
  "scaleway", "packet", "equinix", "leaseweb", "choopa",
  "quadranet", "hostwinds", "siteground", "bluehost",
  "dreamhost", "godaddy", "namecheap hosting",
  "hosting", "datacenter", "data center", "colocation", "colo",
  "dedicated server", "cloud server", "vps", "virtual private",
  "server farm", "internet data center", "idc", "cloud hosting",
  "network solutions", "web hosting", "managed hosting",
  "serverius", "servercentral", "wholesail networks",
  "multacom", "frantech", "peg tech", "contabo",
]

// ── VPN / Proxy provider keywords ───────────────────────────
const VPN_PROVIDER_KEYWORDS = [
  // Major consumer VPNs
  "nordvpn", "nord vpn", "expressvpn", "express vpn",
  "surfshark", "cyberghost", "purevpn", "ipvanish",
  "private internet access", " pia ", "protonvpn", "proton vpn",
  "mullvad", "windscribe", "tunnelbear", "hotspot shield",
  "hidemyass", "hma", "torguard", "vyprvpn", "hide.me",
  "perfect privacy", "ivpn", "airvpn", "azirevpn",
  "ovpn", "cryptostorm", "privateVPN", "strongvpn",
  "zenmate", "speedify", "hola vpn", "touch vpn",
  "opera vpn", "avast vpn", "avg vpn", "kaspersky vpn",
  "norton vpn", "bitdefender vpn",
  // Generic VPN/proxy keywords
  "vpn", "proxy", "anonymous", "anonymizer", "anonymizing",
  "privacy network", "private network", "secure tunnel",
  "socks5", "socks proxy", "shadowsocks", "v2ray", "wireguard",
  "openVPN", "tunnel", "exit node", "relay",
  // Datacenter-hosted proxy services
  "luminati", "brightdata", "bright data", "oxylabs",
  "smartproxy", "geosurf", "shifter.io", "netnut",
  "soax", "rayobyte", "ipidea", "stormproxies",
  "microleaves", "myprivateproxy", "ssl private proxy",
]

// ── Human reviewer / ad platform corporate ASNs ─────────────
// These are employees/contractors hired by ad platforms to manually
// review ads for policy compliance. They MUST see the safe page.
const HUMAN_REVIEWER_ASN_KEYWORDS = [
  // Social / ad platforms — their corporate office IPs
  "facebook", "meta platforms", "instagram llc",
  "tiktok", "bytedance",
  "twitter", "x corp",
  "snapchat", "snap inc",
  "pinterest",
  "linkedin", "microsoft linkedin",
  "reddit",
  "taboola", "outbrain", "mgid",
  "exoclick", "trafficjunky", "trafficstars",
  "propellerads", "adsterra", "adcash",
  "zeropark", "hilltopads", "clickadu",
  "richads", "evadav", "pushhouse",
  "maxbounty", "clickbank", "cj affiliate",
  // Ad verification companies (they crawl YOUR page)
  "integral ad science", "doubleverify", "moat",
  "human security", "white ops", "pixalate",
  "forensiq", "peer39", "grapeshot",
  "comscore", "nielsen", "ipsos",
  // Spy tools used by competitors / reviewers
  "similarweb", "semrush", "ahrefs", "moz",
  "alexa internet", "builtWith",
  // Security/compliance scanners
  "recorded future", "threatconnect", "virustotal",
  "sucuri", "cloudflare radar",
]

// ── Known spy tool user-agents ────────────────────────────────
// These tools are used by competitors and ad reviewers to spy on campaigns
export const SPY_TOOL_PATTERNS = [
  /adplexity/i, /adspy/i, /spyfu/i, /whatrunswhere/i,
  /adbeat/i, /mobyaffiliates/i, /affiliatefix/i,
  /similarweb/i, /semrush/i, /ahrefs/i, /moz\.com/i,
  /majestic/i, /compete\.com/i, /alexa\.com/i,
  /adsvantage/i, /adwatcher/i, /ad-maven/i,
  /anstrex/i, /bigspy/i, /poweradspy/i,
  /adcreative/i, /admobispy/i, /spy\.house/i,
  /push\.house.*spy/i, /nativeadsbuzz/i,
]

// ── CIDR utilities ────────────────────────────────────────────
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

// ── Known datacenter CIDR ranges ─────────────────────────────
const KNOWN_DATACENTER_CIDRS = [
  // AWS
  "3.0.0.0/9", "13.32.0.0/15", "13.224.0.0/14", "13.248.0.0/14",
  "15.177.0.0/18", "18.64.0.0/10", "52.0.0.0/11", "52.32.0.0/11",
  "52.64.0.0/11", "52.96.0.0/11", "52.192.0.0/11", "54.64.0.0/11",
  "54.128.0.0/9", "54.160.0.0/11", "54.192.0.0/11", "54.224.0.0/11",
  "3.96.0.0/12", "3.112.0.0/12", "3.128.0.0/9",
  // Google Cloud (compute only — corporate ranges moved to reviewer section)
  "34.0.0.0/10", "34.64.0.0/10", "34.128.0.0/10", "35.184.0.0/13",
  "35.192.0.0/11", "35.224.0.0/12", "104.154.0.0/15", "104.196.0.0/14",
  "130.211.0.0/22", "146.148.0.0/17",
  // Azure / Microsoft (cloud compute only)
  "13.64.0.0/11", "13.96.0.0/13", "13.104.0.0/13", "20.0.0.0/8",
  "40.64.0.0/10", "40.112.0.0/13", "40.120.0.0/14", "51.0.0.0/9",
  "52.224.0.0/11", "104.208.0.0/13",
  // Cloudflare
  "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
  "104.16.0.0/13", "104.24.0.0/14", "108.162.192.0/18",
  "131.0.72.0/22", "141.101.64.0/18", "162.158.0.0/15",
  "172.64.0.0/13", "173.245.48.0/20", "188.114.96.0/20",
  "190.93.240.0/20", "197.234.240.0/22", "198.41.128.0/17",
  // DigitalOcean
  "45.55.0.0/16", "64.225.0.0/16", "104.131.0.0/16",
  "107.170.0.0/16", "138.197.0.0/16", "138.68.0.0/16",
  "159.65.0.0/16", "159.89.0.0/16", "165.232.0.0/16",
  "174.138.0.0/16", "167.99.0.0/16", "161.35.0.0/16",
  // Linode / Akamai
  "23.92.0.0/16", "45.33.0.0/16", "45.56.0.0/16", "50.116.0.0/16",
  "66.175.208.0/20", "69.164.192.0/18", "72.14.176.0/20",
  "96.126.96.0/19", "45.79.0.0/16", "173.255.192.0/18",
  // Hetzner
  "5.9.0.0/16", "5.75.0.0/16", "23.88.0.0/16", "65.108.0.0/16",
  "65.109.0.0/16", "78.46.0.0/15", "88.198.0.0/16", "95.216.0.0/16",
  "116.202.0.0/15", "128.140.0.0/17", "157.90.0.0/16",
  "159.69.0.0/16", "168.119.0.0/16", "176.9.0.0/16", "178.63.0.0/16",
  // Vultr
  "45.63.0.0/18", "45.76.0.0/15", "66.42.64.0/18",
  "104.207.128.0/17", "108.61.64.0/18", "155.138.128.0/17",
  "207.246.64.0/18", "149.28.0.0/16", "144.202.0.0/16",
  // OVH / OVHcloud
  "51.38.0.0/16", "51.68.0.0/16", "51.75.0.0/16", "51.77.0.0/16",
  "51.89.0.0/16", "51.195.0.0/16", "54.36.0.0/14", "135.125.0.0/16",
  "137.74.0.0/16", "145.239.0.0/16", "158.69.0.0/16",
  "185.14.184.0/22", "198.27.64.0/18", "217.182.0.0/15",
  "15.235.0.0/16", "147.135.0.0/16",
  // Oracle Cloud
  "129.80.0.0/11", "130.35.0.0/16", "132.145.0.0/16",
  "134.70.0.0/16", "138.1.0.0/16", "140.91.0.0/16",
  "192.29.0.0/16",
  // Scaleway
  "51.15.0.0/16", "51.158.0.0/15", "62.210.0.0/16",
  "163.172.0.0/16", "212.47.224.0/19",
  // Contabo
  "144.76.0.0/16", "195.201.0.0/16", "213.238.0.0/16",
  // BrightData (Luminati) — commercial proxy/data service
  "45.142.212.0/22", "92.118.160.0/22", "154.16.0.0/16",
]

// ── Known Proxy / TOR exit ranges ───────────────────────────
const KNOWN_PROXY_CIDRS = [
  // TOR exit nodes (expanded)
  "185.220.0.0/16",     // Main TOR exit block
  "185.107.80.0/21",    // TOR relays
  "199.87.154.0/24",
  "198.96.155.0/24",
  "23.129.64.0/18",
  "171.25.193.0/24",    // DFRI TOR exit
  "162.247.72.0/22",    // Calyx TOR exit
  "37.187.129.0/24",    // TOR relay range
  "176.10.104.0/21",    // TOR relay
  "109.70.100.0/22",    // TOR exit
  "51.254.96.0/21",     // TOR relay range
  "185.220.100.0/22",   // TOR relay cluster
  "185.220.101.0/24",   // TOR relay cluster
  "185.220.102.0/23",   // TOR relay cluster
  "185.220.103.0/24",   // TOR relay cluster
  "195.176.3.0/24",     // SWITCH TOR exit
  "178.20.55.0/24",     // TOR exit France
  "94.142.241.0/24",    // TOR exit Netherlands
  "91.108.4.0/22",      // Telegram (often proxied via TOR)
  // Residential proxy services
  "45.142.212.0/22",    // BrightData residential
  "154.16.100.0/22",
  "45.144.0.0/16",      // Oxylabs residential pool
  "185.195.232.0/22",   // SOAX proxy
  "193.26.115.0/24",    // Rayobyte/IPRoyal
]

// ── Per-platform human reviewer CIDR blocks ──────────────────
// Separated so the log entry says "reviewer:google" not "datacenter"

const GOOGLE_REVIEWER_CIDRS = [
  // Google corporate offices & ad review infrastructure
  "66.249.64.0/19", "66.249.80.0/20", "66.249.88.0/21",
  "66.249.92.0/22", "66.249.64.0/20",
  "209.85.128.0/17", "209.85.192.0/19", "209.85.224.0/19",
  "173.194.0.0/16", "74.125.0.0/16",
  "64.233.160.0/19", "72.14.192.0/18",
  "216.58.192.0/19", "216.239.32.0/19",
  "142.250.0.0/15", "172.217.0.0/16",
  "108.177.8.0/21", "108.177.96.0/19",
]

const FACEBOOK_REVIEWER_CIDRS = [
  // Meta / Facebook corporate + data centers used by reviewers
  "31.13.24.0/21", "31.13.64.0/18", "31.13.96.0/19",
  "45.64.40.0/22", "66.220.144.0/20", "66.220.156.0/22",
  "69.63.176.0/20", "69.63.184.0/21",
  "69.171.224.0/19", "69.171.250.0/24",
  "74.119.76.0/22", "102.132.96.0/20",
  "103.4.96.0/22", "129.134.0.0/17",
  "157.240.0.0/17", "157.240.192.0/18",
  "163.70.128.0/17", "163.71.128.0/17", "163.77.128.0/17",
  "173.252.64.0/18", "173.252.96.0/19",
  "179.60.192.0/22", "185.60.216.0/22", "204.15.20.0/22",
]

const TIKTOK_REVIEWER_CIDRS = [
  // ByteDance / TikTok corporate + CDN infrastructure
  "103.18.16.0/22",   // ByteDance Singapore
  "106.75.0.0/16",    // ByteDance Beijing HQ
  "101.226.0.0/15",   // ByteDance China
  "203.107.1.0/24",   // ByteDance China CDN
  "47.246.0.0/16",    // Alibaba Cloud used by ByteDance
  "13.226.0.0/15",    // AWS CloudFront (TikTok uses for delivery)
  "54.230.0.0/15",    // AWS CloudFront (TikTok ads)
  "99.86.0.0/16",     // AWS Global Accelerator (TikTok)
  "18.160.0.0/15",    // AWS (TikTok ad serving)
]

const MICROSOFT_REVIEWER_CIDRS = [
  // Microsoft corporate offices + Bing/LinkedIn review infra
  "65.52.0.0/14",     // Microsoft corporate
  "131.253.0.0/16",   // Microsoft corporate wide
  "134.170.0.0/16",   // Microsoft HQ Redmond
  "157.54.0.0/15",    // Microsoft corporate
  "157.56.0.0/14",    // Microsoft corporate
  "207.46.0.0/16",    // Microsoft MSN/Bing
  "207.68.128.0/18",  // Microsoft
  "40.77.0.0/17",     // Bing crawl infra
  "40.76.0.0/16",     // Microsoft Azure AD / Office
  "52.169.0.0/16",    // LinkedIn (runs on Azure)
]

const TWITTER_REVIEWER_CIDRS = [
  // Twitter / X Corp infrastructure
  "192.133.76.0/22",
  "199.16.156.0/22",
  "199.59.148.0/22",
  "199.96.56.0/21",
  "69.195.160.0/19",
  "104.244.40.0/21",
  "104.244.42.0/24",
  "192.133.77.0/24",
]

const SNAPCHAT_REVIEWER_CIDRS = [
  // Snap Inc. corporate + ad review
  "216.52.24.0/21",   // Snap corporate Santa Monica
  "34.100.0.0/16",    // GCP used by Snap (reviewers use office IPs)
  "35.190.0.0/17",    // GCP used by Snap
  "64.74.220.0/22",   // Snap corporate
]

const LINKEDIN_REVIEWER_CIDRS = [
  // LinkedIn corporate (owned by Microsoft, separate infra)
  "108.174.0.0/16",
  "144.2.0.0/16",
  "216.52.16.0/20",
  "216.52.32.0/20",
  "185.63.144.0/22",  // LinkedIn EMEA
  "13.107.42.0/24",   // LinkedIn (Microsoft-hosted)
]

const PINTEREST_REVIEWER_CIDRS = [
  // Pinterest Inc. infrastructure
  "54.236.0.0/16",
  "54.208.0.0/14",
  "52.2.0.0/15",      // Pinterest AWS us-east
  "54.221.0.0/16",    // Pinterest AWS us-east
]

const REDDIT_REVIEWER_CIDRS = [
  // Reddit infrastructure (Fastly CDN + corporate)
  "151.101.0.0/16",   // Fastly (Reddit's CDN)
  "151.101.64.0/22",
  "151.101.128.0/22",
  "151.101.192.0/22",
  "198.41.128.0/17",  // Cloudflare (Reddit uses this)
  "13.59.0.0/16",     // Reddit AWS
]

// All reviewer CIDRs combined with their platform label
const REVIEWER_CIDR_MAP: Array<{ cidrs: string[]; platform: string }> = [
  { cidrs: GOOGLE_REVIEWER_CIDRS,    platform: "reviewer:google" },
  { cidrs: FACEBOOK_REVIEWER_CIDRS,  platform: "reviewer:facebook" },
  { cidrs: TIKTOK_REVIEWER_CIDRS,    platform: "reviewer:tiktok" },
  { cidrs: MICROSOFT_REVIEWER_CIDRS, platform: "reviewer:microsoft" },
  { cidrs: TWITTER_REVIEWER_CIDRS,   platform: "reviewer:twitter" },
  { cidrs: SNAPCHAT_REVIEWER_CIDRS,  platform: "reviewer:snapchat" },
  { cidrs: LINKEDIN_REVIEWER_CIDRS,  platform: "reviewer:linkedin" },
  { cidrs: PINTEREST_REVIEWER_CIDRS, platform: "reviewer:pinterest" },
  { cidrs: REDDIT_REVIEWER_CIDRS,    platform: "reviewer:reddit" },
]

// ── In-memory cache ───────────────────────────────────────────
const ipCache = new Map<string, { result: IPAnalysis; ts: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// ── Proxy header analysis ─────────────────────────────────────
export function detectProxyHeaders(headers: Record<string, string | null>): {
  isProxy: boolean
  signals: string[]
} {
  const signals: string[] = []

  // Multiple IPs in X-Forwarded-For = traffic passed through proxy chain
  const xff = headers["x-forwarded-for"] || ""
  const xffParts = xff.split(",").map(s => s.trim()).filter(Boolean)
  if (xffParts.length > 1) signals.push("proxy_chain_xff")

  // Via header = definite HTTP proxy
  if (headers["via"]) signals.push("via_header_proxy")

  // Both X-Real-IP and X-Forwarded-For present at the same time
  if (headers["x-real-ip"] && xff) signals.push("dual_ip_headers")

  // Explicit proxy-related headers
  const proxySpecific = [
    "proxy-connection", "x-proxy-id", "x-forwarded-host",
    "forwarded", "x-proxyuser-ip", "x-bluecoat-via",
    "x-six-signature", "x-coming-from", "proxy-authorization",
    "x-proxy-connection",
  ]
  for (const h of proxySpecific) {
    if (headers[h] !== null && headers[h] !== undefined) {
      signals.push(`proxy_header:${h}`)
    }
  }

  return { isProxy: signals.length > 0, signals }
}

// ── Main IP analysis ──────────────────────────────────────────
export async function analyzeIP(ip: string): Promise<IPAnalysis> {
  // Cache check
  const cached = ipCache.get(ip)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result

  const defaultResult: IPAnalysis = {
    isDatacenter: false, isProxy: false, isVPN: false,
    isHosting: false, isTor: false, isHumanReviewer: false,
    provider: null, country: "UNKNOWN", city: "Unknown",
    isp: "Unknown", org: "Unknown", asn: "",
    riskLevel: "low", signals: [],
  }

  // Skip private / local IPs
  if (!ip || ip === "127.0.0.1" || ip === "::1" ||
      ip.startsWith("192.168.") || ip.startsWith("10.") ||
      ip.startsWith("172.16.") || ip.startsWith("172.17.") ||
      ip.startsWith("172.18.") || ip.startsWith("172.31.")) {
    return { ...defaultResult, country: "LOCAL" }
  }

  const signals: string[] = []
  let isDatacenter = false, isProxy = false, isVPN = false
  let isHosting = false, isTor = false, isHumanReviewer = false

  // ── Layer 1: CIDR checks (instant) ──────────────────────
  if (KNOWN_DATACENTER_CIDRS.some(cidr => isInCIDR(ip, cidr))) {
    isDatacenter = true; isHosting = true
    signals.push("known_datacenter_cidr")
  }
  if (KNOWN_PROXY_CIDRS.some(cidr => isInCIDR(ip, cidr))) {
    isTor = true; isProxy = true
    signals.push("known_tor_proxy_cidr")
  }
  // Per-platform reviewer CIDR detection
  for (const { cidrs, platform } of REVIEWER_CIDR_MAP) {
    if (cidrs.some(cidr => isInCIDR(ip, cidr))) {
      isHumanReviewer = true
      signals.push(platform)
      break
    }
  }

  // ── Layer 2: ip-api.com real-time lookup ─────────────────
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(
      `https://pro.ip-api.com/json/${ip}?fields=status,country,countryCode,city,isp,org,as,hosting,proxy,mobile&key=free`,
      { signal: controller.signal }
    ).catch(() =>
      fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,isp,org,as,hosting,proxy,mobile`,
        { signal: controller.signal }
      )
    )
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()

      if (data.status === "success") {
        // Direct API flags
        if (data.hosting) { isHosting = true; isDatacenter = true; signals.push("api:hosting=true") }
        if (data.proxy)   { isProxy   = true;                      signals.push("api:proxy=true") }

        const ispLower = (data.isp || "").toLowerCase()
        const orgLower = (data.org || "").toLowerCase()
        const asLower  = (data.as  || "").toLowerCase()
        const combined = `${ispLower} ${orgLower} ${asLower}`

        // Datacenter ASN
        if (DATACENTER_ASN_KEYWORDS.some(k => combined.includes(k))) {
          isDatacenter = true; isHosting = true
          signals.push("datacenter_asn_keyword")
        }

        // VPN provider
        if (VPN_PROVIDER_KEYWORDS.some(k => combined.includes(k))) {
          isVPN = true; isProxy = true
          signals.push("vpn_provider_keyword")
        }

        // Human reviewer (ad platform corporate network)
        if (HUMAN_REVIEWER_ASN_KEYWORDS.some(k => combined.includes(k))) {
          isHumanReviewer = true
          signals.push(`reviewer_asn:${data.org || data.isp}`)
        }

        // Mobile carrier is a GOOD signal — real visitors
        if (data.mobile) signals.push("mobile_carrier_clean")

        const result: IPAnalysis = {
          isDatacenter, isProxy, isVPN, isHosting, isTor, isHumanReviewer,
          provider: data.org || data.isp || null,
          country: data.countryCode || "UNKNOWN",
          city: data.city || "Unknown",
          isp: data.isp || "Unknown",
          org: data.org || "Unknown",
          asn: data.as || "",
          riskLevel: getRiskLevel(isDatacenter, isProxy, isVPN, isTor, isHumanReviewer),
          signals,
        }
        ipCache.set(ip, { result, ts: Date.now() })
        return result
      }
    }
  } catch {
    signals.push("api_timeout_cidr_only")
  }

  const fallback: IPAnalysis = {
    ...defaultResult,
    isDatacenter, isProxy, isVPN, isHosting, isTor, isHumanReviewer,
    riskLevel: getRiskLevel(isDatacenter, isProxy, isVPN, isTor, isHumanReviewer),
    signals,
  }
  ipCache.set(ip, { result: fallback, ts: Date.now() })
  return fallback
}

function getRiskLevel(
  isDatacenter: boolean,
  isProxy: boolean,
  isVPN: boolean,
  isTor: boolean,
  isHumanReviewer: boolean,
): "low" | "medium" | "high" | "critical" {
  if (isTor) return "critical"
  if (isProxy && isDatacenter) return "critical"
  if (isVPN) return "high"
  if (isHumanReviewer) return "high"
  if (isDatacenter) return "high"
  if (isProxy) return "medium"
  return "low"
}

// ── Wrapper used in track-visit route ────────────────────────
export async function isDatacenterOrProxy(ip: string): Promise<{
  blocked: boolean
  reason: string
  analysis: IPAnalysis
}> {
  const analysis = await analyzeIP(ip)
  const blocked =
    analysis.isDatacenter || analysis.isProxy ||
    analysis.isVPN        || analysis.isTor   ||
    analysis.isHumanReviewer

  let reason = "clean_ip"
  if (analysis.isTor)            reason = "tor_exit_node"
  else if (analysis.isVPN)       reason = "vpn_detected"
  else if (analysis.isProxy)     reason = "proxy_detected"
  else if (analysis.isHumanReviewer) reason = "human_reviewer"
  else if (analysis.isDatacenter) reason = "datacenter_ip"

  return { blocked, reason, analysis }
}

