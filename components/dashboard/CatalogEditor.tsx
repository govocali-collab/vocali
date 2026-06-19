"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Search } from "lucide-react"
import { addCatalogItem, saveCatalogItem, removeCatalogItem } from "@/app/actions/catalog"
import type { CatalogItem, CatalogKind } from "@/lib/supabase/catalog"

const cell =
  "bg-ivory-50 border border-ivory-300 rounded-lg px-2.5 py-1.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

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
  const [query, setQuery] = useState("")
  const [pending, startTransition] = useTransition()

  function patchLocal(id: string, field: keyof CatalogItem, value: string | boolean) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)))
  }

  function persist(id: string) {
    const row = rows.find((r) => r.id === id)
    if (!row) return
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
      if (created) {
        setRows((r) => [created, ...r])
        setQuery("")
      }
    })
  }

  function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id))
    startTransition(async () => {
      await removeCatalogItem(id)
    })
  }

  const q = query.trim().toLowerCase()
  const filtered = q
    ? rows.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q),
      )
    : rows

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-charcoal-700 font-body font-semibold">
          {title} <span className="text-charcoal-300 font-normal">· {rows.length}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-300 pointer-events-none" />
            <input
              className={`${cell} pl-8 w-56`}
              placeholder={`Rechercher un ${noun}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-gold-700 bg-gold-50 border border-gold-200 hover:bg-gold-100 disabled:opacity-50 font-body font-medium text-sm rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* En-têtes de colonnes */}
      <div className="hidden md:flex items-center gap-2 px-1 pb-1.5 text-charcoal-400 text-[11px] font-body uppercase tracking-wide">
        <span className="w-5" />
        <span className="flex-[2] min-w-0">Nom</span>
        <span className="flex-[3] min-w-0">Description</span>
        <span className="w-24">Prix</span>
        <span className="w-24">Durée</span>
        <span className="w-32">Promotion</span>
        <span className="w-6" />
      </div>

      <div className="divide-y divide-ivory-200">
        {filtered.map((row) => (
          <div
            key={row.id}
            className={`flex flex-wrap md:flex-nowrap items-center gap-2 py-2 ${row.active ? "" : "opacity-50"}`}
          >
            <input
              type="checkbox"
              checked={row.active}
              title="Actif"
              onChange={(e) => {
                patchLocal(row.id, "active", e.target.checked)
                startTransition(async () => {
                  await saveCatalogItem(row.id, { active: e.target.checked })
                })
              }}
              className="w-4 h-4 accent-amber-600 flex-shrink-0"
            />
            <input
              className={`${cell} flex-[2] min-w-[140px] font-medium`}
              value={row.name}
              placeholder={`Nom du ${noun}`}
              onChange={(e) => patchLocal(row.id, "name", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <input
              className={`${cell} flex-[3] min-w-[160px]`}
              value={row.description ?? ""}
              placeholder="Description"
              onChange={(e) => patchLocal(row.id, "description", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <input
              className={`${cell} w-24`}
              value={row.price ?? ""}
              placeholder="Prix"
              onChange={(e) => patchLocal(row.id, "price", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <input
              className={`${cell} w-24`}
              value={row.duration ?? ""}
              placeholder="Durée"
              onChange={(e) => patchLocal(row.id, "duration", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <input
              className={`${cell} w-32 bg-gold-50/50 border-gold-200`}
              value={row.promotion ?? ""}
              placeholder="Promo"
              onChange={(e) => patchLocal(row.id, "promotion", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <button
              type="button"
              onClick={() => remove(row.id)}
              title="Supprimer"
              className="text-charcoal-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-charcoal-400 text-sm font-body py-6 text-center">
            {q ? `Aucun ${noun} ne correspond à « ${query} ».` : `Aucun ${noun} pour le moment.`}
          </p>
        )}
      </div>
    </section>
  )
}
