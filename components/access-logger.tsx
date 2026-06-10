"use client"

import { useEffect, useState } from "react"

interface AccessLoggerProps {
  websiteId?: string
  domain?: string
  trackingId?: string
}

interface LogResponse {
  success: boolean
  detection?: {
    is_bot: boolean
    bot_type: string | null
    confidence: number
    category: string
    risk_score: number
    signals: string[]
  }
  ip_info?: {
    country: string
    region: string
    city: string
    isp: string
    is_hosting: boolean
    is_proxy: boolean
    is_mobile: boolean
  }
  action?: string
  redirect_to?: string | null
}

export function AccessLogger({ websiteId = "1", domain = "unknown", trackingId = "default" }: AccessLoggerProps) {
  const [loggedData, setLoggedData] = useState<LogResponse | null>(null)

  useEffect(() => {
    const logAccess = async () => {
      try {
        // Collect comprehensive user data
        const userData = {
          website_id: websiteId,
          ip_address: "client", // Will be replaced by server with real IP
          country: "unknown", // Will be detected by server
          user_agent: navigator?.userAgent || "unknown",
          page_shown: "main",
          is_bot: false, // Will be determined by server
          referrer: document?.referrer || null,
          pathname: window?.location?.pathname || "/",
          action: "allowed",
          screen_width: screen?.width || null,
          screen_height: screen?.height || null,
          timezone: null,
          language: navigator?.language || null,
          page_url: window?.location?.href || null,
          // Additional browser fingerprinting data
          platform: navigator?.platform || null,
          cookie_enabled: navigator?.cookieEnabled || false,
          do_not_track: navigator?.doNotTrack || null,
          hardware_concurrency: navigator?.hardwareConcurrency || null,
          max_touch_points: navigator?.maxTouchPoints || null,
          vendor: navigator?.vendor || null,
          webdriver: (navigator as any)?.webdriver || false,
        }

        // Try to get timezone safely
        try {
          userData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        } catch (e) {
          userData.timezone = null
        }

        console.log("🔍 Logging access with comprehensive data:", {
          pathname: userData.pathname,
          user_agent: userData.user_agent?.substring(0, 50) + "...",
          screen: `${userData.screen_width}x${userData.screen_height}`,
          timezone: userData.timezone,
          language: userData.language,
        })

        const response = await fetch("/api/log-current-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result: LogResponse = await response.json()
        console.log("✅ Access logged successfully:", {
          success: result.success,
          is_bot: result.detection?.is_bot,
          bot_type: result.detection?.bot_type,
          confidence: result.detection?.confidence,
          risk_score: result.detection?.risk_score,
          country: result.ip_info?.country,
          action: result.action,
        })

        setLoggedData(result)

        // Handle redirect if needed
        if (result.redirect_to && result.redirect_to !== window.location.pathname) {
          console.log(`🔄 Redirecting to: ${result.redirect_to}`)
          window.location.href = result.redirect_to
        }

        if (!result.success) {
          console.warn("⚠️ Access logging failed:", result)
        }
      } catch (error) {
        console.error("❌ Failed to log access:", error)
        // Don't throw error to avoid breaking the page
      }
    }

    // Log access after a short delay to ensure page is loaded
    const timer = setTimeout(logAccess, 1000)
    return () => clearTimeout(timer)
  }, [websiteId, domain, trackingId])

  // This component doesn't render anything visible
  // But you can add debug info in development
  if (process.env.NODE_ENV === "development" && loggedData) {
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs max-w-xs opacity-75 z-50">
        <div>🔍 Traffic Analysis</div>
        <div>Bot: {loggedData.detection?.is_bot ? "YES" : "NO"}</div>
        {loggedData.detection?.bot_type && <div>Type: {loggedData.detection.bot_type}</div>}
        <div>Country: {loggedData.ip_info?.country}</div>
        <div>Action: {loggedData.action}</div>
      </div>
    )
  }

  return null
}

// Also export as default for compatibility
export default AccessLogger
