"use client"

import { cn } from "@/lib/utils"
import type { ScraperLead, ScoreTag } from "@/lib/supabase/scraper"
import { SCORE_CONFIG } from "@/lib/supabase/scraper"

export interface Filters {
  province: string
  scoreTag: string
  hasEmail: boolean
  hasInstagram: boolean
  hasBooking: boolean
  hideImported: boolean
}

interface Props {
  leads: ScraperLead[]
  filters: Filters
  sortBy: "lead_score" | "rating" | "review_count" | "business_name"
  sortDir: "desc" | "asc"
  onFilterChange: (filters: Filters) => void
  onSortChange: (sortBy: Props["sortBy"], sortDir: Props["sortDir"]) => void
  onEnrichAll: () => void
  enrichingCount: number
  totalShown: number
}

const SORT_OPTIONS: { value: Props["sortBy"]; label: string }[] = [
  { value: "lead_score", label: "Score" },
  { value: "rating", label: "Note" },
  { value: "review_count", label: "Avis" },
  { value: "business_name", label: "Nom" },
]

export default function FilterBar({
  leads,
  filters,
  sortBy,
  sortDir,
  onFilterChange,
  onSortChange,
  onEnrichAll,
  enrichingCount,
  totalShown,
}: Props) {
  // Compute unique provinces from leads
  const provinces = Array.from(
    new Set(leads.map((l) => l.province).filter((p): p is string => !!p))
  ).sort()

  const scoreTags = Array.from(
    new Set(leads.map((l) => l.score_tag).filter((t): t is ScoreTag => !!t))
  )

  const leadsWithWebsite = leads.filter((l) => l.website && !l.imported).length
  const isEnriching = enrichingCount > 0

  function update(patch: Partial<Filters>) {
    onFilterChange({ ...filters, ...patch })
  }

  function toggleSort(field: Props["sortBy"]) {
    if (sortBy === field) {
      onSortChange(field, sortDir === "desc" ? "asc" : "desc")
    } else {
      onSortChange(field, "desc")
    }
  }

  const toggleClass = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-body transition-colors",
      active
        ? "bg-charcoal-900 text-white"
        : "text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-200"
    )

  return (
    <div className="space-y-2 mb-4">
      {/* Row 1: Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Province */}
        <select
          value={filters.province}
          onChange={(e) => update({ province: e.target.value })}
          className="border border-ivory-300 rounded-lg px-2 py-1 text-xs font-body text-charcoal-700 focus:outline-none focus:border-gold-400"
        >
          <option value="">Toutes les provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Score tag */}
        <select
          value={filters.scoreTag}
          onChange={(e) => update({ scoreTag: e.target.value })}
          className="border border-ivory-300 rounded-lg px-2 py-1 text-xs font-body text-charcoal-700 focus:outline-none focus:border-gold-400"
        >
          <option value="">Tous les scores</option>
          {scoreTags.map((t) => (
            <option key={t} value={t}>
              {SCORE_CONFIG[t].label}
            </option>
          ))}
        </select>

        {/* Boolean toggles */}
        <div className="flex items-center bg-ivory-200 rounded-lg p-0.5">
          <button
            onClick={() => update({ hasEmail: !filters.hasEmail })}
            className={toggleClass(filters.hasEmail)}
          >
            Email
          </button>
          <button
            onClick={() => update({ hasInstagram: !filters.hasInstagram })}
            className={toggleClass(filters.hasInstagram)}
          >
            Instagram
          </button>
          <button
            onClick={() => update({ hasBooking: !filters.hasBooking })}
            className={toggleClass(filters.hasBooking)}
          >
            Booking
          </button>
        </div>

        <div className="flex items-center bg-ivory-200 rounded-lg p-0.5">
          <button
            onClick={() => update({ hideImported: !filters.hideImported })}
            className={toggleClass(filters.hideImported)}
          >
            Masquer importés
          </button>
        </div>
      </div>

      {/* Row 2: Sort + count + enrich */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs font-body text-charcoal-500">
          <span className="font-semibold">Tri :</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleSort(opt.value)}
              className={cn(
                "px-2 py-0.5 rounded transition-colors",
                sortBy === opt.value
                  ? "bg-charcoal-900 text-white"
                  : "text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-200"
              )}
            >
              {opt.label}
              {sortBy === opt.value && (
                <span className="ml-0.5">{sortDir === "desc" ? "↓" : "↑"}</span>
              )}
            </button>
          ))}
        </div>

        <span className="text-xs text-charcoal-400 font-body ml-auto">
          {totalShown} résultat{totalShown !== 1 ? "s" : ""}
        </span>

        {leadsWithWebsite > 0 && (
          <button
            onClick={onEnrichAll}
            disabled={isEnriching}
            className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {isEnriching
              ? `Enrichissement… (${enrichingCount})`
              : `Enrichir tout (${leadsWithWebsite})`}
          </button>
        )}
      </div>
    </div>
  )
}
