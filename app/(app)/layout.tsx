"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.success) setUser(data.user)
        else router.replace("/login")
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false))
  }, [])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    router.replace("/login")
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F7FF" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: "#4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  )

  if (!user) return null

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/campaigns", label: "Campaigns", icon: "🚀" },
    { href: "/logs", label: "Click Log", icon: "📋" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <header style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Logo */}
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: "#4F46E5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Traffic Filter Pro</span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4 }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none",
                  background: pathname === item.href ? "#EDE9FE" : "transparent",
                  color: pathname === item.href ? "#4F46E5" : "#6B7280" }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{user.email}</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, color: "#4F46E5" }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <button onClick={logout}
            style={{ padding: "6px 12px", border: "1px solid #E5E7EB", borderRadius: 8, background: "white", fontSize: 13, color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "24px" }}>
        {children}
      </main>
    </div>
  )
}
