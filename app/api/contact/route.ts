import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    console.log("POST /api/contact - Processing contact form submission", {
      name,
      email,
      subject,
    })

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Name, email, and message are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Get visitor IP
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Insert contact submission
    const { data: submission, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim() || "Contact Form Submission",
          message: message.trim(),
          ip_address: ip,
          user_agent: request.headers.get("user-agent") || "",
          status: "new",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("Contact submission saved:", submission.id)

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
      submissionId: submission.id,
    })
  } catch (error) {
    console.error("Error in POST /api/contact:", error)
    return NextResponse.json({ success: false, error: "Failed to submit contact form" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("GET /api/contact - Fetching contact submissions", { limit, offset })

    const { data: submissions, error } = await supabaseAdmin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
      count: submissions?.length || 0,
    })
  } catch (error) {
    console.error("Error in GET /api/contact:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch contact submissions" }, { status: 500 })
  }
}
