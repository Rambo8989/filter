import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Name, email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured. Please add Supabase environment variables." }, { status: 503 })
    }

    // Check if user exists
    const { data: existing } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabaseAdmin
      .from("admin_users")
      .insert([{
        name,
        username: email.split("@")[0],
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: "admin",
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error || !user) {
      console.error("Signup error:", error)
      return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      message: "Account created successfully",
    })
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
    })
    return res
  } catch (err) {
    console.error("Signup error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
