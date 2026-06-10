"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BotSearchResult {
  userAgent: string
  isBot: boolean
  botType: string | null
  confidence: number
  category: string
  riskLevel: string
}

export function BotSearchInterface() {
  const [userAgent, setUserAgent] = useState("")
  const [results, setResults] = useState<BotSearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!userAgent.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/bot-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAgent }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        console.error("Failed to search bot")
      }
    } catch (error) {
      console.error("Error searching bot:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bot Detection Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user agent string..."
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !userAgent.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {results && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Detection Result</label>
                  <div className="mt-1">
                    <Badge variant={results.isBot ? "destructive" : "default"}>
                      {results.isBot ? "BOT DETECTED" : "HUMAN"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence</label>
                  <div className="mt-1">
                    <Badge variant="outline">{Math.round(results.confidence * 100)}%</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Bot Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{results.botType || "N/A"}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <div className="mt-1">
                    <Badge variant="outline">{results.category}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Risk Level</label>
                <div className="mt-1">
                  <Badge className={getRiskColor(results.riskLevel)}>{results.riskLevel.toUpperCase()}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">User Agent</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm font-mono break-all">{results.userAgent}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BotSearchInterface
