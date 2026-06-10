"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface TrainingData {
  userAgent: string
  isBot: boolean
  botType?: string
  category?: string
}

export function BotTrainingInterface() {
  const [userAgent, setUserAgent] = useState("")
  const [isBot, setIsBot] = useState<boolean | null>(null)
  const [botType, setBotType] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    if (!userAgent.trim() || isBot === null) return

    setLoading(true)
    setMessage("")

    try {
      const trainingData: TrainingData = {
        userAgent: userAgent.trim(),
        isBot,
        botType: isBot && botType.trim() ? botType.trim() : undefined,
        category: isBot && category.trim() ? category.trim() : undefined,
      }

      const response = await fetch("/api/bot-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingData),
      })

      if (response.ok) {
        setMessage("Training data submitted successfully!")
        // Reset form
        setUserAgent("")
        setIsBot(null)
        setBotType("")
        setCategory("")
      } else {
        setMessage("Failed to submit training data")
      }
    } catch (error) {
      console.error("Error submitting training data:", error)
      setMessage("Error submitting training data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bot Detection Training</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">User Agent</label>
            <Textarea
              placeholder="Enter user agent string..."
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Classification</label>
            <div className="mt-2 flex gap-4">
              <Button variant={isBot === false ? "default" : "outline"} onClick={() => setIsBot(false)} size="sm">
                Human
              </Button>
              <Button variant={isBot === true ? "default" : "outline"} onClick={() => setIsBot(true)} size="sm">
                Bot
              </Button>
            </div>
          </div>

          {isBot === true && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Bot Type</label>
                <Input
                  placeholder="e.g., Googlebot, Facebook Bot, etc."
                  value={botType}
                  onChange={(e) => setBotType(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  <option value="search_engine">Search Engine</option>
                  <option value="social_media">Social Media</option>
                  <option value="ad_verification">Ad Verification</option>
                  <option value="content_discovery">Content Discovery</option>
                  <option value="automation">Automation Tool</option>
                  <option value="scraper">Scraper</option>
                  <option value="monitor">Monitor</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading || !userAgent.trim() || isBot === null} className="flex-1">
              {loading ? "Submitting..." : "Submit Training Data"}
            </Button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Human Traffic:</strong> Regular browsers, mobile apps, legitimate users
            </p>
            <p>
              <strong>Search Engine Bots:</strong> Googlebot, Bingbot, etc. (usually allowed)
            </p>
            <p>
              <strong>Social Media Bots:</strong> Facebook, Twitter crawlers (usually allowed)
            </p>
            <p>
              <strong>Ad Verification:</strong> IAS, DoubleVerify, Moat (should be blocked)
            </p>
            <p>
              <strong>Automation Tools:</strong> Selenium, Puppeteer, headless browsers (block)
            </p>
            <p>
              <strong>Scrapers:</strong> Data collection bots (block)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BotTrainingInterface
