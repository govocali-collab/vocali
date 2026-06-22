"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, UploadCloud, CheckCircle } from "lucide-react"
import {
  adminAddCatalogItem,
  adminSaveCatalogItem,
  adminRemoveCatalogItem,
  adminPublishCatalog,
} from "@/app/actions/admin"
import type { CatalogItem, CatalogKind } from "@/lib/supabase/catalog"

const cell =
  "bg-ivory-50 border border-ivory-300 rounded-lg px-2.5 py-1.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

function Editor({
  clinicId,
  kind,
  noun,
  initial,
}: {
  clinicId: string
  kind: CatalogKind
  noun: string
  initial: CatalogItem[]
}) {
  const [rows, setRows] = useState<CatalogItem[]>(initial)
  const [pending, startTransition] = useTransition()
  const [pushed, setPushed] = useState("")

  const draftCount = rows.filter((r) => !r.published).length

  function patchLocal(id: string, field: keyof CatalogItem, value: string) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)))
    setPushed("")
  }

  function persist(id: string) {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    startTransition(async () => {
      await adminSaveCatalogItem(clinicId, row.id, {
        name: row.name,
        description: row.description,
        price: row.price,
        promotion: row.promotion,
        duration: row.duration,
      })
    })
  }

  function add() {
    startTransition(async () => {
      const created = await adminAddCatalogItem(clinicId, kind)
      if (created) setRows((r) => [created, ...r])
      setPushed("")
    })
  }

  function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id))
    startTransition(async () => {
      await adminRemoveCatalogItem(clinicId, id)
    })
  }

  function push() {
    startTransition(async () => {
      const n = await adminPublishCatalog(clinicId, kind)
      setRows((r) => r.map((x) => ({ ...x, published: true })))
      setPushed(`${n} ${noun}${n > 1 ? "s" : ""} publié${n > 1 ? "s" : ""} — maintenant visible par la cliente.`)
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-charcoal-700 font-body font-semibold">
          {rows.length} {noun}{rows.length > 1 ? "s" : ""}
          {draftCount > 0 && (
            <span className="text-amber-600 font-normal"> · {draftCount} brouillon{draftCount > 1 ? "s" : ""}</span>
          )}
        </p>
        <button
          type="button"
          onClick={add}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-gold-700 bg-gold-50 border border-gold-200 hover:bg-gold-100 disabled:opacity-50 font-body font-medium text-sm rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
        >
          <Plus size={15} /> Ajouter un {noun}
        </button>
      </div>

      {/* Barre de publication */}
      {draftCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-amber-700 text-sm font-body">
            {draftCount} {noun}{draftCount > 1 ? "s" : ""} en brouillon — invisible{draftCount > 1 ? "s" : ""} pour la cliente jusqu'à publication.
          </p>
          <button
            type="button"
            onClick={push}
            disabled={pending}
            className="inline-flex items-center gap-1.5 bg-gold-gradient text-white font-body font-semibold text-sm rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            <UploadCloud size={15} /> Pousser vers la cliente
          </button>
        </div>
      ) : pushed ? (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-body">{pushed}</p>
        </div>
      ) : null}

      {/* En-têtes */}
      <div className="hidden md:flex items-center gap-2 px-1 pb-1.5 text-charcoal-400 text-[11px] font-body uppercase tracking-wide">
        <span className="w-20">Statut</span>
        <span className="flex-[2] min-w-0">Nom</span>
        <span className="flex-[3] min-w-0">Description</span>
        <span className="w-20">Prix</span>
        <span className="w-20">Durée</span>
        <span className="w-28">Promotion</span>
        <span className="w-6" />
      </div>

      <div className="divide-y divide-ivory-200">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap md:flex-nowrap items-center gap-2 py-2">
            <span
              className={`w-20 flex-shrink-0 text-center text-[11px] font-body font-medium rounded-full px-2 py-0.5 border ${
                row.published
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              {row.published ? "Publié" : "Brouillon"}
            </span>
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
              className={`${cell} w-20`}
              value={row.price ?? ""}
              placeholder="Prix"
              onChange={(e) => patchLocal(row.id, "price", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <input
              className={`${cell} w-20`}
              value={row.duration ?? ""}
              placeholder="Durée"
              onChange={(e) => patchLocal(row.id, "duration", e.target.value)}
              onBlur={() => persist(row.id)}
            />
            <input
              className={`${cell} w-28 bg-gold-50/50 border-gold-200`}
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

        {rows.length === 0 && (
          <p className="text-charcoal-400 text-sm font-body py-6 text-center">
            Aucun {noun} pour le moment. Cliquez sur « Ajouter un {noun} ».
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminCatalogManager({
  clinicId,
  offersTrainings,
  services,
  formations,
}: {
  clinicId: string
  offersTrainings: boolean
  services: CatalogItem[]
  formations: CatalogItem[]
}) {
  const [tab, setTab] = useState<CatalogKind>("service")

  const tabs: { key: CatalogKind; label: string }[] = [
    { key: "service", label: "Services" },
    ...(offersTrainings ? [{ key: "formation" as CatalogKind, label: "Formations" }] : []),
  ]

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <h2 className="text-charcoal-900 font-body font-semibold mb-1">Catalogue</h2>
      <p className="text-charcoal-400 text-sm font-body mb-4">
        Ajoutez des services et formations en brouillon, puis publiez-les vers la cliente.
      </p>

      <div className="flex gap-1 border-b border-ivory-300 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-body font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              tab === t.key
                ? "border-gold-500 text-gold-700"
                : "border-transparent text-charcoal-400 hover:text-charcoal-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "service" ? "" : "hidden"}>
        <Editor clinicId={clinicId} kind="service" noun="service" initial={services} />
      </div>
      {offersTrainings && (
        <div className={tab === "formation" ? "" : "hidden"}>
          <Editor clinicId={clinicId} kind="formation" noun="formation" initial={formations} />
        </div>
      )}
    </section>
  )
}
