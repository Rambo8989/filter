"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { RefreshCw, Download, Search, ChevronLeft, ChevronRight } from "lucide-react"
import {
  parseBrowser, parseOS, parseDeviceType, getReferrerDomain, humanizeReason, formatLogDate,
  parseDeviceBrand, parseDeviceModel, getCarrier, getCountryTimezone, getTimezoneOffset,
} from "@/lib/log-format"

interface AccessLog {
  id: number
  website_id: number
  ip_address: string
  country: string
  user_agent: string
  page_shown: string
  is_bot: boolean
  bot_type: string | null
  reason: string | null
  referrer: string | null
  pathname: string | null
  region?: string | null
  city?: string | null
  isp?: string | null
  organization?: string | null
  asn?: string | null
  language?: string | null
  created_at: string
}

interface Website {
  id: number
  name: string
  is_active: boolean
  cloaking_enabled: boolean
  status?: "active" | "paused" | "block_all" | "under_review"
}

const CAMPAIGN_STATE_LABELS: Record<string, { label: string; className: string }> = {
  active:        { label: "Active",        className: "text-emerald-600" },
  under_review:  { label: "Under Review",  className: "text-amber-600" },
  paused:        { label: "Paused",        className: "text-gray-400" },
  block_all:     { label: "Block All",     className: "text-red-600" },
}

function getCampaignState(site: Website | undefined): { label: string; className: string } | null {
  if (!site) return null
  const status = site.status || (!site.cloaking_enabled ? "block_all" : !site.is_active ? "paused" : "active")
  return CAMPAIGN_STATE_LABELS[status] || CAMPAIGN_STATE_LABELS.active
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]

const RANGE_OPTIONS = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
]

// Fallback for environments without Intl.supportedValuesOf
const FALLBACK_TIMEZONES = [
  "UTC", "Asia/Kolkata", "Asia/Karachi", "Asia/Dhaka", "Asia/Dubai", "Asia/Singapore",
  "Asia/Hong_Kong", "Asia/Tokyo", "Asia/Shanghai", "Asia/Bangkok", "Asia/Manila",
  "Asia/Jakarta", "Asia/Kuala_Lumpur", "Asia/Seoul", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Moscow", "Europe/Istanbul",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos", "America/New_York",
  "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo",
  "America/Mexico_City", "America/Bogota", "Australia/Sydney", "Pacific/Auckland",
]

function getAllTimezones(): string[] {
  try {
    const supportedValuesOf = (Intl as any).supportedValuesOf
    if (typeof supportedValuesOf === "function") {
      const zones: string[] = supportedValuesOf("timeZone")
      if (zones?.length) return zones
    }
  } catch {}
  return FALLBACK_TIMEZONES
}

