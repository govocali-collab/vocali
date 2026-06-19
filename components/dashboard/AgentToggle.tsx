"use client"

import { useState } from "react"
import { Zap, ZapOff } from "lucide-react"
import { setAgentActive } from "@/app/actions/settings"
import { cn } from "@/lib/utils"

export default function AgentToggle({ agentName, isActive }: { agentName: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")

  async function toggle(newState: boolean) {
    setLoading(true)
    setError("")
    try {
      await setAgentActive(newState)
      setActive(newState)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <section className={cn(
      "rounded-xl border p-5",
      active ? "bg-ink-card border-ivory-300 shadow-card" : "bg-amber-50 border-amber-200"
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            active ? "bg-green-50 border border-green-200" : "bg-amber-100 border border-amber-200"
          )}>
            {active
              ? <Zap size={14} className="text-green-600" />
              : <ZapOff size={14} className="text-amber-600" />
            }
          </div>
          <div>
            <p className="text-charcoal-800 text-sm font-body font-semibold">
              {agentName} — {active ? "Active" : "En pause"}
            </p>
            <p className="text-charcoal-400 text-xs font-body mt-0.5">
              {active
                ? "Répond aux appels entrants 24/7"
                : "Les appels ne sont plus pris en charge"}
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => active ? setShowConfirm(true) : toggle(true)}
            disabled={loading}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors disabled:opacity-50",
              active
                ? "border border-ivory-300 text-charcoal-500 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50"
                : "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {loading ? "…" : active ? "Mettre en pause" : "Réactiver"}
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="text-amber-700 text-xs font-body hidden sm:block">Confirmer la pause ?</p>
            <button
              onClick={() => toggle(false)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-body font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "…" : "Oui, mettre en pause"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-ivory-300 text-charcoal-500 text-xs font-body hover:border-charcoal-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-3 text-red-500 text-xs font-body">{error}</p>
      )}
    </section>
  )
}
