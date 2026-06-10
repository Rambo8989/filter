import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return NextResponse.json({ success: true, user: { id: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role } })
  } catch {
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
  }
}
