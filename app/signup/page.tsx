"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const strength = (pw: string) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const pwStrength = strength(form.password)
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength]
  const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"][pwStrength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError("Passwords do not match"); return }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push("/admin/dashboard"), 1500)
      } else {
        setError(data.error || "Signup failed. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F7FF" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ width: 64, height: 64, background: "#D1FAE5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>Account created!</h2>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  )

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
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>Free forever, no credit card needed</h1>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7, marginBottom: 40 }}>Join thousands of marketers protecting their ad campaigns from bot traffic.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: "🚀", title: "5 minutes setup", desc: "Paste one script tag and you're protected" },
              { icon: "🤖", title: "65+ ad platforms", desc: "Google, Meta, TikTok, PropellerAds and more" },
              { icon: "📊", title: "Real-time analytics", desc: "See exactly which bots are hitting your pages" },
              { icon: "🔒", title: "100% free", desc: "No limits, no hidden fees, self-hosted" },
            ].map(f => (
              <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, background: "#EDE9FE", borderRadius: 12, marginBottom: 14 }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#4F46E5"/></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 4 }}>Create your free account</h2>
            <p style={{ fontSize: 14, color: "#6B7280" }}>No credit card required</p>
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><path d="M12 8v4m0 4h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, color: "#991B1B" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: "Full name", key: "name", type: "text", placeholder: "John Smith", auto: "name" },
              { label: "Email address", key: "email", type: "email", placeholder: "you@example.com", auto: "email" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={set(f.key)} required
                  placeholder={f.placeholder} autoComplete={f.auto}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }} />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} required
                  placeholder="Min 8 characters" autoComplete="new-password"
                  style={{ width: "100%", padding: "10px 40px 10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pwStrength * 25}%`, background: strengthColor, borderRadius: 2, transition: "all 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, fontWeight: 500, minWidth: 36 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Confirm password</label>
              <input type="password" value={form.confirm} onChange={set("confirm")} required
                placeholder="Repeat your password" autoComplete="new-password"
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${form.confirm && form.confirm !== form.password ? "#FCA5A5" : "#D1D5DB"}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }} />
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading || !form.name || !form.email || !form.password || form.password !== form.confirm}
              style={{ width: "100%", padding: "11px", background: (loading || !form.name || !form.email || !form.password || form.password !== form.confirm) ? "#A5B4FC" : "#4F46E5", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9CA3AF" }}>
            By signing up you agree to our{" "}
            <span style={{ color: "#4F46E5", cursor: "pointer" }}>Terms of Service</span>
          </p>
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: "#6B7280" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#4F46E5", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
