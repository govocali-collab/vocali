"use client"

import { useState, useTransition } from "react"
import { Upload, FileSpreadsheet, Check } from "lucide-react"
import { importCatalogItems } from "@/app/actions/catalog"
import type { CatalogKind } from "@/lib/supabase/catalog"

type Mapping = { name: number; price: number; description: number; duration: number; promotion: number; kind: number }

const FIELDS: { key: keyof Mapping; label: string; required?: boolean }[] = [
  { key: "name", label: "Nom", required: true },
  { key: "price", label: "Prix" },
  { key: "duration", label: "Durée" },
  { key: "promotion", label: "Promotion" },
  { key: "description", label: "Description" },
  { key: "kind", label: "Type (service/formation/produit)" },
]

const selectClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-2 text-charcoal-900 text-sm font-body focus:outline-none focus:border-gold-400"

export default function CsvImporter() {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Mapping>({ name: -1, price: -1, description: -1, duration: -1, promotion: -1, kind: -1 })
  const [defaultKind, setDefaultKind] = useState<CatalogKind>("service")
  const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError("")
    setResult(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || "")
        const parsed = parseCsv(text)
        if (parsed.length < 2) throw new Error("Le fichier semble vide ou sans données.")
        const hdr = parsed[0].map((h) => h.trim())
        setHeaders(hdr)
        setRows(parsed.slice(1))
        setMapping(guessMapping(hdr))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fichier illisible")
      }
    }
    reader.readAsText(file)
  }

  function buildItems() {
    const get = (r: string[], idx: number) => (idx >= 0 ? (r[idx] ?? "").trim() : "")
    return rows
      .map((r) => {
        let kind: CatalogKind = defaultKind
        if (mapping.kind >= 0) {
          const k = get(r, mapping.kind).toLowerCase()
          if (k.includes("format")) kind = "formation"
          else if (k.includes("produit") || k.includes("product")) kind = "produit"
          else if (k.includes("service") || k.includes("soin")) kind = "service"
        }
        return {
          kind,
          name: get(r, mapping.name),
          price: get(r, mapping.price),
          duration: get(r, mapping.duration),
          promotion: get(r, mapping.promotion),
          description: get(r, mapping.description),
        }
      })
      .filter((i) => i.name)
  }

  function doImport() {
    setError("")
    if (mapping.name < 0) {
      setError("Mappe au moins la colonne « Nom ».")
      return
    }
    const items = buildItems()
    if (items.length === 0) {
      setError("Aucune ligne avec un nom à importer.")
      return
    }
    startTransition(async () => {
      try {
        const res = await importCatalogItems(items)
        setResult(res)
        setHeaders([])
        setRows([])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur à l'import")
      }
    })
  }

  const previewItems = headers.length ? buildItems().slice(0, 4) : []

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <FileSpreadsheet size={15} className="text-gold-600" />
        <h2 className="text-charcoal-700 font-body font-semibold">Importer depuis un fichier CSV</h2>
      </div>
      <p className="text-charcoal-400 text-xs font-body mb-4">
        Importe une grille de prix / liste de services. Les noms déjà présents seront mis à jour (ex : ajout des prix).
      </p>

      {headers.length === 0 ? (
        <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-ivory-300 rounded-xl cursor-pointer hover:border-gold-300 transition-colors">
          <Upload size={20} className="text-charcoal-400" />
          <span className="text-charcoal-500 text-sm font-body">Choisir un fichier .csv</span>
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
        </label>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-charcoal-500 text-xs font-body mb-2">
              Associe les colonnes de ton fichier ({rows.length} lignes) aux champs :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FIELDS.map((f) => (
                <label key={f.key} className="text-xs font-body text-charcoal-500">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                  <select
                    className={selectClass}
                    value={mapping[f.key]}
                    onChange={(e) => setMapping((m) => ({ ...m, [f.key]: Number(e.target.value) }))}
                  >
                    <option value={-1}>— ignorer —</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h || `Colonne ${i + 1}`}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          {mapping.kind < 0 && (
            <label className="text-xs font-body text-charcoal-500 block">
              Type par défaut (si pas de colonne « Type »)
              <select className={selectClass} value={defaultKind} onChange={(e) => setDefaultKind(e.target.value as CatalogKind)}>
                <option value="service">Services</option>
                <option value="formation">Formations</option>
                <option value="produit">Produits</option>
              </select>
            </label>
          )}

          {previewItems.length > 0 && (
            <div className="border border-ivory-200 rounded-lg overflow-hidden">
              <div className="bg-ivory-100 px-3 py-1.5 text-charcoal-400 text-[11px] font-body uppercase tracking-wide">Aperçu</div>
              <div className="divide-y divide-ivory-200">
                {previewItems.map((it, i) => (
                  <div key={i} className="px-3 py-2 text-sm font-body flex justify-between gap-3">
                    <span className="text-charcoal-800 truncate">
                      {it.name} <span className="text-charcoal-300">· {it.kind}</span>
                    </span>
                    <span className="text-gold-700 flex-shrink-0">{it.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={doImport}
              disabled={pending}
              className="bg-gold-gradient text-white font-body font-semibold text-sm rounded-lg px-5 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pending ? "Import…" : `Importer ${buildItems().length} éléments`}
            </button>
            <button
              type="button"
              onClick={() => { setHeaders([]); setRows([]); setError("") }}
              className="text-charcoal-400 text-sm font-body hover:text-charcoal-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-red-500 text-sm font-body">{error}</p>}
      {result && (
        <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-body">
          <Check size={15} /> {result.inserted} ajoutés · {result.updated} mis à jour. Rafraîchis pour voir le catalogue.
        </div>
      )}
    </section>
  )
}

// --- Parseur CSV (gère guillemets, délimiteur , ; ou tab) ---
function parseCsv(text: string): string[][] {
  const delim = pickDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === delim) { row.push(field); field = "" }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = "" }
      else if (c === "\r") { /* ignore */ }
      else field += c
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

function pickDelimiter(text: string): string {
  const first = (text.split(/\r?\n/)[0] || "")
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 }
  for (const ch of first) if (ch in counts) counts[ch]++
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return best && best[1] > 0 ? best[0] : ","
}

function guessMapping(headers: string[]): Mapping {
  const m: Mapping = { name: -1, price: -1, description: -1, duration: -1, promotion: -1, kind: -1 }
  const tests: { key: keyof Mapping; re: RegExp }[] = [
    { key: "name", re: /nom|name|service|produit|titre|item|désignation|designation|libell/i },
    { key: "price", re: /prix|price|tarif|montant|co[ûu]t|cost/i },
    { key: "duration", re: /dur[ée]e|duration|temps|minutes/i },
    { key: "promotion", re: /promo|sp[ée]cial|special|rabais|offre/i },
    { key: "description", re: /desc/i },
    { key: "kind", re: /type|cat[ée]gorie|category|kind/i },
  ]
  headers.forEach((h, i) => {
    for (const t of tests) {
      if (m[t.key] === -1 && t.re.test(h)) m[t.key] = i
    }
  })
  return m
}
