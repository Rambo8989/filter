import Link from "next/link"

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "#4F46E5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>Traffic Filter Pro</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{ padding: "8px 18px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, color: "#374151", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          <Link href="/signup" style={{ padding: "8px 18px", background: "#4F46E5", borderRadius: 8, fontSize: 14, color: "white", textDecoration: "none", fontWeight: 500 }}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EDE9FE", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "#4F46E5", fontWeight: 500 }}>✨ Free forever — no credit card needed</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: "#111", lineHeight: 1.15, marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
          Stop bots from<br /><span style={{ color: "#4F46E5" }}>wasting your ad budget</span>
        </h1>
        <p style={{ fontSize: 18, color: "#6B7280", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Block datacenter IPs, ad platform crawlers, and bots before they hit your landing pages. Works with any website in 5 minutes.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "13px 28px", background: "#4F46E5", borderRadius: 10, fontSize: 16, color: "white", textDecoration: "none", fontWeight: 600 }}>
            Start for free →
          </Link>
          <Link href="/login" style={{ padding: "13px 28px", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 16, color: "#374151", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, padding: "0 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
        {[
          { icon: "🤖", title: "5-Layer Bot Detection", desc: "UA patterns + header anomaly + datacenter CIDR + VPN + proxy detection" },
          { icon: "📢", title: "65+ Ad Platforms", desc: "Google, Meta, TikTok, PropellerAds, Adsterra, PopAds and 60 more" },
          { icon: "🌍", title: "Country Filtering", desc: "Allow only your target countries, block the rest automatically" },
          { icon: "🔌", title: "Any Platform", desc: "HTML, PHP, WordPress plugin, Next.js middleware, Python Flask/Django" },
          { icon: "📊", title: "Real-time Analytics", desc: "See bot types, blocked countries, and traffic trends live" },
          { icon: "🆓", title: "100% Free", desc: "Self-hosted on Vercel free tier + Supabase free tier. No limits." },
        ].map(f => (
          <div key={f.title} style={{ background: "#F9FAFB", borderRadius: 12, padding: "20px 22px", border: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: "#4F46E5", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 12 }}>Ready to protect your traffic?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 28 }}>Free account, setup in 5 minutes</p>
        <Link href="/signup" style={{ padding: "13px 32px", background: "white", borderRadius: 10, fontSize: 16, color: "#4F46E5", textDecoration: "none", fontWeight: 700 }}>
          Create free account →
        </Link>
      </div>
    </div>
  )
}
