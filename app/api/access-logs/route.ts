import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const logs = await DatabaseService.getAccessLogs(websiteId || undefined, limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching access logs:", error)
    return NextResponse.json({ error: "Failed to fetch access logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const logData = await request.json()
    const log = await DatabaseService.logAccess(logData)
    return NextResponse.json(log)
  } catch (error) {
    console.error("Error creating access log:", error)
    return NextResponse.json({ error: "Failed to create access log" }, { status: 500 })
  }
}
