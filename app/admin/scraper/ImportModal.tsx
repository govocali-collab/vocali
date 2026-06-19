"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, STATUSES } from "@/lib/supabase/prospects"
import type { ProspectStatus } from "@/lib/supabase/prospects"

interface Props {
  open: boolean
  count: number
  onClose: () => void
  onImport: (status: ProspectStatus, source: string) => Promise<void>
}

export default function ImportModal({ open, count, onClose, onImport }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<ProspectStatus>("nouveau")
  const [source, setSource] = useState("Scraper Google Maps")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleImport() {
    setLoading(true)
    try {
      await onImport(selectedStatus, source)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-ink-card border border-ivory-300 rounded-xl p-6 shadow-card w-full max-w-md">
        <h2 className="text-charcoal-900 font-display text-xl font-semibold mb-1">
          Importer {count} prospect{count !== 1 ? "s" : ""}
        </h2>
        <p className="text-charcoal-400 text-sm font-body mb-6">
          Choisissez l'étape du pipeline pour ces prospects.
        </p>

        {/* Pipeline stage selector */}
        <div className="mb-5">
          <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Étape du pipeline
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s]
              const active = selectedStatus === s
              return (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                    active
                      ? cn(cfg.badge, "border-current ring-2 ring-offset-1 ring-current/30")
                      : cn(cfg.badge, "border-transparent opacity-60 hover:opacity-100")
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Source */}
        <div className="mb-6">
          <label className="block text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
            Source
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>

        {/* Preview */}
        <p className="text-charcoal-500 text-sm font-body mb-6">
          <span className="font-semibold text-charcoal-800">{count}</span> prospect
          {count !== 1 ? "s" : ""} → étape{" "}
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              STATUS_CONFIG[selectedStatus].badge
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                STATUS_CONFIG[selectedStatus].dot
              )}
            />
            {STATUS_CONFIG[selectedStatus].label}
          </span>
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium font-body text-charcoal-500 hover:text-charcoal-800 transition-colors px-4 py-2"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={loading || count === 0}
            className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? "Importation…" : "Importer →"}
          </button>
        </div>
      </div>
    </div>
  )
}
