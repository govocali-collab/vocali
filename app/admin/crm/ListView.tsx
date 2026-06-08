"use client"

import Link from "next/link"
import { STATUSES, STATUS_CONFIG } from "@/lib/supabase/prospects"
import type { Prospect, ProspectStatus } from "@/lib/supabase/prospects"
import { cn } from "@/lib/utils"
import StatusDropdown from "./StatusDropdown"

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })
}

interface Props {
  prospects: Prospect[]
  allProspects: Prospect[]
  filter: ProspectStatus | "all"
  onFilterChange: (f: ProspectStatus | "all") => void
}

export default function ListView({ prospects, allProspects, filter, onFilterChange }: Props) {
  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        {([null, ...STATUSES] as (ProspectStatus | null)[]).map((s) => {
          const isActive = s === null ? filter === "all" : filter === s
          const label = s === null ? "Tous" : STATUS_CONFIG[s].label
          const count = s === null
            ? allProspects.length
            : allProspects.filter((p) => p.status === s).length
          return (
            <button
              key={s ?? "all"}
              onClick={() => onFilterChange((s ?? "all") as ProspectStatus | "all")}
              className={cn(
                "flex items-center gap-1.5 text-sm font-body px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors",
                isActive
                  ? "bg-charcoal-900 text-white"
                  : "text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-200"
              )}
            >
              {label}
              <span className={cn("text-xs", isActive ? "text-white/60" : "text-charcoal-400")}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {prospects.length === 0 ? (
        <div className="text-center py-16 text-charcoal-400 font-body text-sm">
          {filter !== "all" ? "Aucun prospect à cette étape." : "Aucun prospect pour l'instant."}
        </div>
      ) : (
        <div className="space-y-2">
          {prospects.map((p) => {
            const lastContact = formatDate(p.last_contact_at)
            return (
              <div
                key={p.id}
                className="bg-white border border-ivory-300 rounded-xl px-4 py-3 shadow-card flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-charcoal-900 font-body font-semibold text-sm truncate">
                      {p.clinic_name}
                    </p>
                    {p.city && (
                      <span className="text-charcoal-400 text-xs font-body flex-shrink-0">· {p.city}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-charcoal-400 font-body">
                    {p.owner_name && <span>{p.owner_name}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    {lastContact && <span>Contact: {lastContact}</span>}
                    {p.source && (
                      <span className="bg-ivory-100 px-2 py-0.5 rounded-full">{p.source}</span>
                    )}
                  </div>
                </div>
                <StatusDropdown id={p.id} status={p.status} />
                <Link
                  href={`/admin/crm/${p.id}`}
                  className="text-charcoal-300 hover:text-gold-600 text-base transition-colors ml-1 flex-shrink-0"
                >
                  →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
