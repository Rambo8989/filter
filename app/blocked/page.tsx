"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Bot, Globe, Clock, RefreshCw } from "lucide-react"

export default function BlockedPage() {
  const [visitorInfo, setVisitorInfo] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Collect visitor information
    const info = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString(),
    }
    setVisitorInfo(info)

    // Log the blocked page visit
    fetch("/api/log-current-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteId: "demo",
        campaignCode: "BLOCKED_PAGE",
        userAgent: info.userAgent,
        referrer: document.referrer,
        url: window.location.href,
        pathname: "/blocked",
        timestamp: Date.now(),
        screenWidth: screen.width,
        screenHeight: screen.height,
        timezone: info.timezone,
        language: info.language,
      }),
    }).catch(console.warn)
  }, [])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    // Simulate a retry delay
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Temporarily Restricted</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our security system has detected unusual activity. Please wait a moment before trying again.
          </p>
          <Badge variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Security Check Active
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Message */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center">
                  <Bot className="h-6 w-6 mr-2" />
                  Security Verification
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Protecting our platform from automated traffic
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Why am I seeing this page?</h3>
                    <ul className="space-y-2 text-yellow-700">
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Our system detected patterns consistent with automated browsing</span>
                      </li>
                      <li className="flex items-start">
                        <Globe className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Your location may be temporarily restricted</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>High traffic volume from your network</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">What can I do?</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-start">
                        <RefreshCw className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Wait a few minutes and try refreshing the page</span>
                      </li>
                      <li className="flex items-start">
                        <Globe className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Ensure you're using a standard web browser</span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Disable any automation tools or browser extensions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleRetry}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={retryCount > 0}
                    >
                      {retryCount > 0 ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Retrying... ({retryCount})
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Try Again
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  Detection Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitorInfo && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Browser:</span>
                      <p className="text-gray-600 text-xs break-all">{visitorInfo.userAgent.substring(0, 50)}...</p>
                    </div>
                    <div>
                      <span className="font-medium">Language:</span>
                      <p className="text-gray-600">{visitorInfo.language}</p>
                    </div>
                    <div>
                      <span className="font-medium">Timezone:</span>
                      <p className="text-gray-600">{visitorInfo.timezone}</p>
                    </div>
                    <div>
                      <span className="font-medium">Screen:</span>
                      <p className="text-gray-600">{visitorInfo.screenResolution}</p>
                    </div>
                    <div>
                      <span className="font-medium">Detected:</span>
                      <p className="text-gray-600">{new Date(visitorInfo.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Info */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you believe this is an error, please contact our support team.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-red-800 mb-2">Security First</h3>
                <p className="text-sm text-red-700">
                  We protect our platform and users from automated threats and malicious activity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 Security System. All rights reserved.</p>
          <p className="mt-2">This page is shown when automated activity is detected.</p>
        </div>
      </div>
    </div>
  )
}
