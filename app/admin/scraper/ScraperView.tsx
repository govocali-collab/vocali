"use client"

import { useState, useMemo } from "react"
import type { ScraperSession, ScraperLead } from "@/lib/supabase/scraper"
import type { ProspectStatus } from "@/lib/supabase/prospects"
import SearchForm from "./SearchForm"
import type { SearchParams } from "./SearchForm"
import FilterBar from "./FilterBar"
import type { Filters } from "./FilterBar"
import ResultsTable from "./ResultsTable"
import ImportModal from "./ImportModal"
import HistoryPanel from "./HistoryPanel"

interface Props {
  initialSessions: ScraperSession[]
}

type SortBy = "lead_score" | "rating" | "review_count" | "business_name"
type SortDir = "desc" | "asc"

export default function ScraperView({ initialSessions }: Props) {
  const [view, setView] = useState<"search" | "results">("search")
  const [searching, setSearching] = useState(false)
  const [leads, setLeads] = useState<ScraperLead[]>([])
  const [currentSearch, setCurrentSearch] = useState<{ businessType: string; city: string } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [importOpen, setImportOpen] = useState(false)
  const [sessions, setSessions] = useState<ScraperSession[]>(initialSessions)
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set())
  const [enrichingAll, setEnrichingAll] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    province: "",
    scoreTag: "",
    hasEmail: false,
    hasInstagram: false,
    hasBooking: false,
    hideImported: false,
  })
  const [sortBy, setSortBy] = useState<SortBy>("lead_score")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // ── Computed ────────────────────────────────────────────────────────────────

  const displayLeads = useMemo(() => {
    let filtered = [...leads]

    if (filters.province) {
      filtered = filtered.filter((l) => l.province === filters.province)
    }
    if (filters.scoreTag) {
      filtered = filtered.filter((l) => l.score_tag === filters.scoreTag)
    }
    if (filters.hasEmail) {
      filtered = filtered.filter((l) => !!l.email)
    }
    if (filters.hasInstagram) {
      filtered = filtered.filter((l) => !!l.instagram)
    }
    if (filters.hasBooking) {
      filtered = filtered.filter((l) => !!l.booking_platform)
    }
    if (filters.hideImported) {
      filtered = filtered.filter((l) => !l.imported)
    }

    filtered.sort((a, b) => {
      let aVal: string | number | null
      let bVal: string | number | null

      switch (sortBy) {
        case "lead_score":
          aVal = a.lead_score ?? -1
          bVal = b.lead_score ?? -1
          break
        case "rating":
          aVal = a.rating ?? -1
          bVal = b.rating ?? -1
          break
        case "review_count":
          aVal = a.review_count ?? -1
          bVal = b.review_count ?? -1
          break
        case "business_name":
          aVal = a.business_name.toLowerCase()
          bVal = b.business_name.toLowerCase()
          break
        default:
          return 0
      }

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return filtered
  }, [leads, filters, sortBy, sortDir])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleSearch(params: SearchParams) {
    setSearching(true)
    try {
      const res = await fetch("/api/admin/scraper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        alert(err.error ?? "Erreur lors de la recherche")
        return
      }
      const data = await res.json() as { session: ScraperSession; leads: ScraperLead[] }
      setLeads(data.leads)
      setCurrentSearch({ businessType: params.businessType, city: params.city })
      setSessions((prev) => [data.session, ...prev].slice(0, 15))
      setSelectedIds(new Set())
      setFilters({ province: "", scoreTag: "", hasEmail: false, hasInstagram: false, hasBooking: false, hideImported: false })
      setSortBy("lead_score")
      setSortDir("desc")
      setView("results")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSearching(false)
    }
  }

  async function handleEnrichOne(lead: ScraperLead) {
    setEnrichingIds((prev) => new Set([...prev, lead.id]))
    try {
      const res = await fetch("/api/admin/scraper/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id }),
      })
      if (!res.ok) return
      const data = await res.json() as { lead: ScraperLead }
      setLeads((prev) => prev.map((l) => (l.id === data.lead.id ? data.lead : l)))
    } finally {
      setEnrichingIds((prev) => {
        const next = new Set(prev)
        next.delete(lead.id)
        return next
      })
    }
  }

  async function handleEnrichAll() {
    if (enrichingAll) return
    setEnrichingAll(true)

    const toEnrich = leads.filter(
      (l) => l.website && l.enrichment_status !== "enriched" && !enrichingIds.has(l.id)
    )

    for (const lead of toEnrich) {
      await handleEnrichOne(lead)
    }

    setEnrichingAll(false)
  }

  async function handleImport(status: ProspectStatus, source: string) {
    const ids = Array.from(selectedIds)
    const res = await fetch("/api/admin/scraper/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status, source }),
    })
    if (!res.ok) {
      const err = await res.json() as { error?: string }
      alert(err.error ?? "Erreur lors de l'import")
      return
    }
    const data = await res.json() as { count: number; prospectIds: string[] }
    // Mark leads as imported in local state
    setLeads((prev) =>
      prev.map((l) =>
        ids.includes(l.id)
          ? { ...l, imported: true, imported_at: new Date().toISOString() }
          : l
      )
    )
    setSelectedIds(new Set())
    alert(`${data.count} prospect${data.count !== 1 ? "s" : ""} importé${data.count !== 1 ? "s" : ""} avec succès.`)
  }

  async function handleLoadSession(sessionId: string) {
    try {
      const res = await fetch(`/api/admin/scraper/session/${sessionId}`)
      if (!res.ok) return
      const data = await res.json() as { leads: ScraperLead[] }
      setLeads(data.leads)
      setCurrentSearch(null)
      setSelectedIds(new Set())
      setFilters({ province: "", scoreTag: "", hasEmail: false, hasInstagram: false, hasBooking: false, hideImported: false })
      setSortBy("lead_score")
      setSortDir("desc")
      setView("results")
    } catch {
      // silently fail
    }
  }

  // ── Selection helpers ────────────────────────────────────────────────────────

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(displayLeads.map((l) => l.id)))
  }

  function deselectAll() {
    setSelectedIds(new Set())
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (view === "search") {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold">
            Scraper Google Maps
          </h1>
          <p className="text-charcoal-500 text-sm mt-1 font-body">
            Trouvez des prospects via l'API Google Places
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Search form */}
          <div className="lg:col-span-3 bg-ink-card border border-ivory-300 rounded-xl p-6 shadow-card">
            <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Nouvelle recherche
            </p>
            <SearchForm onSearch={handleSearch} disabled={searching} />
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <HistoryPanel sessions={sessions} onLoadSession={handleLoadSession} />
          </div>
        </div>
      </div>
    )
  }

  // Results view
  const selectedCount = selectedIds.size
  const enrichingCount = enrichingIds.size

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => setView("search")}
              className="text-charcoal-400 hover:text-charcoal-700 text-sm font-body transition-colors"
            >
              ← Retour
            </button>
            <h1 className="text-charcoal-900 font-display text-2xl font-semibold">
              {currentSearch
                ? `${currentSearch.businessType} · ${currentSearch.city}`
                : "Résultats chargés"}
            </h1>
          </div>
          <p className="text-charcoal-500 text-sm font-body">
            {leads.length} prospect{leads.length !== 1 ? "s" : ""} trouvé
            {leads.length !== 1 ? "s" : ""}
          </p>
        </div>

        {selectedCount > 0 && (
          <button
            onClick={() => setImportOpen(true)}
            className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Importer ({selectedCount}) →
          </button>
        )}
      </div>

      {/* Filter bar */}
      <FilterBar
        leads={leads}
        filters={filters}
        sortBy={sortBy}
        sortDir={sortDir}
        onFilterChange={setFilters}
        onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir) }}
        onEnrichAll={handleEnrichAll}
        enrichingCount={enrichingAll ? enrichingCount : enrichingCount}
        totalShown={displayLeads.length}
      />

      {/* Results table */}
      <div className="bg-ink-card border border-ivory-300 rounded-xl px-5 py-4 shadow-card">
        <ResultsTable
          leads={displayLeads}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onEnrichOne={handleEnrichOne}
          enrichingIds={enrichingIds}
        />
      </div>

      {/* Import modal */}
      <ImportModal
        open={importOpen}
        count={selectedCount}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  )
}
