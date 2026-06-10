import { NextResponse } from "next/server"
import { getAdPlatformList, AD_PLATFORM_CATEGORIES, detectAdPlatform } from "@/lib/ad-platform-detection"

// GET — return all available platforms for UI selector
export async function GET() {
  const platforms = getAdPlatformList()
  return NextResponse.json({
    success: true,
    data: platforms,
    categories: AD_PLATFORM_CATEGORIES,
    total: platforms.length,
  })
}

// POST — detect ad platform from IP/UA/referrer
export async function POST(request: Request) {
  try {
    const { ip = "", userAgent = "", referrer = "", selectedPlatforms = [] } = await request.json()
    const result = detectAdPlatform(ip, userAgent, referrer, selectedPlatforms)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Detection failed" }, { status: 500 })
  }
}
