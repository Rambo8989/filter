"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  action: string
  page_shown: string
  created_at: string
  referrer: string | null
  pathname: string
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
    hour: number
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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/log-current-access")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: DashboardData = await response.json()

      if (!result.success) {
        throw new Error("Failed to fetch dashboard data")
      }

      setData(result)
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

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
            Refresh
          </Button>
        </div>
      </div>

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
        <CardHeader>
          <CardTitle>Hourly Traffic (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.hourly.length > 0 ? (
            <div className="space-y-2">
              {analytics.hourly.slice(-12).map((hourData, index) => {
                const maxVisits = Math.max(...analytics.hourly.map((h) => h.total), 1)
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-mono">{hourData.hour.toString().padStart(2, "0")}:00</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(hourData.total / maxVisits) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm space-x-2">
                      <span className="text-green-600">👥 {hourData.humans}</span>
                      <span className="text-red-600">🤖 {hourData.bots}</span>
                      <span className="font-medium">Total: {hourData.total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hourly data available yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {log.is_bot ? (
                      <Bot className="h-4 w-4 text-red-500" />
                    ) : (
                      <Users className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{log.ip_address}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{log.country}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            log.is_bot ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {log.is_bot ? `Bot: ${log.bot_type || "Unknown"}` : "Human"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            log.action.includes("blocked")
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-md mt-1">
                        {log.pathname} • {log.user_agent.substring(0, 60)}...
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
              ))}
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
