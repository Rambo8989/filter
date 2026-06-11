import { supabaseAdmin, isSupabaseConfigured } from "./supabase"

export interface Website {
  id: number
  name: string
  domain: string
  landing_page_url: string
  safe_page_url: string
  allowed_countries: string[]
  blocked_ad_platforms: string[]
  max_visit_limit: number
  visit_limit_time_hours: number
  is_active: boolean
  cloaking_enabled: boolean
  created_at: string
  updated_at: string
}

export interface AccessLog {
  id: number
  website_id: number
  ip_address: string
  country: string
  user_agent: string
  page_shown: string
  is_bot: boolean
  bot_type?: string
  bot_confidence?: number
  referrer?: string
  pathname: string
  reason?: string | null
  action_taken?: string
  ad_platform?: string | null
  region?: string | null
  city?: string | null
  isp?: string | null
  organization?: string | null
  asn?: string | null
  language?: string | null
  campaign_status?: string | null
  created_at: string
}

export interface AccessLogQuery {
  websiteId?: number
  search?: string
  range?: "24h" | "7d" | "30d" | "all"
  result?: "money" | "safe" | "all"
  page?: number
  pageSize?: number
}

export class DatabaseService {
  static async getWebsites(): Promise<Website[]> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return []
    }

    try {
      const { data, error } = await supabaseAdmin.from("websites").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching websites:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getWebsites:", error)
      return []
    }
  }

  static async getWebsiteById(id: number): Promise<Website | null> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return null
    }

    try {
      const { data, error } = await supabaseAdmin.from("websites").select("*").eq("id", id).maybeSingle()

      if (error) {
        console.error("Error fetching website:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getWebsiteById:", error)
      return null
    }
  }

  static async createWebsite(website: Omit<Website, "id" | "created_at" | "updated_at">): Promise<Website | null> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return null
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("websites")
        .insert([
          {
            ...website,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating website:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in createWebsite:", error)
      return null
    }
  }

  static async updateWebsite(id: number, updates: Partial<Website>): Promise<Website | null> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return null
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("websites")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating website:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in updateWebsite:", error)
      return null
    }
  }

  static async deleteWebsite(id: number): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return false
    }

    try {
      const { error } = await supabaseAdmin.from("websites").delete().eq("id", id)

      if (error) {
        console.error("Error deleting website:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deleteWebsite:", error)
      return false
    }
  }

  static async getAccessLogs(websiteId?: number, limit = 100): Promise<AccessLog[]> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return []
    }

    try {
      let query = supabaseAdmin.from("access_logs").select("*").order("created_at", { ascending: false }).limit(limit)

      if (websiteId) {
        query = query.eq("website_id", websiteId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching access logs:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getAccessLogs:", error)
      return []
    }
  }

  static async getAccessLogsFiltered(opts: AccessLogQuery): Promise<{ logs: AccessLog[]; total: number }> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return { logs: [], total: 0 }
    }

    const page = Math.max(1, opts.page || 1)
    const pageSize = Math.min(200, Math.max(1, opts.pageSize || 50))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabaseAdmin
        .from("access_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })

      if (opts.websiteId) {
        query = query.eq("website_id", opts.websiteId)
      }

      if (opts.result === "money" || opts.result === "safe") {
        query = query.eq("page_shown", opts.result)
      }

      if (opts.range && opts.range !== "all") {
        const rangeMs: Record<string, number> = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
        }
        query = query.gte("created_at", new Date(Date.now() - rangeMs[opts.range]).toISOString())
      }

      if (opts.search) {
        // Strip characters that would break the PostgREST .or() filter syntax
        const term = opts.search.replace(/[^a-zA-Z0-9 ._:/-]/g, "").trim()
        if (term) {
          const cols = ["ip_address", "reason", "referrer", "pathname", "country", "bot_type"]
          query = query.or(cols.map(c => `${c}.ilike.%${term}%`).join(","))
        }
      }

      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.error("Error fetching filtered access logs:", error)
        return { logs: [], total: 0 }
      }

      return { logs: data || [], total: count || 0 }
    } catch (error) {
      console.error("Error in getAccessLogsFiltered:", error)
      return { logs: [], total: 0 }
    }
  }

  static async logAccess(logData: Omit<AccessLog, "id" | "created_at">): Promise<AccessLog | null> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return null
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("access_logs")
        .insert([
          {
            ...logData,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error logging access:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in logAccess:", error)
      return null
    }
  }

  static async getAnalytics(websiteId: number, days = 7) {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return {
        totalVisits: 0,
        humanVisits: 0,
        botVisits: 0,
        countries: {},
        botTypes: {},
        dailyStats: [],
      }
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabaseAdmin
        .from("access_logs")
        .select("*")
        .eq("website_id", websiteId)
        .gte("created_at", startDate.toISOString())

      if (error) {
        console.error("Error fetching analytics:", error)
        return {
          totalVisits: 0,
          humanVisits: 0,
          botVisits: 0,
          countries: {},
          botTypes: {},
          dailyStats: [],
        }
      }

      const logs = data || []
      const totalVisits = logs.length
      const humanVisits = logs.filter((log) => !log.is_bot).length
      const botVisits = logs.filter((log) => log.is_bot).length

      // Country distribution
      const countries: Record<string, number> = {}
      logs.forEach((log) => {
        countries[log.country] = (countries[log.country] || 0) + 1
      })

      // Bot types distribution
      const botTypes: Record<string, number> = {}
      logs
        .filter((log) => log.is_bot && log.bot_type)
        .forEach((log) => {
          botTypes[log.bot_type!] = (botTypes[log.bot_type!] || 0) + 1
        })

      // Daily stats
      const dailyStats: Array<{ date: string; humans: number; bots: number }> = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const dayLogs = logs.filter((log) => log.created_at.startsWith(dateStr))
        dailyStats.push({
          date: dateStr,
          humans: dayLogs.filter((log) => !log.is_bot).length,
          bots: dayLogs.filter((log) => log.is_bot).length,
        })
      }

      return {
        totalVisits,
        humanVisits,
        botVisits,
        countries,
        botTypes,
        dailyStats,
      }
    } catch (error) {
      console.error("Error in getAnalytics:", error)
      return {
        totalVisits: 0,
        humanVisits: 0,
        botVisits: 0,
        countries: {},
        botTypes: {},
        dailyStats: [],
      }
    }
  }

  static async checkDatabaseConnection(): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return false
    }

    try {
      // Simple query to test connection - just select one row
      const { data, error } = await supabaseAdmin.from("websites").select("id").limit(1)

      if (error) {
        console.error("Database connection check failed:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking database connection:", error)
      return false
    }
  }
}

export default DatabaseService

export const checkDatabaseConnection = DatabaseService.checkDatabaseConnection
