"use client"

import { useState, useEffect, useRef } from "react"

interface Website {
  id: number
  name: string
  domain: string
  landing_page_url: string
  safe_page_url: string
  campaign_code: string
  is_active: boolean
  cloaking_enabled: boolean
  allowed_countries: string[]
  blocked_ad_platforms: string[]
  max_visit_limit?: number
  visit_limit_time_hours?: number
  created_at: string
}

const COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CD", name: "Congo (DRC)" },
  { code: "CG", name: "Congo (Republic)" }, { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" }, { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" }, { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" }, { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" }, { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" }, { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" }, { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" }, { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" }, { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" }, { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" },
]

const AD_PLATFORMS: { id: string; name: string }[] = [
  { id: "google", name: "Google Ads" }, { id: "facebook", name: "Facebook / Meta Ads" },
  { id: "instagram", name: "Instagram Ads" }, { id: "tiktok", name: "TikTok Ads" },
  { id: "snapchat", name: "Snapchat Ads" }, { id: "twitter", name: "Twitter / X Ads" },
  { id: "pinterest", name: "Pinterest Ads" }, { id: "linkedin", name: "LinkedIn Ads" },
  { id: "youtube", name: "YouTube Ads" }, { id: "bing", name: "Microsoft / Bing Ads" },
  { id: "yahoo", name: "Yahoo Ads" }, { id: "amazon-dsp", name: "Amazon DSP" },
  { id: "apple-search", name: "Apple Search Ads" }, { id: "quora", name: "Quora Ads" },
  { id: "reddit", name: "Reddit Ads" }, { id: "taboola", name: "Taboola" },
  { id: "outbrain", name: "Outbrain" }, { id: "mgid", name: "MGID" },
  { id: "revcontent", name: "Revcontent" }, { id: "content-ad", name: "Content.ad" },
  { id: "propellerads", name: "PropellerAds" }, { id: "adsterra", name: "Adsterra" },
  { id: "popads", name: "PopAds.net" }, { id: "popcash", name: "PopCash" },
  { id: "trafficjunky", name: "TrafficJunky" }, { id: "exoclick", name: "ExoClick" },
  { id: "hilltopads", name: "HilltopAds" }, { id: "clickadu", name: "Clickadu" },
  { id: "admaven", name: "AdMaven" }, { id: "traffic-stars", name: "TrafficStars" },
  { id: "adcash", name: "AdCash" }, { id: "zeropark", name: "Zeropark" },
  { id: "mondiad", name: "Mondiad" }, { id: "bidvertiser", name: "BidVertiser" },
  { id: "clickbooth", name: "Clickbooth" }, { id: "adfly", name: "AdFly" },
  { id: "richpush", name: "RichPush" }, { id: "pushhouse", name: "Push.House" },
  { id: "evadav", name: "Evadav" }, { id: "pushground", name: "Pushground" },
  { id: "notix", name: "Notix" }, { id: "kadam", name: "Kadam" },
  { id: "galaksion", name: "Galaksion" }, { id: "voluum", name: "Voluum DSP" },
  { id: "thetradedesk", name: "The Trade Desk" }, { id: "dv360", name: "Google DV360" },
  { id: "appnexus", name: "AppNexus / Xandr" }, { id: "medianet", name: "Media.net" },
  { id: "adroll", name: "AdRoll" }, { id: "criteo", name: "Criteo" },
  { id: "rtbhouse", name: "RTB House" }, { id: "inmobi", name: "InMobi" },
  { id: "applovin", name: "AppLovin" }, { id: "ironsource", name: "ironSource" },
  { id: "unity-ads", name: "Unity Ads" }, { id: "admob", name: "Google AdMob" },
  { id: "maxbounty", name: "MaxBounty" }, { id: "clickbank", name: "ClickBank" },
  { id: "cj-affiliate", name: "CJ Affiliate" }, { id: "admitad", name: "Admitad" },
  { id: "dr-cash", name: "Dr.Cash" }, { id: "adcombo", name: "AdCombo" },
  { id: "mobidea", name: "Mobidea" }, { id: "clickdealer", name: "ClickDealer" },
]

const TRAFFIC_SOURCES = [
  "Google Ads", "Facebook / Meta Ads", "TikTok Ads", "Microsoft / Bing Ads",
  "PropellerAds", "Adsterra", "PopAds.net", "Zeropark", "Push.House", "Evadav",
  "Taboola", "Outbrain", "MGID", "ExoClick", "TrafficJunky", "HilltopAds",
  "Clickadu", "AdMaven", "TrafficStars", "RichPush", "Pushground",
  "MaxBounty", "ClickBank", "AdCombo", "Mobidea", "Dr.Cash",
  "Voluum DSP", "The Trade Desk", "AppLovin", "InMobi", "Criteo",
  "Other / Direct",
]

const AVAILABLE_FILTERS = [
  { id: "ff_7search", name: "FF 7Search", desc: "Block 7Search.com traffic sources" },
  { id: "ff_ad_platform", name: "FF Ad Platform Bots", desc: "Block IAS, DoubleVerify, Moat, HUMAN Security bots" },
  { id: "ff_bot", name: "FF Bot Detection", desc: "Block known bots, crawlers and scrapers by user-agent" },
  { id: "ff_core", name: "FF Core", desc: "Core fraud detection — IP reputation and risk scoring" },
  { id: "ff_datacenter", name: "FF Data Center", desc: "Block AWS, GCP, Azure, DigitalOcean, Hetzner IPs" },
  { id: "ff_gov", name: "FF Government", desc: "Block government and military network IP ranges" },
  { id: "ff_headless", name: "FF Headless Browser", desc: "Block Puppeteer, Selenium, PhantomJS, headless Chrome" },
  { id: "ff_timezone", name: "FF Time Zone", desc: "Block suspicious timezone/country mismatches" },
  { id: "ff_tor", name: "FF Tor Exit", desc: "Block Tor exit node IP addresses" },
  { id: "ff_vpn", name: "FF VPN/Proxy", desc: "Block VPN, proxy, and anonymizer connections" },
]

const CONDITION_TYPES = [
  { id: "country", label: "Country", icon: "🌍" },
  { id: "device_type", label: "Device Type", icon: "📱" },
  { id: "browser", label: "Browser", icon: "🌐" },
  { id: "os", label: "Operating System", icon: "💻" },
  { id: "connection_type", label: "Connection Type", icon: "📡" },
  { id: "referrer", label: "Referrer", icon: "🔗" },
  { id: "time_of_day", label: "Time of Day", icon: "🕐" },
  { id: "ip", label: "IP Address", icon: "🔒" },
]

