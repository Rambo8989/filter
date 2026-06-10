"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotSearchInterface } from "@/components/bot-search-interface"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, TrendingUp, Shield, Bot } from "lucide-react"

interface BotAnalytics {
  timeRange: string
  totalBotDetections: number
  botTypeStats: Record<string, number>
  categoryStats: Record<string, any>
  topPatterns: any[]
  timeline: Record<string, number>
  summary: {
    totalPatterns: number
    activePatterns: number
    autoDetectedPatterns: number
    avgConfidence: number
  }
}

export default function BotManagementPage() {
  const [analytics, setAnalytics] = useState<BotAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bot-analytics?range=${timeRange}`)
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const runComprehensiveUpdate = async () => {
    setLoading(true)
    try {
      // This would trigger the comprehensive bot patterns SQL script
      const response = await fetch("/api/bot-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comprehensive_update",
        }),
      })
      const data = await response.json()
      if (data.success) {
        loadAnalytics()
      }
    } catch (error) {
      console.error("Error running comprehensive update:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bot Management</h1>
          <p className="text-muted-foreground">Comprehensive bot detection pattern management and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runComprehensiveUpdate} disabled={loading}>
            <Database className="h-4 w-4 mr-2" />
            Update Database
          </Button>
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search & Manage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patterns</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.totalPatterns}</div>
                    <p className="text-xs text-muted-foreground">{analytics.summary.activePatterns} active patterns</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bot Detections</CardTitle>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalBotDetections}</div>
                    <p className="text-xs text-muted-foreground">Last {timeRange}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Auto-Detected</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.autoDetectedPatterns}</div>
                    <p className="text-xs text-muted-foreground">Machine learning patterns</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(analytics.summary.avgConfidence * 100).toFixed(1)}%</div>
                    <Progress value={analytics.summary.avgConfidence * 100} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Pattern Categories</CardTitle>
                  <CardDescription>Breakdown of bot patterns by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analytics.categoryStats).map(([category, stats]) => (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{category.replace(/_/g, " ")}</h4>
                          <Badge variant="secondary">{stats.total}</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Active:</span>
                            <span>{stats.active}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Auto-detected:</span>
                            <span>{stats.autoDetected}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Detections:</span>
                            <span>{stats.totalDetections}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Confidence:</span>
                            <span>{(stats.avgConfidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Patterns</CardTitle>
                  <CardDescription>Most frequently detected bot patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.topPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{pattern.pattern}</code>
                          <Badge className="text-xs">{pattern.bot_category.replace(/_/g, " ")}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{pattern.detection_count} detections</span>
                          <span>{(pattern.confidence_score * 100).toFixed(1)}% confidence</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="search">
          <BotSearchInterface />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Bot Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Bot Type Distribution</CardTitle>
                  <CardDescription>Most common bot types detected in the last {timeRange}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.botTypeStats)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([botType, count]) => (
                        <div key={botType} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{botType}</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(count / Math.max(...Object.values(analytics.botTypeStats))) * 100}
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detection Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Detection Timeline</CardTitle>
                  <CardDescription>Bot detections over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.timeline)
                      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                      .slice(-24) // Show last 24 hours
                      .map(([timestamp, count]) => (
                        <div key={timestamp} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{new Date(timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(count / Math.max(...Object.values(analytics.timeline))) * 100}
                              className="w-32"
                            />
                            <span className="w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
