// ============================================================
// IP REPUTATION STORE
// Remembers blocked IPs for 24 hours — avoids repeat API calls
// and instantly blocks known bad actors on return visits
// ============================================================

interface ReputationEntry {
  blocked: boolean
  reason: string
  category: "bot" | "datacenter" | "vpn" | "proxy" | "tor" | "reviewer" | "suspicious"
  count: number       // how many times this IP has been blocked
  firstSeen: number   // timestamp ms
  lastSeen: number    // timestamp ms
}

const store = new Map<string, ReputationEntry>()
const BLOCK_TTL   = 24 * 60 * 60 * 1000  // 24 hours — blocked IPs remembered
const CLEAN_TTL   =  2 * 60 * 60 * 1000  // 2 hours  — clean IPs cached
const MAX_ENTRIES = 100_000

// ── Lookup ───────────────────────────────────────────────────
export function getIPReputation(ip: string): ReputationEntry | null {
  const entry = store.get(ip)
  if (!entry) return null
  const ttl = entry.blocked ? BLOCK_TTL : CLEAN_TTL
  if (Date.now() - entry.lastSeen > ttl) {
    store.delete(ip)
    return null
  }
  return entry
}

// ── Mark blocked ─────────────────────────────────────────────
export function markIPBlocked(
  ip: string,
  reason: string,
  category: ReputationEntry["category"] = "suspicious",
): void {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return
  const existing = store.get(ip)
  if (existing) {
    existing.count++
    existing.lastSeen = Date.now()
    existing.reason   = reason
    existing.category = category
    existing.blocked  = true
  } else {
    evictIfNeeded()
    store.set(ip, { blocked: true, reason, category, count: 1, firstSeen: Date.now(), lastSeen: Date.now() })
  }
}

// ── Mark clean (real visitor confirmed) ─────────────────────
export function markIPClean(ip: string): void {
  if (!ip) return
  const existing = store.get(ip)
  if (existing) {
    existing.blocked  = false
    existing.lastSeen = Date.now()
  } else {
    evictIfNeeded()
    store.set(ip, { blocked: false, reason: "clean", category: "suspicious", count: 0, firstSeen: Date.now(), lastSeen: Date.now() })
  }
}

// ── High-frequency blocker: repeat offenders ────────────────
// An IP that has been blocked 3+ times gets a permanent-session block
export function isRepeatOffender(ip: string): boolean {
  const entry = store.get(ip)
  return !!(entry && entry.blocked && entry.count >= 3)
}

// ── Stats ────────────────────────────────────────────────────
export function getReputationStats(): { total: number; blocked: number; topOffenders: { ip: string; count: number; reason: string }[] } {
  let blocked = 0
  const offenders: { ip: string; count: number; reason: string }[] = []
  store.forEach((entry, ip) => {
    if (entry.blocked) {
      blocked++
      if (entry.count >= 2) offenders.push({ ip, count: entry.count, reason: entry.reason })
    }
  })
  offenders.sort((a, b) => b.count - a.count)
  return { total: store.size, blocked, topOffenders: offenders.slice(0, 20) }
}

function evictIfNeeded() {
  if (store.size < MAX_ENTRIES) return
  // Remove oldest 1000 entries
  let removed = 0
  store.forEach((_val, key) => {
    if (removed < 1000) {
      store.delete(key)
      removed++
    }
  })
}
