"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2 } from "lucide-react"
import { addCatalogItem, saveCatalogItem, removeCatalogItem } from "@/app/actions/catalog"
import type { CatalogItem, CatalogKind } from "@/lib/supabase/catalog"

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-2 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-charcoal-400 text-[11px] font-body font-medium uppercase tracking-wide mb-1">{children}</span>
}

export default function CatalogEditor({
  kind,
  title,
  items,
  noun,
}: {
  kind: CatalogKind
  title: string
  items: CatalogItem[]
  noun: string
}) {
  const [rows, setRows] = useState<CatalogItem[]>(items)
  const [pending, startTransition] = useTransition()

  function patchLocal(id: string, field: keyof CatalogItem, value: string | boolean) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)))
  }

  function persist(row: CatalogItem) {
    startTransition(async () => {
      await saveCatalogItem(row.id, {
        name: row.name,
        description: row.description,
        price: row.price,
        promotion: row.promotion,
        duration: row.duration,
        active: row.active,
      })
    })
  }

  function add() {
    startTransition(async () => {
      const created = await addCatalogItem(kind)
      if (created) setRows((r) => [...r, created])
    })
  }

  function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id))
    startTransition(async () => {
      await removeCatalogItem(id)
    })
  }

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-charcoal-700 font-body font-semibold">{title}</h2>
        <span className="text-charcoal-400 text-xs font-body bg-ivory-100 border border-ivory-200 rounded-full px-2 py-0.5">
          {rows.length}
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`rounded-xl border p-4 transition-colors ${
              row.active ? "border-ivory-300 bg-white" : "border-ivory-200 bg-ivory-50/60"
            }`}
          >
            {/* Nom + actif */}
            <div className="flex items-center gap-3">
              <input
                className="flex-1 min-w-0 bg-transparent border-0 border-b border-transparent hover:border-ivory-300 focus:border-gold-400 px-0 py-1 text-charcoal-900 text-base font-body font-semibold placeholder-charcoal-300 focus:outline-none transition-colors"
                value={row.name}
                placeholder={`Nom du ${noun}`}
                onChange={(e) => patchLocal(row.id, "name", e.target.value)}
                onBlur={() => persist(row)}
              />
              <label className="flex items-center gap-1.5 text-charcoal-500 text-xs font-body cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(e) => {
                    patchLocal(row.id, "active", e.target.checked)
                    startTransition(async () => {
                      await saveCatalogItem(row.id, { active: e.target.checked })
                    })
                  }}
                  className="w-3.5 h-3.5 accent-amber-600"
                />
                Actif
              </label>
            </div>

            {/* Prix + Durée */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <FieldLabel>Prix</FieldLabel>
                <input
                  className={inputClass}
                  value={row.price ?? ""}
                  placeholder="ex : 120 $"
                  onChange={(e) => patchLocal(row.id, "price", e.target.value)}
                  onBlur={() => persist(row)}
                />
              </div>
              <div>
                <FieldLabel>Durée</FieldLabel>
                <input
                  className={inputClass}
                  value={row.duration ?? ""}
                  placeholder="ex : 60 min"
                  onChange={(e) => patchLocal(row.id, "duration", e.target.value)}
                  onBlur={() => persist(row)}
                />
              </div>
            </div>

            {/* Promotion */}
            <div className="mt-3">
              <FieldLabel>Promotion / spécial</FieldLabel>
              <input
                className={`${inputClass} bg-gold-50/50 border-gold-200 placeholder-gold-400/70`}
                value={row.promotion ?? ""}
                placeholder="ex : -20 % ce mois-ci (optionnel)"
                onChange={(e) => patchLocal(row.id, "promotion", e.target.value)}
                onBlur={() => persist(row)}
              />
            </div>

            {/* Description */}
            <div className="mt-3">
              <FieldLabel>Description</FieldLabel>
              <textarea
                className={`${inputClass} min-h-[52px] resize-y`}
                value={row.description ?? ""}
                placeholder="Quelques mots sur ce que ça inclut (optionnel)"
                onChange={(e) => patchLocal(row.id, "description", e.target.value)}
                onBlur={() => persist(row)}
              />
            </div>

            {/* Supprimer */}
            <div className="flex justify-end mt-3 pt-3 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="inline-flex items-center gap-1.5 text-charcoal-400 text-xs font-body hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-8 border border-dashed border-ivory-300 rounded-xl">
            <p className="text-charcoal-400 text-sm font-body">Aucun {noun} pour le moment.</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={pending}
        className="mt-4 inline-flex items-center gap-1.5 text-gold-700 bg-gold-50 border border-gold-200 hover:bg-gold-100 disabled:opacity-50 font-body font-medium text-sm rounded-lg px-4 py-2 transition-colors"
      >
        <Plus size={15} /> Ajouter un {noun}
      </button>
    </section>
  )
}
