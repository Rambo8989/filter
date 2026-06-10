"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Platform {
  id: string; name: string; category: string; icon: string; description: string; website: string
}

interface AdPlatformSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  disabled?: boolean
}

const CATEGORY_ORDER = [
  "ad_verification", "search", "social", "display", "programmatic",
  "native", "mobile", "pop_push", "affiliate", "video"
]

export function AdPlatformSelector({ selected, onChange, disabled }: AdPlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [categories, setCategories] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/ad-platforms")
      .then(r => r.json())
      .then(data => {
        if (data.success) { setPlatforms(data.data); setCategories(data.categories) }
      })
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: string) => {
    if (disabled) return
    // ad_verification platforms cannot be deselected — always blocked
    const platform = platforms.find(p => p.id === id)
    if (platform?.category === "ad_verification") return
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const filtered = platforms.filter(p => {
    const matchCat = activeCategory === "all" || p.category === activeCategory
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const selectAllVisible = () => {
    if (disabled) return
    const ids = filtered.filter(p => p.category !== "ad_verification").map(p => p.id)
    const allSel = ids.every(id => selected.includes(id))
    onChange(allSel ? selected.filter(id => !ids.includes(id)) : [...new Set([...selected, ...ids])])
  }

  const categoryList = ["all", ...CATEGORY_ORDER.filter(c => platforms.some(p => p.category === c))]

  const alwaysBlockedIds = platforms.filter(p => p.category === "ad_verification").map(p => p.id)

  if (loading) return <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading platforms...</div>

  return (
    <div className="space-y-3">
      {/* Auto-blocked notice */}
      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
        🛡️ <strong>Ad verification bots</strong> (IAS, DoubleVerify, Moat) are <strong>always blocked automatically</strong> — no selection needed.
      </div>

      {/* Search + actions */}
      <div className="flex gap-2">
        <Input
          placeholder="Search platforms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
        <Button variant="outline" size="sm" onClick={selectAllVisible} disabled={disabled} className="shrink-0">
          {filtered.filter(p => p.category !== "ad_verification").every(p => selected.includes(p.id)) ? "Deselect" : "Select all"}
        </Button>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange([])} disabled={disabled} className="shrink-0">
            Clear ({selected.length})
          </Button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categoryList.map(cat => {
          const label = cat === "all" ? "All" : (categories[cat] || cat)
          const total = cat === "all" ? platforms.length : platforms.filter(p => p.category === cat).length
          const selCount = cat === "all"
            ? selected.length
            : platforms.filter(p => p.category === cat && (selected.includes(p.id) || p.category === "ad_verification")).length

          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {label} <span className="opacity-60">{selCount > 0 ? `${selCount}/` : ""}{total}</span>
            </button>
          )
        })}
      </div>

      {/* Platform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
        {filtered.map(p => {
          const isVerification = p.category === "ad_verification"
          const isSelected = selected.includes(p.id) || isVerification

          return (
            <div key={p.id} onClick={() => toggle(p.id)}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                isVerification ? "border-amber-300 bg-amber-50 cursor-not-allowed"
                : isSelected ? "border-primary bg-primary/5 cursor-pointer"
                : "border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
              <div className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 ${
                isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}>
                {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{p.icon}</span>
                  <span className="text-xs font-semibold truncate">{p.name}</span>
                  {isVerification && <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded">AUTO</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{p.website}</p>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-sm text-muted-foreground">
            No platforms found for "{search}"
          </div>
        )}
      </div>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          <span className="text-xs text-muted-foreground self-center">Blocking:</span>
          {[...alwaysBlockedIds, ...selected].filter((v, i, a) => a.indexOf(v) === i).slice(0, 12).map(id => {
            const p = platforms.find(p => p.id === id)
            if (!p) return null
            const isAuto = p.category === "ad_verification"
            return (
              <Badge key={id} variant={isAuto ? "outline" : "secondary"}
                className={`text-[10px] ${isAuto ? "border-amber-300 text-amber-700" : "cursor-pointer hover:bg-destructive/10"}`}
                onClick={() => !isAuto && toggle(id)}>
                {p.icon} {p.name} {!isAuto && "×"}
              </Badge>
            )
          })}
          {(selected.length + alwaysBlockedIds.length) > 12 && (
            <Badge variant="secondary" className="text-[10px]">
              +{selected.length + alwaysBlockedIds.length - 12} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
