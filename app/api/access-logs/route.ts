import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getSessionUser, getUserWebsiteIds } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const auth = getSessionUser(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ownedIds = await getUserWebsiteIds(auth.userId)

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get("websiteId")

    // A specific campaign was requested — make sure it belongs to this user
    if (websiteId && !ownedIds.includes(Number(websiteId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Paginated / filtered click-log query (used by the Logs page)
    const page = searchParams.get("page")
    const pageSize = searchParams.get("pageSize")
    const search = searchParams.get("search")
    const range = searchParams.get("range") as "24h" | "7d" | "30d" | "all" | null
    const result = searchParams.get("result") as "money" | "safe" | "all" | null

    if (page || pageSize || search || range || result) {
      const data = await DatabaseService.getAccessLogsFiltered({
        websiteId: websiteId ? Number(websiteId) : undefined,
        websiteIds: websiteId ? undefined : ownedIds,
        search: search || undefined,
        range: range || "all",
        result: result || "all",
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 50,
      })
      return NextResponse.json(data)
    }

    // Legacy: plain array of recent logs (used by the dashboard overview)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const logs = await DatabaseService.getAccessLogs(
      websiteId ? Number(websiteId) : undefined,
      limit,
      websiteId ? undefined : ownedIds
    )

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
