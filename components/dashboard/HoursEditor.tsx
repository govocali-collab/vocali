"use client"

import { useState } from "react"
import { Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateHours } from "@/app/actions/settings"

type Entry = { open: string; close: string; closed: boolean }

// Ordre fixe lundi → dimanche.
const DAYS: { fr: string; label: string }[] = [
  { fr: "lundi", label: "Lundi" },
  { fr: "mardi", label: "Mardi" },
  { fr: "mercredi", label: "Mercredi" },
  { fr: "jeudi", label: "Jeudi" },
  { fr: "vendredi", label: "Vendredi" },
  { fr: "samedi", label: "Samedi" },
  { fr: "dimanche", label: "Dimanche" },
]

const EN_FALLBACK: Record<string, string> = {
  lundi: "monday", mardi: "tuesday", mercredi: "wednesday", jeudi: "thursday",
  vendredi: "friday", samedi: "saturday", dimanche: "sunday",
}

type RawHours = Record<string, { open?: string; close?: string; closed?: boolean } | undefined>

export default function HoursEditor({ initialHours }: { initialHours: RawHours }) {
  const [hours, setHours] = useState<Record<string, Entry>>(() => {
    const init: Record<string, Entry> = {}
    for (const d of DAYS) {
      const e = initialHours?.[d.fr] ?? initialHours?.[EN_FALLBACK[d.fr]] ?? {}
      init[d.fr] = { open: e.open ?? "09:00", close: e.close ?? "17:00", closed: e.closed ?? false }
    }
    return init
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const set = (day: string, patch: Partial<Entry>) => {
    setHours((p) => ({ ...p, [day]: { ...p[day], ...patch } }))
    setSaved(false)
  }

  async function handleSave() {
    setLoading(true)
    setError("")
    setSaved(false)
    try {
      await updateHours(hours)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={13} className="text-charcoal-400" />
        <h2 className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">
          Heures d'opération
        </h2>
      </div>
      <p className="text-charcoal-400 text-xs font-body mb-4">
        Décochez un jour pour le marquer fermé. Votre agent utilise ces heures.
      </p>

      <div className="divide-y divide-ivory-200">
        {DAYS.map((d) => {
          const day = hours[d.fr]
          return (
            <div key={d.fr} className="flex items-center gap-3 py-2.5">
              <label className="flex items-center gap-2 w-32 flex-shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!day.closed}
                  onChange={(e) => set(d.fr, { closed: !e.target.checked })}
                  className="w-3.5 h-3.5 accent-amber-600"
                />
                <span className={cn("text-sm font-body", day.closed ? "text-charcoal-400" : "text-charcoal-700 font-medium")}>
                  {d.label}
                </span>
              </label>

              {day.closed ? (
                <span className="text-charcoal-400 text-sm font-body">Fermé</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => set(d.fr, { open: e.target.value })}
                    className="bg-ivory-50 border border-ivory-300 rounded-lg px-2.5 py-1.5 text-charcoal-800 text-sm font-body focus:outline-none focus:border-gold-400"
                  />
                  <span className="text-charcoal-300 text-sm">–</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => set(d.fr, { close: e.target.value })}
                    className="bg-ivory-50 border border-ivory-300 rounded-lg px-2.5 py-1.5 text-charcoal-800 text-sm font-body focus:outline-none focus:border-gold-400"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-3 text-red-500 text-xs font-body">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white text-sm font-body font-medium transition-colors disabled:opacity-40"
        >
          {loading ? "Enregistrement…" : "Enregistrer les heures"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-700 text-sm font-body">
            <CheckCircle size={14} className="text-green-600" /> Enregistré
          </span>
        )}
      </div>
    </section>
  )
}
