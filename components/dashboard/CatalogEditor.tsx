"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Tag } from "lucide-react"
import { addCatalogItem, saveCatalogItem, removeCatalogItem } from "@/app/actions/catalog"
import type { CatalogItem, CatalogKind } from "@/lib/supabase/catalog"

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-2 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

export default function CatalogEditor({
  kind,
  title,
  items,
  noun,
}: {
  kind: CatalogKind
  title: string
  items: CatalogItem[]
  noun: string // ex: "service", "formation"
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
        <h2 className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">{title}</h2>
        <span className="text-charcoal-300 text-xs font-body">{rows.length}</span>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`rounded-lg border p-3 ${row.active ? "border-ivory-300 bg-white" : "border-ivory-200 bg-ivory-50 opacity-70"}`}
          >
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={row.name}
                placeholder={`Nom du ${noun}`}
                onChange={(e) => patchLocal(row.id, "name", e.target.value)}
                onBlur={() => persist(row)}
              />
              <input
                className={`${inputClass} w-28 flex-shrink-0`}
                value={row.price ?? ""}
                placeholder="Prix"
                onChange={(e) => patchLocal(row.id, "price", e.target.value)}
                onBlur={() => persist(row)}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <input
                className={`${inputClass} w-32 flex-shrink-0`}
                value={row.duration ?? ""}
                placeholder="Durée"
                onChange={(e) => patchLocal(row.id, "duration", e.target.value)}
                onBlur={() => persist(row)}
              />
              <div className="relative flex-1">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 pointer-events-none" />
                <input
                  className={`${inputClass} pl-8`}
                  value={row.promotion ?? ""}
                  placeholder="Promotion / spécial (optionnel)"
                  onChange={(e) => patchLocal(row.id, "promotion", e.target.value)}
                  onBlur={() => persist(row)}
                />
              </div>
            </div>

            <textarea
              className={`${inputClass} mt-2 min-h-[44px] resize-y`}
              value={row.description ?? ""}
              placeholder="Description (optionnel)"
              onChange={(e) => patchLocal(row.id, "description", e.target.value)}
              onBlur={() => persist(row)}
            />

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-charcoal-500 text-xs font-body cursor-pointer">
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
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="flex items-center gap-1 text-charcoal-400 text-xs font-body hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="text-charcoal-400 text-sm font-body py-2">Aucun {noun} pour le moment.</p>
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
