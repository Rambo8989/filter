import Link from "next/link"

const features = [
  { icon: "🛡️", title: "Smart Bot Detection", desc: "Automatically spots and blocks bots, crawlers, and suspicious traffic in real time." },
  { icon: "🌍", title: "Country Targeting", desc: "Show your offer only to visitors from the countries you choose — block the rest." },
  { icon: "🔌", title: "Works Anywhere", desc: "Add it to any website or landing page in minutes. No complex setup required." },
  { icon: "📊", title: "Live Analytics", desc: "Track visits, blocks, and traffic trends as they happen, right from your dashboard." },
  { icon: "⚙️", title: "Set & Forget", desc: "Configure once and let it run automatically in the background, around the clock." },
  { icon: "🆓", title: "Completely Free", desc: "No hidden fees, no usage limits, and no credit card required — ever." },
]

const steps = [
  { num: "1", title: "Create a campaign", desc: "Set up your safe page and the destination you want real visitors to land on." },
  { num: "2", title: "Add one snippet", desc: "Paste a single tracking snippet into your page — that's the entire setup." },
  { num: "3", title: "Let it run", desc: "Real visitors get through automatically. Everything else gets quietly filtered out." },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "white", overflowX: "hidden" }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: "1px solid #F3F4F6", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>Traffic Filter Pro</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/login" className="tf-btn-ghost" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 14, color: "#374151", textDecoration: "none", fontWeight: 500, border: "1px solid #E5E7EB" }}>Sign in</Link>
          <Link href="/signup" className="tf-btn-primary" style={{ padding: "8px 18px", background: "#4F46E5", borderRadius: 8, fontSize: 14, color: "white", textDecoration: "none", fontWeight: 500 }}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 100%)" }}>
        <div className="tf-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", gap: 48, maxWidth: 1180, margin: "0 auto", padding: "80px 40px 60px" }}>
          {/* Left: copy */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EDE9FE", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: "#4F46E5", fontWeight: 500 }}>✨ Free forever — no credit card needed</span>
            </div>
            <h1 className="tf-hero-h1" style={{ fontSize: 52, fontWeight: 800, color: "#111", lineHeight: 1.15, marginBottom: 20 }}>
              Stop bots from{" "}
              <span style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                wasting your ad budget
              </span>
            </h1>
            <p style={{ fontSize: 18, color: "#6B7280", maxWidth: 480, marginBottom: 32, lineHeight: 1.7 }}>
              Smart traffic filtering quietly keeps bots, fake clicks, and unwanted visitors away from your campaigns — so more of your budget reaches real customers.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/signup" className="tf-btn-primary" style={{ padding: "13px 28px", background: "#4F46E5", borderRadius: 10, fontSize: 16, color: "white", textDecoration: "none", fontWeight: 600 }}>
                Start for free →
              </Link>
              <Link href="/login" className="tf-btn-ghost" style={{ padding: "13px 28px", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 16, color: "#374151", textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 28, fontSize: 13, color: "#9CA3AF" }}>
              <span>✓ Free forever</span>
              <span>✓ No credit card required</span>
              <span>✓ Set up in minutes</span>
            </div>
          </div>

          {/* Right: dashboard preview mockup */}
          <div className="hidden-mobile" style={{ position: "relative" }}>
            <div style={{ background: "white", borderRadius: 16, boxShadow: "0 20px 60px rgba(79, 70, 229, 0.15)", border: "1px solid #F3F4F6", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Traffic Overview</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#059669" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                  Live
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Visits", value: "1,284", color: "#111" },
                  { label: "Allowed", value: "968", color: "#059669" },
                  { label: "Blocked", value: "316", color: "#DC2626" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
                {[55, 70, 45, 80, 60, 90, 72].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4 }}>
                    <div style={{ background: "#4F46E5", borderRadius: 4, height: `${h}%` }} />
                    <div style={{ background: "#E0E7FF", borderRadius: 4, height: `${100 - h}%` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="tf-float-badge" style={{ position: "absolute", top: -16, right: -16, background: "white", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6", padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
              🛡️ Bot blocked
            </div>
            <div className="tf-float-badge tf-float-delay" style={{ position: "absolute", bottom: -16, left: -16, background: "white", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6", padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#059669" }}>
              ✅ Real visitor allowed
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 12 }}>Everything you need to protect your traffic</h2>
          <p style={{ fontSize: 16, color: "#6B7280", maxWidth: 520, margin: "0 auto" }}>Powerful protection, made simple — no technical know-how required.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="tf-feature-card" style={{ background: "#F9FAFB", borderRadius: 12, padding: "24px 22px", border: "1px solid #F3F4F6" }}>
              <div style={{ width: 44, height: 44, background: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#F9FAFB", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 12 }}>Up and running in minutes</h2>
            <p style={{ fontSize: 16, color: "#6B7280" }}>No developer needed — just three simple steps.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {steps.map(s => (
              <div key={s.num} style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, margin: "0 auto 16px" }}>{s.num}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ position: "relative", overflow: "hidden", maxWidth: 900, margin: "0 auto", background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", borderRadius: 24, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: -100, left: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 12 }}>Ready to protect your traffic?</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 28 }}>Create your free account and get set up in minutes.</p>
            <Link href="/signup" className="tf-btn-cta" style={{ display: "inline-block", padding: "13px 32px", background: "white", borderRadius: 10, fontSize: 16, color: "#4F46E5", textDecoration: "none", fontWeight: 700 }}>
              Create free account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #F3F4F6", padding: "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Traffic Filter Pro</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 13, color: "#9CA3AF" }}>
            <Link href="/contact" style={{ color: "#6B7280", textDecoration: "none" }}>Contact</Link>
            <span>© 2026 Traffic Filter Pro</span>
          </div>
        </div>
      </footer>

      <style>{`
        .tf-btn-primary { transition: background 0.15s, transform 0.1s; }
        .tf-btn-primary:hover { background: #4338CA !important; transform: translateY(-1px); }
        .tf-btn-ghost { transition: border-color 0.15s, background 0.15s; }
        .tf-btn-ghost:hover { border-color: #C7D2FE !important; background: #F5F3FF; }
        .tf-btn-cta { transition: transform 0.15s, box-shadow 0.15s; }
        .tf-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .tf-feature-card { transition: transform 0.2s, box-shadow 0.2s; }
        .tf-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(79, 70, 229, 0.08); }
        .tf-float-badge { animation: tf-float 3s ease-in-out infinite; }
        .tf-float-delay { animation-delay: 1.5s; }
        @keyframes tf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @media (max-width: 860px) {
          .tf-hero-grid { grid-template-columns: 1fr !important; }
          .tf-hero-h1 { font-size: 38px !important; }
        }
      `}</style>
    </div>
  )
}
