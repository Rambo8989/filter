"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        setError(data.error || "Invalid email or password")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F8F7FF" }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px", background: "#4F46E5" }} className="hidden-mobile">
        <div style={{ maxWidth: 380, color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 600 }}>Traffic Filter Pro</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>Block bots, protect your ad spend</h1>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7, marginBottom: 40 }}>60+ ad platform detection, datacenter IP blocking, real-time analytics — completely free.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {["Real-time bot detection with 5-layer analysis", "65+ ad platform IP ranges blocked automatically", "Datacenter, VPN & proxy detection", "Works with any website — HTML, PHP, WordPress, Next.js"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, background: "#EDE9FE", borderRadius: 12, marginBottom: 16 }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#4F46E5"/></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: "#6B7280" }}>Sign in to your dashboard</p>
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><path d="M12 8v4m0 4h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, color: "#991B1B" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" autoComplete="email"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Password</label>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password" autoComplete="current-password"
                  style={{ width: "100%", padding: "10px 40px 10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0 }}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !email || !password}
              style={{ width: "100%", padding: "11px", background: loading ? "#818CF8" : "#4F46E5", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#6B7280" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "#4F46E5", fontWeight: 500, textDecoration: "none" }}>Create free account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
