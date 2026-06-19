"use client"

import { cn } from "@/lib/utils"
import type { ScraperSession } from "@/lib/supabase/scraper"

interface Props {
  sessions: ScraperSession[]
  onLoadSession: (id: string) => void
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_BADGE: Record<string, string> = {
  done:    "bg-green-100 text-green-700",
  running: "bg-blue-100 text-blue-700",
  error:   "bg-red-100 text-red-500",
  pending: "bg-slate-100 text-slate-600",
}

const STATUS_LABEL: Record<string, string> = {
  done:    "Terminé",
  running: "En cours",
  error:   "Erreur",
  pending: "En attente",
}

export default function HistoryPanel({ sessions, onLoadSession }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="bg-ink-card border border-ivory-300 rounded-xl p-6 shadow-card">
        <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Recherches récentes
        </p>
        <p className="text-charcoal-400 text-sm font-body text-center py-8">
          Aucune recherche pour l'instant.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-ink-card border border-ivory-300 rounded-xl p-6 shadow-card">
      <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-5">
        Recherches récentes
      </p>
      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 py-2.5 border-b border-ivory-200 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-charcoal-800 text-sm font-body font-medium truncate">
                {[s.business_type, s.city, s.province].filter(Boolean).join(" · ")}
              </p>
              <p className="text-charcoal-400 text-xs font-body">
                {formatDate(s.created_at)} · {s.result_count} résultat
                {s.result_count !== 1 ? "s" : ""}
              </p>
            </div>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                STATUS_BADGE[s.status] ?? "bg-slate-100 text-slate-600"
              )}
            >
              {STATUS_LABEL[s.status] ?? s.status}
            </span>
            {s.status === "done" && s.result_count > 0 && (
              <button
                onClick={() => onLoadSession(s.id)}
                className="text-xs text-gold-600 hover:text-gold-700 font-medium font-body flex-shrink-0 transition-colors"
              >
                Charger
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
