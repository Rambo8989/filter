"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, Users, TrendingUp, Star, ArrowRight, Zap, Target, Globe } from "lucide-react"

export default function SafePage() {
  const [visitorInfo, setVisitorInfo] = useState<any>(null)

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

    // Log the safe page visit
    fetch("/api/log-current-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteId: "demo",
        campaignCode: "SAFE_PAGE",
        userAgent: info.userAgent,
        referrer: document.referrer,
        url: window.location.href,
        pathname: "/safe",
        timestamp: Date.now(),
        screenWidth: screen.width,
        screenHeight: screen.height,
        timezone: info.timezone,
        language: info.language,
      }),
    }).catch(console.warn)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Premium Platform</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You've been verified as a legitimate visitor. Access our exclusive content and premium features.
          </p>
          <Badge variant="default" className="mt-4 bg-green-600">
            <Shield className="h-4 w-4 mr-2" />
            Verified Human Traffic
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Offer */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center">
                  <Star className="h-6 w-6 mr-2" />
                  Premium Business Solution
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Transform your business with our advanced platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold">10,000+</h3>
                      <p className="text-sm text-gray-600">Active Users</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold">300%</h3>
                      <p className="text-sm text-gray-600">ROI Increase</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold">50+</h3>
                      <p className="text-sm text-gray-600">Countries</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">What You Get:</h3>
                    <ul className="space-y-3">
                      {[
                        "Advanced Analytics Dashboard",
                        "24/7 Premium Support",
                        "Custom Integration Options",
                        "Real-time Data Processing",
                        "Enterprise Security Features",
                        "Unlimited API Calls",
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Special Offer</h3>
                        <p className="text-blue-100">Limited time - 50% off first year</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">$99/mo</div>
                        <div className="text-sm line-through text-blue-200">$199/mo</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Start Your Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Visitor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Visitor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitorInfo && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-gray-600">{visitorInfo.timezone}</p>
                    </div>
                    <div>
                      <span className="font-medium">Language:</span>
                      <p className="text-gray-600">{visitorInfo.language}</p>
                    </div>
                    <div>
                      <span className="font-medium">Screen:</span>
                      <p className="text-gray-600">{visitorInfo.screenResolution}</p>
                    </div>
                    <div>
                      <span className="font-medium">Visit Time:</span>
                      <p className="text-gray-600">{new Date(visitorInfo.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Testimonial */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm italic text-gray-700 mb-3">
                  "This platform transformed our business operations. The ROI was immediate and substantial."
                </blockquote>
                <cite className="text-sm font-medium">— Sarah Johnson, CEO</cite>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Secure & Verified</h3>
                <p className="text-sm text-green-700">
                  Your connection is encrypted and your data is protected by enterprise-grade security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 Premium Platform. All rights reserved.</p>
          <p className="mt-2">This page is shown to verified human visitors only.</p>
        </div>
      </div>
    </div>
  )
}
