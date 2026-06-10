// Production-ready geolocation service
export async function getCountryFromIP(ip: string): Promise<string> {
  // Handle local/private IPs
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") ||
    ip.startsWith("172.23.") ||
    ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") ||
    ip.startsWith("172.26.") ||
    ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") ||
    ip.startsWith("172.29.") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  ) {
    return "LOCAL"
  }

  try {
    // Using ip-api.com (free, no API key required, 1000 requests/hour)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode,country,regionName,city,isp,org,as,mobile,proxy,hosting`,
      {
        timeout: 5000,
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "success") {
      return data.countryCode || "UNKNOWN"
    }

    console.warn("IP geolocation failed:", data.message)
    return "UNKNOWN"
  } catch (error) {
    console.error("Geolocation error:", error)

    // Fallback: Try to determine country from IP ranges (basic)
    return getCountryFromIPRange(ip)
  }
}

// Fallback country detection using IP ranges
function getCountryFromIPRange(ip: string): string {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4) return "UNKNOWN"

  const firstOctet = parts[0]
  const secondOctet = parts[1]

  // Basic IP range detection (simplified)
  // US ranges
  if (
    (firstOctet >= 3 && firstOctet <= 6) ||
    (firstOctet >= 8 && firstOctet <= 15) ||
    (firstOctet >= 16 && firstOctet <= 31) ||
    (firstOctet >= 32 && firstOctet <= 63) ||
    (firstOctet >= 64 && firstOctet <= 127)
  ) {
    return "US"
  }

  // European ranges (simplified)
  if (firstOctet >= 128 && firstOctet <= 191) {
    return "EU"
  }

  // Asian ranges (simplified)
  if (firstOctet >= 192 && firstOctet <= 223) {
    return "AS"
  }

  return "UNKNOWN"
}

// Get additional IP information
export async function getIPInfo(ip: string): Promise<{
  country: string
  region: string
  city: string
  isp: string
  isHosting: boolean
  isProxy: boolean
  isMobile: boolean
}> {
  const defaultResponse = {
    country: "UNKNOWN",
    region: "Unknown",
    city: "Unknown",
    isp: "Unknown",
    isHosting: false,
    isProxy: false,
    isMobile: false,
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode,country,regionName,city,isp,org,mobile,proxy,hosting`,
      {
        timeout: 5000,
      },
    )

    // Check if response is OK
    if (!response.ok) {
      console.error(
        `IP info API error: HTTP ${response.status} for IP ${ip}`,
      )
      return defaultResponse
    }

    // Get response text first to validate it's JSON
    const responseText = await response.text()

    // Validate response is not empty
    if (!responseText || responseText.trim().length === 0) {
      console.error("IP info API returned empty response")
      return defaultResponse
    }

    // Try to parse JSON with error handling
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error(
        `Failed to parse IP info response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
      console.error(`Response text: ${responseText.substring(0, 100)}`)
      return defaultResponse
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("IP info API returned invalid data structure")
      return defaultResponse
    }

    if (data.status === "success") {
      return {
        country: String(data.countryCode || "UNKNOWN"),
        region: String(data.regionName || "Unknown"),
        city: String(data.city || "Unknown"),
        isp: String(data.isp || "Unknown"),
        isHosting: Boolean(data.hosting),
        isProxy: Boolean(data.proxy),
        isMobile: Boolean(data.mobile),
      }
    }

    // Handle API errors
    console.warn(`IP info API error: ${data.message || "Unknown error"}`)
    return defaultResponse
  } catch (error) {
    console.error(
      `IP info request failed: ${error instanceof Error ? error.message : String(error)}`,
    )
    return defaultResponse
  }
}
