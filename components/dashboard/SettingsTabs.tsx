"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type Tab = { key: string; label: string; content: React.ReactNode }

/**
 * Onglets pour la page Paramètres. Tout le contenu est rendu mais masqué quand
 * l'onglet n'est pas actif → l'état des formulaires (saisie en cours) est conservé
 * lors d'un changement d'onglet.
 */
export default function SettingsTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key)

  return (
    <div>
      <div className="flex gap-1 border-b border-ivory-300 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-body font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
              active === t.key
                ? "border-gold-500 text-gold-700"
                : "border-transparent text-charcoal-400 hover:text-charcoal-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div key={t.key} className={active === t.key ? "space-y-4" : "hidden"}>
          {t.content}
        </div>
      ))}
    </div>
  )
}