const TZ_OPTIONS = [
  { value: "browser", label: "Local Time" },
  { value: "UTC", label: "UTC" },
  ...getAllTimezones()
    .filter((tz) => tz !== "UTC")
    .sort()
    .map((tz) => ({ value: tz, label: `${tz} (${getTimezoneOffset(tz)})` })),
]

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export default function LogsPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const [websiteId, setWebsiteId] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [range, setRange] = useState("7d")
  const [result, setResult] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [timezone, setTimezone] = useState("browser")

  const websiteMap = useMemo(() => {
    const m = new Map<number, Website>()
    websites.forEach((w) => m.set(w.id, w))
    return m
  }, [websites])

  useEffect(() => {
    fetch("/api/websites", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setWebsites(d.data || []) })
      .catch(() => {})
  }, [])

  // Debounce free-text search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), range, result })
      if (websiteId !== "all") params.set("websiteId", websiteId)
      if (search) params.set("search", search)

      const res = await fetch(`/api/access-logs?${params.toString()}`, { credentials: "include" })
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error("Failed to load click log:", err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, range, result, websiteId, search])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const exportCsv = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "200", range, result })
      if (websiteId !== "all") params.set("websiteId", websiteId)
      if (search) params.set("search", search)

      const res = await fetch(`/api/access-logs?${params.toString()}`, { credentials: "include" })
      const data = await res.json()
      const rows: AccessLog[] = data.logs || []

      const header = [
        "Result", "Reason", "Campaign State", "Date & Time", "Url / Filepath", "IP", "Country",
        "Region (State)", "City", "Organization", "ISP", "Carrier", "User-agent", "Browser", "OS",
        "Referrer Domain", "Device Type", "Brand", "Model", "Language", "Timezone", "Timezone Offset",
      ]
      const lines = [header.map(csvCell).join(",")]

      rows.forEach((l) => {
        const site = websiteMap.get(l.website_id)
        const tz = getCountryTimezone(l.country)
        lines.push([
          l.page_shown === "money" ? "Money" : "Safe",
          humanizeReason(l.reason),
          site?.name || `#${l.website_id}`,
          formatLogDate(l.created_at, timezone),
          l.pathname || "/",
          l.ip_address,
          l.country || "UNKNOWN",
          l.region || "—",
          l.city || "—",
          l.organization || "—",
          l.isp || "—",
          getCarrier(l.isp, l.user_agent),
          l.user_agent || "—",
          parseBrowser(l.user_agent),
          parseOS(l.user_agent),
          getReferrerDomain(l.referrer),
          parseDeviceType(l.user_agent),
          parseDeviceBrand(l.user_agent),
          parseDeviceModel(l.user_agent),
          l.language || "—",
          tz || "—",
          getTimezoneOffset(tz),
        ].map((c) => csvCell(String(c))).join(","))
      })

      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `click-log-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to export click log:", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Click Log</h1>
          <p className="text-gray-600 mt-1">Detailed, visitor-level log of every campaign hit</p>
        </div>
        <Button onClick={fetchLogs} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-xs font-medium text-gray-500">Campaign</label>
              <Select value={websiteId} onValueChange={(v) => { setWebsiteId(v); setPage(1) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {websites.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
              <label className="text-xs font-medium text-gray-500">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  className="pl-8"
                  placeholder="IP, reason, referrer, country, path…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500">Result</label>
              <Select value={result} onValueChange={(v) => { setResult(v); setPage(1) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="money">Money</SelectItem>
                  <SelectItem value="safe">Safe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-gray-500">Date Range</label>
              <Select value={range} onValueChange={(v) => { setRange(v); setPage(1) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANGE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500">Timezone</label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TZ_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={exportCsv} disabled={exporting || total === 0}>
              <Download className="h-4 w-4 mr-1.5" />
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Visits</CardTitle>
            <CardDescription>{total.toLocaleString()} total visit{total === 1 ? "" : "s"} matching filters</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
              <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Result</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Campaign State</TableHead>
                  <TableHead className="whitespace-nowrap">Date &amp; Time</TableHead>
                  <TableHead>Url / Filepath</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="whitespace-nowrap">Region (State)</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>User-agent</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead className="whitespace-nowrap">Referrer Domain</TableHead>
                  <TableHead className="whitespace-nowrap">Device Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead className="whitespace-nowrap">Timezone Offset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={22} className="text-center py-10 text-gray-400">Loading…</TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={22} className="text-center py-10 text-gray-400">No visits match these filters</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const site = websiteMap.get(log.website_id)
                    const isMoney = log.page_shown === "money"
                    const campaignState = getCampaignState(site)
                    const tz = getCountryTimezone(log.country)
                    return (
                      <TableRow key={log.id} className={isMoney ? "bg-emerald-50/40" : "bg-red-50/40"}>
                        <TableCell>
                          <Badge variant="outline" className={isMoney ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700"}>
                            {isMoney ? "Money" : "Safe"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 whitespace-nowrap">{humanizeReason(log.reason)}</TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-gray-800">{site?.name || `#${log.website_id}`}</div>
                          {campaignState && (
                            <span className={`text-xs ${campaignState.className}`}>
                              {campaignState.label}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 whitespace-nowrap">{formatLogDate(log.created_at, timezone)}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[200px] truncate" title={log.pathname || "/"}>{log.pathname || "/"}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                        <TableCell className="text-sm">{log.country || "UNKNOWN"}</TableCell>
                        <TableCell className="text-sm">{log.region || "—"}</TableCell>
                        <TableCell className="text-sm">{log.city || "—"}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[160px] truncate" title={log.organization || "—"}>{log.organization || "—"}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[160px] truncate" title={log.isp || "—"}>{log.isp || "—"}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[140px] truncate" title={getCarrier(log.isp, log.user_agent)}>{getCarrier(log.isp, log.user_agent)}</TableCell>
                        <TableCell className="text-xs text-gray-500 max-w-[180px] truncate font-mono" title={log.user_agent || "—"}>{log.user_agent || "—"}</TableCell>
                        <TableCell className="text-sm">{parseBrowser(log.user_agent)}</TableCell>
                        <TableCell className="text-sm">{parseOS(log.user_agent)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{getReferrerDomain(log.referrer)}</TableCell>
                        <TableCell className="text-sm">{parseDeviceType(log.user_agent)}</TableCell>
                        <TableCell className="text-sm">{parseDeviceBrand(log.user_agent)}</TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate" title={parseDeviceModel(log.user_agent)}>{parseDeviceModel(log.user_agent)}</TableCell>
                        <TableCell className="text-sm">{log.language || "—"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{tz || "—"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{getTimezoneOffset(tz)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{total === 0 ? "0 of 0" : `${rangeStart}–${rangeEnd} of ${total.toLocaleString()}`}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="px-2">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