const TABS = [
  { id: "info", label: "Campaign info" },
  { id: "money", label: "Money page" },
  { id: "safe", label: "Safe page" },
  { id: "conditions", label: "Conditions" },
  { id: "filters", label: "Additional filters" },
  { id: "automate", label: "Automate" },
]

interface LandingDestination { url: string; weight: number; enabled: boolean; description: string }
interface Condition { uid: string; type: string; mode: "allow" | "block"; values: string[]; textValue: string; fromHour: number; toHour: number }

interface FormState {
  name: string
  trafficSource: string
  status: "active" | "paused" | "block_all" | "under_review"
  tags: string[]
  notes: string
  landingPages: LandingDestination[]
  appendQueryToLanding: boolean
  safePageUrl: string
  appendQueryToSafe: boolean
  conditions: Condition[]
  enabledFilters: string[]
  frequencyCapEnabled: boolean
  maxVisitLimit: number
  visitLimitTimeHours: number
  autoBlockEnabled: boolean
  autoBlockMinutes: number
  activateAfterEnabled: boolean
  activateAfterVisitors: number
  domain: string
}

const defaultForm: FormState = {
  name: "", trafficSource: "", status: "active", tags: [], notes: "",
  landingPages: [{ url: "", weight: 10, enabled: true, description: "" }],
  appendQueryToLanding: false,
  safePageUrl: "", appendQueryToSafe: false,
  conditions: [],
  enabledFilters: ["ff_bot", "ff_datacenter", "ff_vpn"],
  frequencyCapEnabled: true, maxVisitLimit: 10, visitLimitTimeHours: 24,
  autoBlockEnabled: false, autoBlockMinutes: 60,
  activateAfterEnabled: false, activateAfterVisitors: 100,
  domain: "",
}

// ── Installation Steps component ────────────────────────────
function InstallSteps({ steps, note }: { steps: { n: number; title: string; body: string }[]; note: string }) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4F46E5", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>
      {note && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#EDE9FE", borderRadius: 7, fontSize: 12, color: "#4F46E5", lineHeight: 1.6 }}>
          <strong>Note:</strong> {note}
        </div>
      )}
    </div>
  )
}

// ── Toggle switch component ──────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ width: 38, height: 22, borderRadius: 11, background: checked ? "#4F46E5" : "#D1D5DB", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  )
}

