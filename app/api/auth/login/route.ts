import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"
    // 400 days — the max cookie lifetime browsers allow. Combined with a
    // non-expiring JWT, this keeps the user logged in until they log out.
    const COOKIE_MAX_AGE = 60 * 60 * 24 * 400

    // ── DEV MODE (no Supabase) ────────────────────────────────
    if (!isSupabaseConfigured()) {
      if (email === "admin@example.com" && password === "Admin@123") {
        const token = jwt.sign(
          { userId: "dev-1", email, name: "Admin", role: "admin" },
          JWT_SECRET
        )
        const res = NextResponse.json({ success: true, user: { id: "dev-1", email, name: "Admin", role: "admin" } })
        res.cookies.set("auth-token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: COOKIE_MAX_AGE })
        return res
      }
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // ── PRODUCTION MODE ───────────────────────────────────────
    const { data: user, error } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login (fire & forget)
    supabaseAdmin.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id).then()

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name || user.username, role: user.role },
      JWT_SECRET
    )

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name || user.username, role: user.role },
    })
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    })
    return res
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
