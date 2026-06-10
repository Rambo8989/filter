import { type NextRequest, NextResponse } from "next/server"

// Bot Training Data Management API
interface BotTrainingEntry {
  id: string
  userAgent: string
  ipAddress: string
  isBot: boolean
  botType?: string
  confidence: number
  timestamp: string
  verified: boolean
  source: "manual" | "auto" | "ml"
}

// In-memory storage (in production, use a database)
let trainingData: BotTrainingEntry[] = [
  // Pre-seeded training data
  {
    id: "1",
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    ipAddress: "66.249.66.1",
    isBot: true,
    botType: "Search Engine",
    confidence: 0.95,
    timestamp: new Date().toISOString(),
    verified: true,
    source: "manual",
  },
  {
    id: "2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ipAddress: "192.168.1.100",
    isBot: false,
    confidence: 0.1,
    timestamp: new Date().toISOString(),
    verified: true,
    source: "manual",
  },
  {
    id: "3",
    userAgent: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    ipAddress: "173.252.66.1",
    isBot: true,
    botType: "Social Media",
    confidence: 0.9,
    timestamp: new Date().toISOString(),
    verified: true,
    source: "manual",
  },
]

// GET - Retrieve training data and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const verified = searchParams.get("verified")

    let filteredData = [...trainingData]

    if (verified !== null) {
      const isVerified = verified === "true"
      filteredData = filteredData.filter((entry) => entry.verified === isVerified)
    }

    const paginatedData = filteredData
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedData,
      total: filteredData.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Bot training GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch training data" }, { status: 500 })
  }
}

// POST - Add training data or feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAgent, ipAddress, isBot, botType, confidence, verified = false, source = "manual" } = body

    if (!userAgent || ipAddress === undefined || isBot === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userAgent, ipAddress, isBot" },
        { status: 400 },
      )
    }

    const newEntry: BotTrainingEntry = {
      id: Date.now().toString(),
      userAgent,
      ipAddress,
      isBot,
      botType: botType || null,
      confidence: confidence || (isBot ? 0.8 : 0.2),
      timestamp: new Date().toISOString(),
      verified,
      source,
    }

    trainingData.push(newEntry)

    // Keep only the latest 1000 entries to prevent memory issues
    if (trainingData.length > 1000) {
      trainingData = trainingData.slice(-1000)
    }

    return NextResponse.json({
      success: true,
      message: "Training entry added successfully",
      data: newEntry,
    })
  } catch (error) {
    console.error("Bot training POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to add training data" }, { status: 500 })
  }
}

// PUT - Update training data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userAgent, ipAddress, isBot, botType, confidence, verified } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Entry ID is required" }, { status: 400 })
    }

    const entryIndex = trainingData.findIndex((entry) => entry.id === id)
    if (entryIndex === -1) {
      return NextResponse.json({ success: false, error: "Training entry not found" }, { status: 404 })
    }

    // Update the entry
    trainingData[entryIndex] = {
      ...trainingData[entryIndex],
      ...(userAgent && { userAgent }),
      ...(ipAddress && { ipAddress }),
      ...(isBot !== undefined && { isBot }),
      ...(botType && { botType }),
      ...(confidence !== undefined && { confidence }),
      ...(verified !== undefined && { verified }),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Training entry updated successfully",
      data: trainingData[entryIndex],
    })
  } catch (error) {
    console.error("Bot training PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update training data" }, { status: 500 })
  }
}

// DELETE - Remove training entries
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Entry ID is required" }, { status: 400 })
    }

    const initialLength = trainingData.length
    trainingData = trainingData.filter((entry) => entry.id !== id)

    if (trainingData.length === initialLength) {
      return NextResponse.json({ success: false, error: "Training entry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Training entry deleted successfully",
    })
  } catch (error) {
    console.error("Bot training DELETE error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete training data" }, { status: 500 })
  }
}
