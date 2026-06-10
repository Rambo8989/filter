import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  created_at: string
  role?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  token?: string
}

export class AuthService {
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          },
        }
      }

      return { success: false, error: "Failed to create user" }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user && data.session) {
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          },
          token: data.session.access_token,
        }
      }

      return { success: false, error: "Failed to sign in" }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return {
          id: user.id,
          email: user.email!,
          created_at: user.created_at,
        }
      }

      return null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  static async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user && data.session) {
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          },
          token: data.session.access_token,
        }
      }

      return { success: false, error: "Failed to refresh session" }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        })
      } else {
        callback(null)
      }
    })
  }
}

export default AuthService
