import { type NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { supabaseAdmin, isSupabaseConfigured } from "./supabase"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

export interface SessionUser {
  userId: number | string
  email: string
  name?: string
  role?: string
}

// Reads and verifies the auth-token cookie, returning the JWT payload
export function getSessionUser(request: NextRequest): SessionUser | null {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

// Returns the IDs of every campaign (website) owned by this user — used to
// scope access_logs / analytics queries to only that user's campaigns
export async function getUserWebsiteIds(userId: number | string): Promise<number[]> {
  if (!isSupabaseConfigured()) return []

  const { data, error } = await supabaseAdmin.from("websites").select("id").eq("user_id", userId)
  if (error || !data) return []
  return data.map((w: { id: number }) => w.id)
}
