"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScraperLead, ScoreTag } from "@/lib/supabase/scraper"
import { SCORE_CONFIG } from "@/lib/supabase/scraper"

interface Props {
  leads: ScraperLead[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onEnrichOne: (lead: ScraperLead) => void
  enrichingIds: Set<string>
}

function domainOnly(url: string | null): string {
  if (!url) return "—"
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function EnrichmentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scraped:  "bg-slate-100 text-slate-600",
    enriched: "bg-blue-100 text-blue-700",
    failed:   "bg-red-100 text-red-500",
  }
  const labels: Record<string, string> = {
    scraped:  "Scrapé",
    enriched: "Enrichi",
    failed:   "Échec",
  }
  const cls = map[status] ?? "bg-slate-100 text-slate-600"
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cls)}>
      {labels[status] ?? status}
    </span>
  )
}

export default function ResultsTable({
  leads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onEnrichOne,
  enrichingIds,
}: Props) {
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id))

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-charcoal-400 font-body text-sm">
        Aucun résultat à afficher.
      </div>
    )
  }

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="min-w-[1080px] w-full text-sm font-body">
        <thead>
          <tr className="border-b border-ivory-300">
            <th className="pl-5 pr-2 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={allSelected ? onDeselectAll : onSelectAll}
                className="rounded border-ivory-300 text-gold-600 focus:ring-gold-400"
              />
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Nom
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Téléphone
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Web
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Contact
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Avis
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Booking
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Score
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Statut
            </th>
            <th className="px-3 pr-5 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isSelected = selectedIds.has(lead.id)
            const isEnriching = enrichingIds.has(lead.id)
            const canEnrich =
              !!lead.website &&
              lead.enrichment_status !== "enriched" &&
              !isEnriching

            const scoreTag = lead.score_tag as ScoreTag | null
            const scoreConfig = scoreTag ? SCORE_CONFIG[scoreTag] : null

            return (
              <tr
                key={lead.id}
                className={cn(
                  "border-b border-ivory-200 hover:bg-ivory-50 transition-colors",
                  lead.imported && "opacity-60"
                )}
              >
                {/* Checkbox */}
                <td className="pl-5 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(lead.id)}
                    className="rounded border-ivory-300 text-gold-600 focus:ring-gold-400"
                  />
                </td>

                {/* Nom */}
                <td className="px-3 py-3 max-w-[200px]">
                  <p className="font-semibold text-charcoal-900 truncate">{lead.business_name}</p>
                  {(lead.city || lead.province) && (
                    <p className="text-charcoal-400 text-xs truncate">
                      {[lead.city, lead.province].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {lead.business_status && lead.business_status !== "OPERATIONAL" && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      {lead.business_status}
                    </span>
                  )}
                </td>

                {/* Téléphone */}
                <td className="px-3 py-3 text-charcoal-600 whitespace-nowrap">
                  {lead.phone ?? <span className="text-charcoal-300">—</span>}
                </td>

                {/* Web */}
                <td className="px-3 py-3 max-w-[140px]">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 hover:text-gold-700 text-xs truncate block"
                    >
                      {domainOnly(lead.website)} ↗
                    </a>
                  ) : (
                    <span className="text-charcoal-300">—</span>
                  )}
                </td>

                {/* Contact */}
                <td className="px-3 py-3 max-w-[180px]">
                  {lead.email && (
                    <p className="text-charcoal-700 text-xs truncate">{lead.email}</p>
                  )}
                  {lead.instagram && (
                    <a
                      href={lead.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-charcoal-400 text-xs truncate block hover:text-gold-600"
                    >
                      {lead.instagram.replace("https://instagram.com/", "@")}
                    </a>
                  )}
                  {!lead.email && !lead.instagram && (
                    <span className="text-charcoal-300">—</span>
                  )}
                </td>

                {/* Avis */}
                <td className="px-3 py-3 whitespace-nowrap text-charcoal-600 text-xs">
                  {lead.rating !== null ? (
                    <span>
                      ⭐ {lead.rating}{" "}
                      <span className="text-charcoal-400">({lead.review_count ?? 0})</span>
                    </span>
                  ) : (
                    <span className="text-charcoal-300">—</span>
                  )}
                </td>

                {/* Booking */}
                <td className="px-3 py-3 text-xs text-charcoal-600 whitespace-nowrap">
                  {lead.booking_platform ?? <span className="text-charcoal-300">—</span>}
                </td>

                {/* Score */}
                <td className="px-3 py-3">
                  {lead.lead_score !== null && scoreConfig ? (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit",
                        scoreConfig.badge
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", scoreConfig.dot)} />
                      {lead.lead_score}
                    </span>
                  ) : (
                    <span className="text-charcoal-300 text-xs">—</span>
                  )}
                </td>

                {/* Statut */}
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <EnrichmentBadge status={lead.enrichment_status} />
                    {lead.imported && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 w-fit">
                        Dans CRM ✓
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 pr-5 py-3">
                  {isEnriching ? (
                    <span className="flex items-center gap-1 text-xs text-charcoal-400">
                      <Loader2 size={12} className="animate-spin" /> Enrichissement…
                    </span>
                  ) : canEnrich ? (
                    <button
                      onClick={() => onEnrichOne(lead)}
                      className="text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors"
                    >
                      Enrichir
                    </button>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