export default function CampaignsPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [trackingModal, setTrackingModal] = useState<{ websiteId: number; name: string } | null>(null)
  const [trackingCode, setTrackingCode] = useState("")
  const [trackingAppUrl, setTrackingAppUrl] = useState("")
  const [activeVariant, setActiveVariant] = useState("html")
  const [loadingCode, setLoadingCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [showConditionMenu, setShowConditionMenu] = useState(false)
  const condMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (condMenuRef.current && !condMenuRef.current.contains(e.target as Node)) setShowConditionMenu(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const fetchWebsites = async () => {
    try {
      const res = await fetch("/api/websites", { credentials: "include" })
      const data = await res.json()
      if (data.success) setWebsites(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWebsites() }, [])

  const setF = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }))

  const handleSubmit = async () => {
    const landingUrl = form.landingPages.find(p => p.url.trim())?.url.trim() || ""
    if (!form.name || !form.domain || !landingUrl || !form.safePageUrl) {
      setError("Please fill in: Campaign Name, Domain (in info tab), Landing Page URL, and Safe Page URL")
      return
    }
    setSaving(true); setError("")
    try {
      // Extract country conditions
      const countryCondition = form.conditions.find(c => c.type === "country")
      const allowedCountries = countryCondition?.mode === "allow" ? countryCondition.values : []

      // Map enabled filters to blocked ad platforms list
      const blockedAdPlatforms = form.enabledFilters.includes("ff_ad_platform")
        ? AD_PLATFORMS.map(p => p.id)
        : []

      const payload: Record<string, unknown> = {
        name: form.name,
        domain: form.domain,
        landingPageUrl: landingUrl,
        safePageUrl: form.safePageUrl,
        allowedCountries,
        blockedAdPlatforms,
        maxVisitLimit: form.frequencyCapEnabled ? form.maxVisitLimit : 999,
        visitLimitTimeHours: form.visitLimitTimeHours,
        cloakingEnabled: form.status !== "block_all",
        isActive: form.status === "active" || form.status === "under_review",
      }
      if (editingId) payload.id = editingId

      const res = await fetch("/api/websites", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        const wasEditing = editingId
        setShowForm(false); setForm(defaultForm); setActiveTab("info"); setEditingId(null)
        fetchWebsites()
        if (!wasEditing) openTrackingModal(data.data.id, data.data.name)
      } else { setError(data.error || `Failed to ${editingId ? "update" : "create"} campaign`) }
    } catch { setError("Network error. Please try again.") }
    finally { setSaving(false) }
  }

  const openTrackingModal = async (websiteId: number, name: string, variant = "html") => {
    setTrackingModal({ websiteId, name }); setActiveVariant(variant)
    setLoadingCode(true); setTrackingCode("")
    try {
      const res = await fetch(`/api/get-tracking-code?websiteId=${websiteId}&variant=${variant}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) { setTrackingCode(data.code); setTrackingAppUrl(data.appUrl || "") }
    } catch { setTrackingCode("// Error loading code") }
    finally { setLoadingCode(false) }
  }

  const switchVariant = (websiteId: number, name: string, variant: string) => openTrackingModal(websiteId, name, variant)

  const copyCode = () => {
    navigator.clipboard.writeText(trackingCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this campaign?")) return
    await fetch(`/api/websites?id=${id}`, { method: "DELETE", credentials: "include" })
    fetchWebsites()
  }

  const toggleActive = async (w: Website) => {
    await fetch("/api/websites", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id: w.id, isActive: !w.is_active }) })
    fetchWebsites()
  }

  const handleEdit = (w: Website) => {
    const allowedCountries = Array.isArray(w.allowed_countries) ? w.allowed_countries : []
    const blockedPlatforms = Array.isArray(w.blocked_ad_platforms) ? w.blocked_ad_platforms : []
    const maxVisit = w.max_visit_limit ?? 10

    setForm({
      ...defaultForm,
      name: w.name,
      domain: w.domain,
      safePageUrl: w.safe_page_url,
      landingPages: [{ url: w.landing_page_url, weight: 10, enabled: true, description: "" }],
      status: !w.cloaking_enabled ? "block_all" : !w.is_active ? "paused" : "active",
      conditions: allowedCountries.length > 0
        ? [{ uid: "country", type: "country", mode: "allow", values: allowedCountries, textValue: "", fromHour: 9, toHour: 18 }]
        : [],
      enabledFilters: blockedPlatforms.length > 0
        ? Array.from(new Set([...defaultForm.enabledFilters, "ff_ad_platform"]))
        : defaultForm.enabledFilters,
      frequencyCapEnabled: maxVisit < 999,
      maxVisitLimit: maxVisit < 999 ? maxVisit : defaultForm.maxVisitLimit,
      visitLimitTimeHours: w.visit_limit_time_hours ?? defaultForm.visitLimitTimeHours,
    })
    setEditingId(w.id)
    setShowForm(true)
    setActiveTab("info")
    setError("")
  }

  const addCondition = (type: string) => {
    const uid = Date.now().toString()
    const newCond: Condition = { uid, type, mode: "allow", values: [], textValue: "", fromHour: 9, toHour: 18 }
    setF({ conditions: [...form.conditions, newCond] })
    setShowConditionMenu(false)
  }

  const updateCondition = (uid: string, patch: Partial<Condition>) => {
    setF({ conditions: form.conditions.map(c => c.uid === uid ? { ...c, ...patch } : c) })
  }

  const removeCondition = (uid: string) => {
    setF({ conditions: form.conditions.filter(c => c.uid !== uid) })
  }

  const toggleFilter = (id: string) => {
    setF({ enabledFilters: form.enabledFilters.includes(id) ? form.enabledFilters.filter(x => x !== id) : [...form.enabledFilters, id] })
  }

  const tabIndex = TABS.findIndex(t => t.id === activeTab)

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Campaigns</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: "4px 0 0" }}>Manage your websites and traffic filter campaigns</p>
        </div>
        {!showForm && (
          <button onClick={() => { setForm(defaultForm); setEditingId(null); setShowForm(true); setActiveTab("info"); setError("") }}
            style={{ background: "#4F46E5", color: "white", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Campaign
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, marginBottom: 28, overflow: "visible", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          {editingId && (
            <div style={{ padding: "12px 32px", borderBottom: "1px solid #F3F4F6", fontSize: 13, fontWeight: 600, color: "#4F46E5", background: "#F5F3FF", borderRadius: "12px 12px 0 0" }}>
              Editing Campaign: {form.name || "—"}
            </div>
          )}

          {/* Tab Bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", overflowX: "auto" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "13px 20px", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, cursor: "pointer",
                border: "none", background: "none", whiteSpace: "nowrap",
                color: activeTab === tab.id ? "#4F46E5" : "#6B7280",
                borderBottom: activeTab === tab.id ? "2px solid #4F46E5" : "2px solid transparent",
                marginBottom: "-1px", transition: "all 0.15s",
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "28px 32px" }}>

            {/* ─── TAB 1: Campaign Info ─── */}
            {activeTab === "info" && (
              <div>
                <Field label="Private Title" hint="A private name to identify this campaign — not shown to visitors" required>
                  <input style={inp} placeholder="e.g. Google Ads — Summer Promo" value={form.name} onChange={e => setF({ name: e.target.value })} />
                </Field>

                <Field label="Domain" hint="The domain where your tracking script will be installed" required>
                  <input style={inp} placeholder="example.com" value={form.domain} onChange={e => setF({ domain: e.target.value })} />
                </Field>

                <Field label="Traffic Source" hint="Select the ad network or traffic source for this campaign">
                  <select style={inp} value={form.trafficSource} onChange={e => setF({ trafficSource: e.target.value })}>
                    <option value="">Select a traffic source</option>
                    {TRAFFIC_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="Status" hint="Visitors always see the safe page when status is Block All or Paused">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    {([
                      { value: "active", icon: "▶", label: "Active", desc: "Cloaking ON — bots go to safe page, real visitors to money page" },
                      { value: "under_review", icon: "⚙", label: "Under Review", desc: "Campaign is being reviewed — same behavior as Active" },
                      { value: "paused", icon: "⏸", label: "Paused", desc: "All visitors see the safe page" },
                      { value: "block_all", icon: "⛔", label: "Block All", desc: "All traffic is blocked — no one reaches the money page" },
                    ] as const).map(opt => (
                      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: `1px solid ${form.status === opt.value ? "#4F46E5" : "#E5E7EB"}`, borderRadius: 8, cursor: "pointer", background: form.status === opt.value ? "#F5F3FF" : "white" }}>
                        <input type="radio" name="status" value={opt.value} checked={form.status === opt.value} onChange={() => setF({ status: opt.value })} style={{ accentColor: "#4F46E5" }} />
                        <span style={{ fontSize: 14 }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{opt.label}</div>
                          <div style={{ fontSize: 12, color: "#6B7280" }}>{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Tags" hint="Press Enter to add a tag — used to organise and search campaigns">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 7, cursor: "text", minHeight: 40 }}>
                    {form.tags.map(t => (
                      <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, background: "#EDE9FE", color: "#4F46E5", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>
                        {t}
                        <button type="button" onClick={() => setF({ tags: form.tags.filter(x => x !== t) })} style={{ background: "none", border: "none", cursor: "pointer", color: "#4F46E5", padding: 0, fontSize: 14 }}>×</button>
                      </span>
                    ))}
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); setF({ tags: [...form.tags, tagInput.trim()] }); setTagInput("") } }}
                      placeholder={form.tags.length === 0 ? "Enter a tag and press Enter" : ""} style={{ border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 120 }} />
                  </div>
                </Field>

                <Field label="Notes" hint="Add notes or memo for yourself about this campaign">
                  <textarea style={{ ...inp, height: 72, resize: "vertical", fontFamily: "inherit" }} placeholder="Optional notes..." value={form.notes} onChange={e => setF({ notes: e.target.value })} />
                </Field>
              </div>
            )}

            {/* ─── TAB 2: Money Page ─── */}
            {activeTab === "money" && (
              <div>
                <p style={{ fontSize: 14, color: "#374151", margin: "0 0 4px" }}>Where do we send real/legit visitors? <span style={{ fontSize: 12, color: "#9CA3AF" }}>(Money Page — your actual offer)</span></p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 20px", background: "#F5F3FF", padding: "8px 12px", borderRadius: 6 }}>
                  Real visitors are silently redirected here. This URL is <strong>never shared publicly</strong> — bots and reviewers never reach it.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <Toggle checked={form.appendQueryToLanding} onChange={v => setF({ appendQueryToLanding: v })} />
                  <span style={{ fontSize: 13, color: "#374151" }}>Append URL Query Parameters</span>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>Pass UTM and tracking params to the landing page URL</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Money Pages</h3>
                  <button type="button" onClick={() => setF({ landingPages: [...form.landingPages, { url: "", weight: 10, enabled: true, description: "" }] })}
                    style={{ padding: "6px 14px", background: "#4F46E5", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    + Destination
                  </button>
                </div>

                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 8px" }}>
                  Use <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 3 }}>[[country]]</code>, <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 3 }}>[[city]]</code>, <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 3 }}>[[device_type]]</code>, <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 3 }}>[[timestamp]]</code> placeholders in URLs
                </p>

                <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 80px 80px 40px", gap: 0, background: "#F9FAFB", padding: "8px 14px", borderBottom: "1px solid #E5E7EB" }}>
                    {["Destination URL / Filepath", "Description", "Weight", "Enabled", ""].map(h => (
                      <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</span>
                    ))}
                  </div>
                  {form.landingPages.map((p, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 180px 80px 80px 40px", gap: 0, padding: "10px 14px", borderBottom: i < form.landingPages.length - 1 ? "1px solid #F3F4F6" : "none", alignItems: "center" }}>
                      <input style={{ ...inp, border: "none", borderBottom: "1px solid #E5E7EB", borderRadius: 0, padding: "4px 6px", marginRight: 8 }}
                        placeholder="https://your-offer.com/lp" value={p.url}
                        onChange={e => setF({ landingPages: form.landingPages.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })} />
                      <input style={{ ...inp, border: "none", borderBottom: "1px solid #E5E7EB", borderRadius: 0, padding: "4px 6px", fontSize: 12 }}
                        placeholder="Description" value={p.description}
                        onChange={e => setF({ landingPages: form.landingPages.map((x, j) => j === i ? { ...x, description: e.target.value } : x) })} />
                      <input style={{ ...inp, width: 60, border: "none", borderBottom: "1px solid #E5E7EB", borderRadius: 0, padding: "4px 6px", textAlign: "center" }}
                        type="number" min={1} value={p.weight}
                        onChange={e => setF({ landingPages: form.landingPages.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x) })} />
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Toggle checked={p.enabled} onChange={v => setF({ landingPages: form.landingPages.map((x, j) => j === i ? { ...x, enabled: v } : x) })} />
                      </div>
                      <button type="button" onClick={() => setF({ landingPages: form.landingPages.filter((_, j) => j !== i) })}
                        style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Dynamic Variables</h3>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>Define variables to pass via <code style={{ background: "#F3F4F6", padding: "1px 4px", borderRadius: 3 }}>[[variable_name]]</code> placeholder in your money page URL</p>
                    </div>
                  </div>
                  <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#6B7280" }}>
                    Supported auto-variables: <strong>[[country]]</strong>, <strong>[[city]]</strong>, <strong>[[region]]</strong>, <strong>[[device_type]]</strong>, <strong>[[browser]]</strong>, <strong>[[os]]</strong>, <strong>[[timestamp]]</strong>, <strong>[[campaign_code]]</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: Safe Page ─── */}
            {activeTab === "safe" && (
              <div>
                <p style={{ fontSize: 14, color: "#374151", margin: "0 0 20px" }}>Where do we send human reviewers, bots, crawlers and spy tools?</p>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <Toggle checked={form.appendQueryToSafe} onChange={v => setF({ appendQueryToSafe: v })} />
                  <span style={{ fontSize: 13, color: "#374151" }}>Append URL Query Parameters</span>
                </div>

                <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr", gap: 0, background: "#F9FAFB", padding: "8px 14px", borderBottom: "1px solid #E5E7EB" }}>
                    {["URL", "Filepath", "URL / Filepath"].map(h => (
                      <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</span>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr", padding: "12px 14px", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <input type="checkbox" checked style={{ accentColor: "#4F46E5", width: 16, height: 16 }} readOnly />
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <input type="checkbox" style={{ width: 16, height: 16 }} />
                    </div>
                    <input style={{ ...inp, borderColor: "#A5B4FC" }} placeholder="https://example.com/safe-page"
                      value={form.safePageUrl} onChange={e => setF({ safePageUrl: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: 20, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0369A1", marginBottom: 8 }}>Traffic Flow</div>
                  <div style={{ fontSize: 12, color: "#0369A1", lineHeight: 2 }}>
                    <div>🔗 <strong>Ad click</strong> → visitor lands on <strong>Safe Page</strong> (this URL, with tracking code)</div>
                    <div>✅ <strong>Real visitor</strong> (residential IP, real browser) → silently redirected to your <strong>Money Page</strong></div>
                    <div>🚫 <strong>Bot / VPN / Datacenter / Human Reviewer</strong> → stays on Safe Page, never reaches your offer</div>
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #BAE6FD", fontSize: 12, color: "#0369A1" }}>
                    <strong>Tip:</strong> Use a clean, neutral-looking page — a blog article, news page, or info site. It should look completely unrelated to your actual offer so reviewers have nothing to flag.
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 4: Conditions ─── */}
            {activeTab === "conditions" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Select additional campaign-specific conditions or create new ones</p>
                  <div style={{ position: "relative" }} ref={condMenuRef}>
                    <button type="button" onClick={() => setShowConditionMenu(o => !o)}
                      style={{ padding: "8px 16px", background: "#4F46E5", color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      + Add condition <span style={{ fontSize: 10 }}>▼</span>
                    </button>
                    {showConditionMenu && (
                      <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 220 }}>
                        {CONDITION_TYPES.map(ct => (
                          <button key={ct.id} type="button" onClick={() => addCondition(ct.id)}
                            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#374151", textAlign: "left" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#F5F3FF")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                            <span style={{ fontSize: 16 }}>{ct.icon}</span> {ct.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {form.conditions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed #E5E7EB", borderRadius: 8, color: "#9CA3AF", fontSize: 13 }}>
                    No conditions added yet. Click "+ Add condition" to filter by country, device, browser, referrer, and more.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {form.conditions.map(cond => (
                      <ConditionCard key={cond.uid} cond={cond} onUpdate={updateCondition} onRemove={removeCondition} />
                    ))}
                  </div>
                )}

                {form.conditions.length > 0 && (
                  <button type="button" onClick={() => setF({ conditions: [] })}
                    style={{ marginTop: 12, background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    🗑 Remove all conditions
                  </button>
                )}
              </div>
            )}

            {/* ─── TAB 5: Additional Filters ─── */}
            {activeTab === "filters" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Select additional filters or create new ones. Enabled filters run on every visit.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                  {/* Available */}
                  <div style={{ borderRight: "1px solid #E5E7EB" }}>
                    <div style={{ padding: "10px 16px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Available Filters</span>
                    </div>
                    <div style={{ padding: "8px 12px" }}>
                      {AVAILABLE_FILTERS.filter(f => !form.enabledFilters.includes(f.id)).map(f => (
                        <div key={f.id} onClick={() => toggleFilter(f.id)}
                          style={{ padding: "10px 10px", cursor: "pointer", borderRadius: 6, marginBottom: 2 }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F5F3FF"}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{f.desc}</div>
                        </div>
                      ))}
                      {AVAILABLE_FILTERS.filter(f => !form.enabledFilters.includes(f.id)).length === 0 && (
                        <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>All filters enabled</p>
                      )}
                    </div>
                  </div>

                  {/* Enabled */}
                  <div>
                    <div style={{ padding: "10px 16px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Enabled Filters</span>
                    </div>
                    <div style={{ padding: "8px 12px" }}>
                      {AVAILABLE_FILTERS.filter(f => form.enabledFilters.includes(f.id)).map(f => (
                        <div key={f.id} onClick={() => toggleFilter(f.id)}
                          style={{ padding: "10px 10px", cursor: "pointer", borderRadius: 6, marginBottom: 2, background: "#F0FDF4" }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#FEF2F2"}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#F0FDF4"}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#065F46", display: "flex", justifyContent: "space-between" }}>
                            {f.name} <span style={{ color: "#9CA3AF" }}>×</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{f.desc}</div>
                        </div>
                      ))}
                      {form.enabledFilters.length === 0 && (
                        <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>No filters enabled</p>
                      )}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 10 }}>
                  Click a filter to move it between Available and Enabled. Green = active on this campaign.
                </p>
              </div>
            )}

            {/* ─── TAB 6: Automate ─── */}
            {activeTab === "automate" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Frequency Cap */}
                <div style={{ padding: "20px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Toggle checked={form.frequencyCapEnabled} onChange={v => setF({ frequencyCapEnabled: v })} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>Frequency Cap</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: form.frequencyCapEnabled ? 14 : 0 }}>
                        Visitor visiting your page more than a certain number of times within the selected duration will be cloaked. Select a criteria as the basis of uniqueness.
                      </div>
                      {form.frequencyCapEnabled && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                          <span style={{ fontSize: 13, color: "#374151" }}>Block after</span>
                          <input type="number" min={1} value={form.maxVisitLimit} onChange={e => setF({ maxVisitLimit: Number(e.target.value) })}
                            style={{ ...inp, width: 70, textAlign: "center", padding: "6px 10px" }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>visits within</span>
                          <input type="number" min={1} value={form.visitLimitTimeHours} onChange={e => setF({ visitLimitTimeHours: Number(e.target.value) })}
                            style={{ ...inp, width: 70, textAlign: "center", padding: "6px 10px" }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>hours (per IP)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Block All after inactivity */}
                <div style={{ padding: "20px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Toggle checked={form.autoBlockEnabled} onChange={v => setF({ autoBlockEnabled: v })} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>Block All after Inactivity</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: form.autoBlockEnabled ? 14 : 0 }}>
                        Automatically switch campaign to Block All status after a period of no real visitors.
                      </div>
                      {form.autoBlockEnabled && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                          <span style={{ fontSize: 13, color: "#374151" }}>Block all after</span>
                          <input type="number" min={1} value={form.autoBlockMinutes} onChange={e => setF({ autoBlockMinutes: Number(e.target.value) })}
                            style={{ ...inp, width: 80, textAlign: "center", padding: "6px 10px" }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>minutes of no real visitors</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activate after X visitors */}
                <div style={{ padding: "20px 0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Toggle checked={form.activateAfterEnabled} onChange={v => setF({ activateAfterEnabled: v })} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>Activate after X Unique Real Visitors</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: form.activateAfterEnabled ? 14 : 0 }}>
                        Campaign starts in Under Review mode and automatically switches to Active after receiving the specified number of unique real (non-bot) visitors.
                      </div>
                      {form.activateAfterEnabled && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                          <span style={{ fontSize: 13, color: "#374151" }}>Activate after</span>
                          <input type="number" min={1} value={form.activateAfterVisitors} onChange={e => setF({ activateAfterVisitors: Number(e.target.value) })}
                            style={{ ...inp, width: 80, textAlign: "center", padding: "6px 10px" }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>unique real visitors</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error bar */}
          {error && (
            <div style={{ margin: "0 32px 16px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 7, color: "#B91C1C", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Footer Navigation */}
          <div style={{ padding: "14px 32px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAFA", borderRadius: "0 0 12px 12px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {tabIndex > 0 && (
                <button type="button" onClick={() => setActiveTab(TABS[tabIndex - 1].id)} style={footBtn}>
                  ← Previous Tab
                </button>
              )}
              <button type="button" onClick={() => { setShowForm(false); setForm(defaultForm); setActiveTab("info"); setError(""); setEditingId(null) }} style={{ ...footBtn, color: "#9CA3AF", borderColor: "#E5E7EB" }}>
                Cancel
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={handleSubmit} disabled={saving}
                style={{ padding: "9px 22px", background: "#4F46E5", color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save Changes" : "Create Campaign")}
              </button>
              {tabIndex < TABS.length - 1 && (
                <button type="button" onClick={() => setActiveTab(TABS[tabIndex + 1].id)}
                  style={{ padding: "9px 18px", background: "white", color: "#4F46E5", border: "1px solid #4F46E5", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Next Tab →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF", fontSize: 14 }}>Loading campaigns...</div>
      ) : websites.length === 0 && !showForm ? (
        <div style={{ background: "white", border: "1px dashed #D1D5DB", borderRadius: 12, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, background: "#F5F3FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px" }}>🚀</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", margin: "0 0 6px" }}>No campaigns yet</h3>
          <p style={{ color: "#9CA3AF", fontSize: 13, margin: "0 0 18px" }}>Create your first campaign to start filtering bot traffic</p>
          <button onClick={() => { setForm(defaultForm); setEditingId(null); setShowForm(true); setActiveTab("info") }}
            style={{ background: "#4F46E5", color: "white", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Create First Campaign
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {websites.map(w => (
            <CampaignCard key={w.id} w={w} onGetCode={openTrackingModal} onEdit={handleEdit} onToggle={toggleActive} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Tracking Code Modal */}
      {trackingModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: 860, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

            {/* Modal Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Install Tracking Code</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6B7280" }}>
                  Campaign: <strong>{trackingModal.name}</strong> — choose your platform and follow the steps below
                </p>
              </div>
              <button onClick={() => setTrackingModal(null)} style={{ background: "#F3F4F6", border: "none", width: 30, height: 30, borderRadius: 6, fontSize: 18, cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {/* Platform Tabs */}
            <div style={{ padding: "10px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
              {[
                { id: "html", label: "HTML" },
                { id: "js", label: "JavaScript" },
                { id: "php_inline", label: "PHP Inline" },
                { id: "php_file", label: "PHP File" },
                { id: "wordpress", label: "WordPress" },
                { id: "nextjs", label: "Next.js" },
                { id: "python", label: "Python" },
              ].map(v => (
                <button key={v.id} onClick={() => switchVariant(trackingModal.websiteId, trackingModal.name, v.id)}
                  style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                    background: activeVariant === v.id ? "#1a1a2e" : "white",
                    color: activeVariant === v.id ? "white" : "#6B7280",
                    borderColor: activeVariant === v.id ? "#1a1a2e" : "#E5E7EB" }}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Localhost warning */}
              {trackingAppUrl && trackingAppUrl.includes("localhost") && (
                <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#92400E" }}>
                  <strong>Warning:</strong> Tracking code mein app URL <code style={{ background: "#FDE68A", padding: "1px 5px", borderRadius: 3 }}>{trackingAppUrl}</code> hai jo sirf local machine par kaam karta hai.
                  <br />Deployed URL ke liye <code style={{ background: "#FDE68A", padding: "1px 5px", borderRadius: 3 }}>APP_URL</code> env variable set karo (jaise: <code style={{ background: "#FDE68A", padding: "1px 5px", borderRadius: 3 }}>APP_URL=https://your-app.vercel.app</code>) — phir tracking code dobara copy karo.
                </div>
              )}

              {/* Code Box */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {activeVariant === "html" && "HTML — Paste in <head>"}
                    {activeVariant === "js" && "JavaScript — Save as tfp-filter.js"}
                    {activeVariant === "php_inline" && "PHP Inline — Paste at top of page file"}
                    {activeVariant === "php_file" && "PHP File — Save as tfp-filter.php"}
                    {activeVariant === "wordpress" && "WordPress Plugin — Upload as .zip"}
                    {activeVariant === "nextjs" && "Next.js — Replace middleware.ts"}
                    {activeVariant === "python" && "Python — Flask / Django middleware"}
                  </span>
                  <button onClick={copyCode} style={{ padding: "5px 14px", background: copied ? "#10B981" : "#4F46E5", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                    {copied ? "✓ Copied!" : "Copy Code"}
                  </button>
                </div>
                {loadingCode ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", background: "#0F172A", borderRadius: 8 }}>Loading code...</div>
                ) : (
                  <pre style={{ margin: 0, background: "#0F172A", color: "#CBD5E1", padding: 18, borderRadius: 8, fontSize: 12, lineHeight: 1.7, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 260 }}>
                    {trackingCode}
                  </pre>
                )}
              </div>

              {/* Installation Instructions */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, background: "#4F46E5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📋</div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Installation Instructions</span>
                </div>

                {activeVariant === "html" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the code above", body: 'Click "Copy Code" to copy the tracking script to your clipboard.' },
                    { n: 2, title: "Open your safe page HTML file", body: "Open the safe page file (e.g. index.html) — this is the page your ad link points to. Everyone lands here first." },
                    { n: 3, title: "Paste inside the <head> tag", body: 'Find <head>...</head> and paste the script just before </head>. It must be the first script that runs on the page.' },
                    { n: 4, title: "Save and upload", body: "Save and deploy to your server. From now on: real visitors are silently redirected to your money page, bots stay on this safe page." },
                    { n: 5, title: "Point your ad link to this safe page", body: "Make sure your ad campaign (Google, Facebook, PopAds etc.) links to THIS page — the safe page with the tracking code. Never link ads directly to your money page." },
                  ]} note="Works on any plain HTML site, Webflow, Squarespace, Wix, and any page builder that allows custom HTML in <head>." />
                )}

                {activeVariant === "js" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the code and save as tfp-filter.js", body: 'Save the code as "tfp-filter.js" in the root directory of your safe page site.' },
                    { n: 2, title: "Upload to your server", body: "Upload tfp-filter.js via FTP, cPanel File Manager, or your deployment pipeline." },
                    { n: 3, title: "Add <script> tag to your safe page", body: 'Add inside your safe page <head> tag (first script):\n<script src="/tfp-filter.js"></script>' },
                    { n: 4, title: "Place it before all other scripts", body: "The filter must be the very first <script> tag so it executes before any tracking pixels or analytics fire." },
                    { n: 5, title: "Link your ads to this safe page", body: "Your ad click URL should point to this safe page. Real visitors will be instantly forwarded to your money page; bots will stay here." },
                  ]} note="Use this method for cleaner file management — the filter logic stays separate from your safe page HTML." />
                )}

                {activeVariant === "php_inline" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the PHP code above", body: "Copy all the code — it starts with <?php and contains the full filtering logic." },
                    { n: 2, title: "Open your safe page PHP file", body: "Open the safe page file (e.g. index.php) — the page your ad links point to." },
                    { n: 3, title: "Paste at the very top — line 1, no exceptions", body: "The code MUST be the absolute first thing in the file. No blank lines, no HTML, no BOM before <?php. Any output before this code will break the redirect headers." },
                    { n: 4, title: "Save and upload", body: "Upload to your server via FTP or file manager." },
                    { n: 5, title: "Test the flow", body: "Visit the safe page from a real mobile device on cellular data. You should be redirected to your money page. Visit from a VPN — you should stay on the safe page." },
                  ]} note="Best for single-file PHP safe pages. The code checks the visitor and either lets them through (money page redirect) or shows the safe page." />
                )}

                {activeVariant === "php_file" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the code and save as tfp-filter.php", body: "Save as a separate file named tfp-filter.php in your website root or /includes/ folder." },
                    { n: 2, title: "Upload tfp-filter.php to your server", body: "Upload via FTP or file manager." },
                    { n: 3, title: "Include it at the top of your safe page", body: "Add as the FIRST line of your safe page PHP file:\n<?php require_once(__DIR__ . '/tfp-filter.php'); ?>" },
                    { n: 4, title: "Do NOT add it to your money page", body: "Only the safe page needs this code. Your money page is a private destination — it should not be publicly linked anywhere." },
                    { n: 5, title: "Link your ads to the safe page", body: "All ad traffic hits the safe page first. The code decides in milliseconds: real visitor → money page, bot/reviewer → stays on safe page." },
                  ]} note="Best for multi-page PHP sites. One file to maintain — update tfp-filter.php when you change campaign settings and it applies everywhere." />
                )}

                {activeVariant === "wordpress" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the plugin code above", body: "The code is a complete WordPress plugin with proper plugin file headers." },
                    { n: 2, title: "Create the plugin folder and file", body: "On your computer: create a folder named tfp-filter, inside it create tfp-filter.php, paste the code." },
                    { n: 3, title: "Zip and upload to WordPress", body: "Zip the tfp-filter folder → WordPress Admin → Plugins → Add New → Upload Plugin → select zip → Install Now." },
                    { n: 4, title: "Activate the plugin", body: "Click Activate. The filter now runs on your WordPress site." },
                    { n: 5, title: "Configure it to run on your safe page only", body: "In the plugin settings or by editing the plugin, set it to run only on the specific page your ads link to. Bots that land there will see the page; real users will be redirected to your money page URL." },
                    { n: 6, title: "Set your ad links to the WordPress safe page URL", body: "Example: if your safe page is yoursite.com/landing — that URL goes into your ad campaign. Your money page URL is never shared publicly." },
                  ]} note="Compatible with WordPress 5.0+. Works with Elementor, Divi, WooCommerce. Test by visiting the page with a VPN — you should stay. Test with mobile cellular — you should be redirected to money page." />
                )}

                {activeVariant === "nextjs" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the middleware code", body: "This is a Next.js Edge Middleware file — it intercepts every request before the page renders." },
                    { n: 2, title: "Place as middleware.ts in your project root", body: "Put the file at the root of your Next.js project (same level as package.json), not inside /app or /pages." },
                    { n: 3, title: "Configure the matcher for your safe page route", body: "Edit config.matcher to only run on your safe page route, e.g.:\nexport const config = { matcher: ['/landing', '/'] }\nThe safe page is what your ads link to." },
                    { n: 4, title: "Deploy", body: "Run npm run build && npm start or push to Vercel. The middleware runs at Edge level — before any page is rendered. Real users get redirected to money page, bots see the safe page." },
                    { n: 5, title: "Verify", body: "Check Vercel Functions logs or your server logs to see redirect decisions being made per visitor." },
                  ]} note="Requires Next.js 12.2+. Runs at CDN edge — zero latency. Your money page URL is a server-side redirect, never exposed in page source." />
                )}

                {activeVariant === "python" && (
                  <InstallSteps steps={[
                    { n: 1, title: "Copy the code and save as tfp_filter.py", body: "Save in your project directory alongside your Flask/Django app." },
                    { n: 2, title: "For Flask — register as WSGI middleware", body: "In app.py:\nfrom tfp_filter import TrafficFilter\napp.wsgi_app = TrafficFilter(app.wsgi_app)" },
                    { n: 3, title: "For Django — add to MIDDLEWARE", body: 'In settings.py:\nMIDDLEWARE = [\n  "tfp_filter.TrafficFilterMiddleware",\n  ... # rest of your middleware\n]' },
                    { n: 4, title: "Set your campaign code in the filter file", body: "Edit tfp_filter.py and set CAMPAIGN_CODE to your campaign code. This tells the filter which money page URL to redirect real visitors to." },
                    { n: 5, title: "Point your safe page route to this middleware", body: "Configure the middleware to apply only to your safe page route (e.g. / or /landing). Real visitors hitting that route get forwarded to your money page." },
                    { n: 6, title: "Restart and test", body: "Restart the server. Test: visit with VPN → stay on safe page. Visit from real mobile cellular → redirect to money page." },
                  ]} note="Works with Flask 2.x and Django 4.x. The money page URL is only in your server config — never exposed to bots or reviewers." />
                )}
              </div>

              {/* How it works flow */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✅</span> How the cloaking flow works
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12, color: "#374151", lineHeight: 2 }}>
                  <span style={{ background: "#4F46E5", color: "white", borderRadius: 5, padding: "2px 9px", fontWeight: 600, fontSize: 11 }}>Your Ad</span>
                  <span style={{ color: "#9CA3AF" }}>→</span>
                  <span style={{ background: "#1a1a2e", color: "white", borderRadius: 5, padding: "2px 9px", fontWeight: 600, fontSize: 11 }}>Safe Page + Tracking Code</span>
                  <span style={{ color: "#9CA3AF" }}>→</span>
                  <span style={{ background: "#10B981", color: "white", borderRadius: 5, padding: "2px 9px", fontWeight: 600, fontSize: 11 }}>Real Visitor → Money Page</span>
                  <br />
                  <span style={{ display: "inline-block", width: "100%", marginLeft: 2, fontSize: 11, color: "#6B7280" }}>
                    Bots / VPN / Datacenter / Human Reviewers → stay on Safe Page (never see money page)
                  </span>
                </div>
              </div>

              {/* Warning box */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
                  <strong>Install on your Safe Page only.</strong> Your ad link should point to the safe page where this code is installed. Real visitors get silently redirected to your money page. Bots, VPNs, datacenter IPs, and human reviewers (ad platform moderators) never leave the safe page — they never see your offer. Do <em>not</em> install this code on your money page.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "12px 24px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAFA", borderRadius: "0 0 14px 14px", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
                Need help? Check the documentation or contact support.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyCode} style={{ padding: "8px 18px", background: copied ? "#10B981" : "#4F46E5", color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", minWidth: 130, transition: "background 0.2s" }}>
                  {copied ? "✓ Copied!" : "Copy Code"}
                </button>
                <button onClick={() => setTrackingModal(null)} style={{ padding: "8px 16px", background: "white", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Condition Card ───────────────────────────────────────────
function ConditionCard({ cond, onUpdate, onRemove }: { cond: Condition; onUpdate: (uid: string, patch: Partial<Condition>) => void; onRemove: (uid: string) => void }) {
  const ct = CONDITION_TYPES.find(x => x.id === cond.type)

  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{ct?.icon}</span> {ct?.label}
        </div>
        <button type="button" onClick={() => onRemove(cond.uid)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18 }}>🗑</button>
      </div>

      {/* Allow / Block radio */}
      {cond.type !== "time_of_day" && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          {(["allow", "block"] as const).map(m => (
            <label key={m} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input type="radio" name={`mode-${cond.uid}`} checked={cond.mode === m} onChange={() => onUpdate(cond.uid, { mode: m })} style={{ accentColor: "#4F46E5" }} />
              {m === "allow" ? "Allow" : "Block"}
            </label>
          ))}
        </div>
      )}

      {/* Country */}
      {cond.type === "country" && (
        <MiniCountryDropdown selected={cond.values} onChange={v => onUpdate(cond.uid, { values: v })} />
      )}

      {/* Device Type */}
      {cond.type === "device_type" && (
        <CheckGroup options={["Desktop", "Mobile", "Tablet", "Smart TV"]} selected={cond.values} onChange={v => onUpdate(cond.uid, { values: v })} />
      )}

      {/* Browser */}
      {cond.type === "browser" && (
        <CheckGroup options={["Chrome", "Firefox", "Safari", "Edge", "Opera", "Samsung Internet", "Other"]} selected={cond.values} onChange={v => onUpdate(cond.uid, { values: v })} />
      )}

      {/* OS */}
      {cond.type === "os" && (
        <CheckGroup options={["Windows", "macOS", "Linux", "Android", "iOS", "Chrome OS"]} selected={cond.values} onChange={v => onUpdate(cond.uid, { values: v })} />
      )}

      {/* Connection Type */}
      {cond.type === "connection_type" && (
        <CheckGroup options={["Residential", "Datacenter / Hosting", "Mobile / Cellular", "Satellite", "Corporate"]} selected={cond.values} onChange={v => onUpdate(cond.uid, { values: v })} />
      )}

      {/* Referrer */}
      {cond.type === "referrer" && (
        <div>
          <input style={inp} placeholder="e.g. google.com or facebook.com/ads (one per line or comma-separated)"
            value={cond.textValue} onChange={e => onUpdate(cond.uid, { textValue: e.target.value })} />
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>Enter referrer domain(s) to match. Leave empty = any referrer.</p>
        </div>
      )}

      {/* IP */}
      {cond.type === "ip" && (
        <div>
          <textarea style={{ ...inp, height: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            placeholder={"One IP or CIDR per line:\n192.168.1.0\n10.0.0.0/8"}
            value={cond.textValue} onChange={e => onUpdate(cond.uid, { textValue: e.target.value })} />
        </div>
      )}

      {/* Time of Day */}
      {cond.type === "time_of_day" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#374151" }}>Allow visits from</span>
          <select style={{ ...inp, width: 100 }} value={cond.fromHour} onChange={e => onUpdate(cond.uid, { fromHour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
          </select>
          <span style={{ fontSize: 13, color: "#374151" }}>to</span>
          <select style={{ ...inp, width: 100 }} value={cond.toHour} onChange={e => onUpdate(cond.uid, { toHour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
          </select>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>(server UTC time)</span>
        </div>
      )}
    </div>
  )
}

function CheckGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => (
        <label key={o} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: `1px solid ${selected.includes(o) ? "#4F46E5" : "#E5E7EB"}`, borderRadius: 20, cursor: "pointer", fontSize: 13, background: selected.includes(o) ? "#F5F3FF" : "white", color: selected.includes(o) ? "#4F46E5" : "#374151" }}>
          <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} style={{ display: "none" }} />
          {o}
        </label>
      ))}
    </div>
  )
}

function MiniCountryDropdown({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [])
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  const toggle = (code: string) => onChange(selected.includes(code) ? selected.filter(x => x !== code) : [...selected, code])
  return (
    <div style={{ position: "relative" }} ref={ref}>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {selected.slice(0, 8).map(code => {
            const c = COUNTRIES.find(x => x.code === code)
            return <span key={code} style={{ display: "flex", alignItems: "center", gap: 3, background: "#EDE9FE", color: "#4F46E5", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>
              {c?.name ?? code} <button type="button" onClick={() => toggle(code)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4F46E5", padding: 0, fontSize: 13 }}>×</button>
            </span>
          })}
          {selected.length > 8 && <span style={{ fontSize: 12, color: "#9CA3AF", padding: "2px 6px" }}>+{selected.length - 8} more</span>}
          <button type="button" onClick={() => onChange([])} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 11, textDecoration: "underline" }}>Clear</button>
        </div>
      )}
      <div onClick={() => setOpen(o => !o)} style={{ padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: 7, cursor: "pointer", fontSize: 13, color: selected.length === 0 ? "#9CA3AF" : "#374151", display: "flex", justifyContent: "space-between" }}>
        <span>{selected.length === 0 ? "Select countries..." : `${selected.length} selected`}</span>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ position: "absolute", zIndex: 150, background: "white", border: "1px solid #E5E7EB", borderRadius: 8, marginTop: 4, width: "100%", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", maxHeight: 280, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 8, borderBottom: "1px solid #F3F4F6" }}>
            <input autoFocus placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "6px 10px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ overflowY: "auto" }}>
            {filtered.map(c => (
              <div key={c.code} onClick={() => toggle(c.code)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", cursor: "pointer", fontSize: 13, background: selected.includes(c.code) ? "#EDE9FE" : "white" }}
                onMouseEnter={e => { if (!selected.includes(c.code)) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selected.includes(c.code) ? "#EDE9FE" : "white" }}>
                <span style={{ width: 14, height: 14, border: `2px solid ${selected.includes(c.code) ? "#4F46E5" : "#D1D5DB"}`, borderRadius: 3, background: selected.includes(c.code) ? "#4F46E5" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selected.includes(c.code) && <span style={{ color: "white", fontSize: 9 }}>✓</span>}
                </span>
                {c.name} <span style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Campaign Card ────────────────────────────────────────────
function CampaignCard({ w, onGetCode, onEdit, onToggle, onDelete }: { w: Website; onGetCode: (id: number, name: string) => void; onEdit: (w: Website) => void; onToggle: (w: Website) => void; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: w.is_active ? "#10B981" : "#D1D5DB", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{w.name}</span>
            <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, fontWeight: 500, background: w.is_active ? "#D1FAE5" : "#F3F4F6", color: w.is_active ? "#065F46" : "#6B7280" }}>
              {w.is_active ? "Active" : "Paused"}
            </span>
            {w.cloaking_enabled && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: "#EDE9FE", color: "#4F46E5", fontWeight: 500 }}>Cloaking ON</span>}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", display: "flex", gap: 14 }}>
            <span>{w.domain}</span>
            <span>Code: <strong style={{ color: "#4F46E5", fontFamily: "monospace" }}>{w.campaign_code}</strong></span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onGetCode(w.id, w.name)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #4F46E5", background: "#F5F3FF", fontSize: 12, cursor: "pointer", color: "#4F46E5", fontWeight: 600 }}>Get Code</button>
          <button onClick={() => onEdit(w)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #E5E7EB", background: "white", fontSize: 12, cursor: "pointer", color: "#374151" }}>Edit</button>
          <button onClick={() => onToggle(w)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #E5E7EB", background: "white", fontSize: 12, cursor: "pointer", color: "#374151" }}>{w.is_active ? "Pause" : "Resume"}</button>
          <button onClick={() => setExpanded(e => !e)} style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid #E5E7EB", background: "white", fontSize: 12, cursor: "pointer", color: "#6B7280" }}>{expanded ? "▲" : "▼"}</button>
          <button onClick={() => onDelete(w.id)} style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEF2F2", fontSize: 12, cursor: "pointer", color: "#EF4444" }}>✕</button>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 18px", background: "#FAFAFA", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
          {[["Landing Page", w.landing_page_url], ["Safe Page", w.safe_page_url],
            ["Allowed Countries", Array.isArray(w.allowed_countries) && w.allowed_countries.length > 0 ? w.allowed_countries.join(", ") : "All countries"],
            ["Blocked Platforms", Array.isArray(w.blocked_ad_platforms) && w.blocked_ad_platforms.length > 0 ? `${w.blocked_ad_platforms.length} platforms` : "None"]
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: "#374151", wordBreak: "break-all" }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Field wrapper ────────────────────────────────────────────
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: "#9CA3AF", margin: "5px 0 0" }}>{hint}</p>}
    </div>
  )
}

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#1a1a2e", background: "white" }
const footBtn: React.CSSProperties = { padding: "9px 16px", background: "white", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 500 }
