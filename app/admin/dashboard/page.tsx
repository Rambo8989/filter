"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Users, Bot } from "lucide-react"

interface AccessLog {
  id: string
  website_id: string
  ip_address: string
  country: string
  user_agent: string
  is_bot: boolean
  bot_type: string | null
  bot_confidence: number
  action_taken: string   // DB field name
  action?: string        // alias — some places use this
  page_shown: string
  created_at: string
  referrer: string | null
  pathname: string
  reason: string | null
  ad_platform: string | null
}

interface Statistics {
  total: number
  bots: number
  humans: number
  allowed: number
  blocked: number
  bot_percentage: string
  block_percentage: string
}

interface Analytics {
  countries: Record<string, number>
  bot_types: Record<string, number>
  hourly: Array<{
    label: string
    total: number
    bots: number
    humans: number
  }>
}

interface DashboardData {
  success: boolean
  logs: AccessLog[]
  statistics: Statistics
  analytics: Analytics
}

function isBlocked(action: string | undefined): boolean {
  const a = (action || "").toLowerCase()
  return a.includes("safe") || a.includes("blocked") || a.includes("landing") || a === "stay_on_safe" || a === "stay_on_landing"
}

function actionLabel(action: string | undefined): string {
  const a = (action || "").toLowerCase()
  if (a === "redirect_money" || a === "redirect_safe")  return "Allowed"
  if (a === "stay_on_safe" || a === "stay_on_landing")  return "Blocked"
  if (a === "blocked")                                   return "Blocked"
  if (a === "campaign_paused")                           return "Paused"
  return "Allowed"
}

