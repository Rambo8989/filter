import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const isActive = searchParams.get("active")
    const sortBy = searchParams.get("sort") || "confidence_score"
    const sortOrder = searchParams.get("order") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Build the query
    let supabaseQuery = supabaseAdmin.from("bot_patterns").select("*", { count: "exact" })

    // Apply filters
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `pattern.ilike.%${query}%,bot_category.ilike.%${query}%,learning_source.ilike.%${query}%`,
      )
    }

    if (category && category !== "all") {
      supabaseQuery = supabaseQuery.eq("bot_category", category)
    }

    if (isActive !== null && isActive !== "") {
      supabaseQuery = supabaseQuery.eq("is_active", isActive === "true")
    }

    // Apply sorting
    supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    const { data: patterns, error, count } = await supabaseQuery

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      )
    }

    // Get category statistics
    const { data: categoryStats } = await supabaseAdmin
      .from("bot_patterns")
      .select("bot_category")
      .eq("is_active", true)

    const categories = categoryStats?.reduce(
      (acc, pattern) => {
        const category = pattern.bot_category || "unknown"
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      success: true,
      patterns: patterns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      categories: categories || {},
      filters: {
        query,
        category,
        isActive,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error("Error in bot search API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      )
    }

    const body = await request.json()
    const { action, patterns, patternId, updates } = body

    switch (action) {
      case "bulk_update":
        if (!Array.isArray(patterns)) {
          return NextResponse.json(
            {
              success: false,
              error: "Patterns must be an array",
            },
            { status: 400 },
          )
        }

        let updatedCount = 0
        const errors: string[] = []

        for (const pattern of patterns) {
          try {
            const { error } = await supabaseAdmin
              .from("bot_patterns")
              .update({
                ...pattern.updates,
                updated_at: new Date().toISOString(),
              })
              .eq("id", pattern.id)

            if (error) {
              errors.push(`Pattern ${pattern.id}: ${error.message}`)
            } else {
              updatedCount++
            }
          } catch (err) {
            errors.push(`Pattern ${pattern.id}: ${err.message}`)
          }
        }

        return NextResponse.json({
          success: true,
          updatedCount,
          errors,
          message: `Updated ${updatedCount} patterns${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
        })

      case "bulk_delete":
        if (!Array.isArray(patterns)) {
          return NextResponse.json(
            {
              success: false,
              error: "Pattern IDs must be an array",
            },
            { status: 400 },
          )
        }

        const { error: deleteError } = await supabaseAdmin.from("bot_patterns").delete().in("id", patterns)

        if (deleteError) {
          return NextResponse.json(
            {
              success: false,
              error: deleteError.message,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          deletedCount: patterns.length,
          message: `Deleted ${patterns.length} patterns`,
        })

      case "bulk_toggle":
        if (!Array.isArray(patterns)) {
          return NextResponse.json(
            {
              success: false,
              error: "Pattern IDs must be an array",
            },
            { status: 400 },
          )
        }

        const { isActive } = body
        const { error: toggleError } = await supabaseAdmin
          .from("bot_patterns")
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .in("id", patterns)

        if (toggleError) {
          return NextResponse.json(
            {
              success: false,
              error: toggleError.message,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          updatedCount: patterns.length,
          message: `${isActive ? "Activated" : "Deactivated"} ${patterns.length} patterns`,
        })

      case "update_single":
        if (!patternId || !updates) {
          return NextResponse.json(
            {
              success: false,
              error: "Pattern ID and updates are required",
            },
            { status: 400 },
          )
        }

        const { data: updatedPattern, error: updateError } = await supabaseAdmin
          .from("bot_patterns")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", patternId)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            {
              success: false,
              error: updateError.message,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          pattern: updatedPattern,
          message: "Pattern updated successfully",
        })

      case "add_pattern":
        const { pattern, patternType, category, confidence } = body

        if (!pattern || !category || confidence === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: "Pattern, category, and confidence are required",
            },
            { status: 400 },
          )
        }

        const { data: newPattern, error: addError } = await supabaseAdmin
          .from("bot_patterns")
          .insert({
            pattern,
            pattern_type: patternType || "contains",
            bot_category: category,
            confidence_score: confidence,
            auto_detected: false,
            detection_count: 0,
            is_active: true,
            learning_source: "manual",
          })
          .select()
          .single()

        if (addError) {
          return NextResponse.json(
            {
              success: false,
              error: addError.message,
            },
            { status: 400 },
          )
        }

        return NextResponse.json({
          success: true,
          pattern: newPattern,
          message: "Pattern added successfully",
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Error in bot search POST API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