function getBrowserName(userAgent: string | null | undefined): string {
  const ua = userAgent || ""
  if (!ua || ua.toLowerCase() === "unknown") return "Unknown"
  if (/curl\//i.test(ua))            return "curl"
  if (/wget\//i.test(ua))            return "Wget"
  if (/python-requests/i.test(ua))   return "Python"
  if (/postman/i.test(ua))           return "Postman"
  if (/edg\//i.test(ua))             return "Edge"
  if (/opr\/|opera/i.test(ua))       return "Opera"
  if (/chrome\/|crios\//i.test(ua))  return "Chrome"
  if (/firefox\/|fxios\//i.test(ua)) return "Firefox"
  if (/safari\//i.test(ua))          return "Safari"
  if (/msie|trident/i.test(ua))      return "Internet Explorer"
  if (/bot|crawler|spider/i.test(ua)) return "Bot"
  return "Other"
}

function pageLabel(pageShown: string | undefined): { text: string; className: string } {
  if (pageShown === "money") return { text: "Money Page", className: "bg-purple-100 text-purple-800" }
  if (pageShown === "safe")  return { text: "Safe Page", className: "bg-gray-100 text-gray-700" }
  return { text: "—", className: "bg-gray-100 text-gray-500" }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const response = await fetch("/api/access-logs?limit=500", { signal: controller.signal })
        .catch(() => { throw new Error("Database connection timeout — check Supabase project is active") })
      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const raw = await response.json()
      const logs: AccessLog[] = Array.isArray(raw) ? raw : []

      const total = logs.length
      const bots = logs.filter(l => l.is_bot).length
      const humans = total - bots
      const blocked = logs.filter(l => isBlocked(l.action_taken || l.action)).length

      const countries: Record<string, number> = {}
      const bot_types: Record<string, number> = {}

      // 24 fixed buckets covering the rolling last 24 hours, oldest → newest
      const HOUR_MS = 60 * 60 * 1000
      const now = Date.now()
      const hourly: Array<{ label: string; total: number; bots: number; humans: number }> =
        Array.from({ length: 24 }, (_, i) => {
          const bucketStart = new Date(now - (23 - i) * HOUR_MS)
          const h = bucketStart.getHours()
          const period = h >= 12 ? "PM" : "AM"
          const h12 = h % 12 === 0 ? 12 : h % 12
          return { label: `${h12} ${period}`, total: 0, bots: 0, humans: 0 }
        })

      logs.forEach(l => {
        if (l.country) countries[l.country] = (countries[l.country] || 0) + 1
        if (l.is_bot && l.bot_type) bot_types[l.bot_type] = (bot_types[l.bot_type] || 0) + 1

        const ageHours = Math.floor((now - new Date(l.created_at).getTime()) / HOUR_MS)
        if (ageHours >= 0 && ageHours < 24) {
          const bucket = hourly[23 - ageHours]
          bucket.total++
          l.is_bot ? bucket.bots++ : bucket.humans++
        }
      })

      setData({
        success: true,
        logs,
        statistics: {
          total, bots, humans,
          allowed: humans,
          blocked,
          bot_percentage: total > 0 ? ((bots / total) * 100).toFixed(1) : "0",
          block_percentage: total > 0 ? ((blocked / total) * 100).toFixed(1) : "0",
        },
        analytics: { countries, bot_types, hourly },
      })
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Never block rendering — show dashboard shell immediately

  const stats = data?.statistics || {
    total: 0,
    bots: 0,
    humans: 0,
    allowed: 0,
    blocked: 0,
    bot_percentage: "0",
    block_percentage: "0",
  }

  const logs = data?.logs || []
  const analytics = data?.analytics || { countries: {}, bot_types: {}, hourly: [] }

  // Get top countries
  const topCountries = Object.entries(analytics.countries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Get top bot types
  const topBotTypes = Object.entries(analytics.bot_types)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Hourly chart helpers
  const hourlyTotal = analytics.hourly.reduce((sum, h) => sum + h.total, 0)
  const maxHourlyVisits = Math.max(...analytics.hourly.map((h) => h.total), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traffic Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time traffic analysis and bot detection</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && <p className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Status banners */}
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle className="h-4 w-4 text-red-500" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13 }}>
            <span style={{ color: "#DC2626", fontWeight: 600 }}>Database Error: </span>
            <span style={{ color: "#B91C1C" }}>{error}</span>
            <span style={{ color: "#6B7280", marginLeft: 8 }}>— Supabase SQL Editor mein <code>scripts/complete-setup.sql</code> run karo, aur project paused ho to resume karo.</span>
          </div>
        </div>
      )}
      {!error && !loading && stats.total === 0 && (
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#15803D" }}>
          Database connected. Abhi tak koi visit log nahi hua — campaign ka tracking code safe page pe install karo.
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All traffic recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Traffic</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bots.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.bot_percentage}% of total traffic</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Human Traffic</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.humans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.humans / stats.total) * 100).toFixed(1) : "0"}% legitimate traffic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.blocked.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.block_percentage}% blocked/filtered</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length > 0 ? (
              <div className="space-y-3">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="font-medium">{country}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${stats.total > 0 ? ((count as number) / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No country data available</p>
            )}
            {topCountries.length > 0 && topCountries.every(([c]) => c === "UNKNOWN") && (
              <p className="text-xs text-gray-400 mt-3">
                Country localhost par detect nahi hoti (Cloudflare/Vercel ke geo headers nahi milte). Live domain (limbun.online) se aane wale visits par real country code dikhega.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Bot Types */}
        <Card>
          <CardHeader>
            <CardTitle>Detected Bot Types</CardTitle>
          </CardHeader>
          <CardContent>
            {topBotTypes.length > 0 ? (
              <div className="space-y-3">
                {topBotTypes.map(([botType, count]) => (
                  <div key={botType} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{botType.replace(/_/g, " ")}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${stats.bots > 0 ? ((count as number) / stats.bots) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No bot types detected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Traffic Chart */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Hourly Traffic</CardTitle>
            <CardDescription>Visits per hour over the last 24 hours</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Human
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Bot
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {hourlyTotal > 0 ? (
            <div className="flex gap-3">
              {/* Y-axis scale */}
              <div className="flex flex-col justify-between h-48 pb-5 text-xs text-gray-400 text-right">
                <span>{maxHourlyVisits}</span>
                <span>{Math.round(maxHourlyVisits * 0.75)}</span>
                <span>{Math.round(maxHourlyVisits * 0.5)}</span>
                <span>{Math.round(maxHourlyVisits * 0.25)}</span>
                <span>0</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Plot area with gridlines */}
                <div className="relative h-48 border-b border-gray-200">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-gray-100 w-full" />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-end gap-[3px]">
                    {analytics.hourly.map((h, i) => (
                      <div
                        key={i}
                        className="group relative flex-1 h-full flex flex-col justify-end min-w-0"
                        title={`${h.label}: ${h.total} visit${h.total === 1 ? "" : "s"} (${h.humans} human, ${h.bots} bot)`}
                      >
                        {h.bots > 0 && (
                          <div
                            className="w-full bg-red-400 group-hover:bg-red-500 transition-colors"
                            style={{ height: `${(h.bots / maxHourlyVisits) * 100}%` }}
                          />
                        )}
                        {h.humans > 0 && (
                          <div
                            className={`w-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors ${h.bots === 0 ? "rounded-t-sm" : ""}`}
                            style={{ height: `${(h.humans / maxHourlyVisits) * 100}%` }}
                          />
                        )}
                        {h.total === 0 && (
                          <div className="w-full bg-gray-100 rounded-t-sm" style={{ height: "2px" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex gap-[3px] mt-1.5">
                  {analytics.hourly.map((h, i) => (
                    <div key={i} className="flex-1 min-w-0 text-center text-[10px] text-gray-400 truncate">
                      {i % 3 === 0 || i === 23 ? h.label : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No traffic in the last 24 hours</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/admin/logs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View full click log →
          </Link>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => {
                const page = pageLabel(log.page_shown)
                return (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {log.is_bot ? (
                      <Bot className="h-4 w-4 text-red-500" />
                    ) : (
                      <Users className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono text-sm">{log.ip_address}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded" title="Country">{log.country || "UNKNOWN"}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded" title="Browser">{getBrowserName(log.user_agent)}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            log.is_bot ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {log.is_bot ? `Bot: ${log.bot_type || "Unknown"}` : "Human"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isBlocked(log.action_taken)
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {actionLabel(log.action_taken)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${page.className}`} title="Page shown to visitor">
                          {page.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-md mt-1">
                        {log.pathname || "/"} • {(log.user_agent || "Unknown").substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                    {log.is_bot && log.bot_confidence && (
                      <div className="text-xs text-red-600">{Math.round(log.bot_confidence * 100)}% confidence</div>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Traffic data will appear here once visitors start coming</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
