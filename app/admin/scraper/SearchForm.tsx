"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const BUSINESS_TYPES = [
  "clinique esthétique",
  "médecine esthétique",
  "spa médical",
  "centre de beauté",
  "med spa",
  "autre",
]

const PROVINCES = [
  { value: "QC", label: "Québec" },
  { value: "ON", label: "Ontario" },
  { value: "BC", label: "Colombie-Britannique" },
  { value: "AB", label: "Alberta" },
  { value: "MB", label: "Manitoba" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NS", label: "Nouvelle-Écosse" },
  { value: "NB", label: "Nouveau-Brunswick" },
  { value: "NL", label: "Terre-Neuve-et-Labrador" },
  { value: "PE", label: "Île-du-Prince-Édouard" },
]

export interface SearchParams {
  businessType: string
  city: string
  province: string
  maxResults: number
  language: string
}

interface Props {
  onSearch: (params: SearchParams) => void
  disabled: boolean
}

export default function SearchForm({ onSearch, disabled }: Props) {
  const [businessType, setBusinessType] = useState("clinique esthétique")
  const [customType, setCustomType] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("QC")
  const [maxResults, setMaxResults] = useState(20)
  const [language, setLanguage] = useState("fr")

  const inputClass =
    "w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
  const selectClass =
    "w-full appearance-none border border-ivory-300 rounded-lg pl-3 pr-9 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400 bg-white"
  const labelClass = "block text-xs font-semibold font-body text-charcoal-400 uppercase tracking-widest mb-1.5"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalType = businessType === "autre" ? customType.trim() : businessType
    if (!finalType || !city.trim()) return
    onSearch({
      businessType: finalType,
      city: city.trim(),
      province,
      maxResults,
      language,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Type d'entreprise</label>
          <div className="relative">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {businessType === "autre" && (
            <input
              type="text"
              placeholder="Type personnalisé…"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              disabled={disabled}
              className={cn(inputClass, "mt-2")}
            />
          )}
        </div>

        <div>
          <label className={labelClass}>Ville</label>
          <input
            type="text"
            placeholder="ex. Montréal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={disabled}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Province</label>
          <div className="relative">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              {PROVINCES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Nb de résultats (max 40)</label>
          <input
            type="number"
            min={10}
            max={40}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Langue de recherche</label>
          <div className="relative">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={disabled}
              className={selectClass}
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="both">Les deux</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || !city.trim() || (businessType === "autre" && !customType.trim())}
        className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {disabled ? "Recherche en cours…" : "Lancer la recherche →"}
      </button>
    </form>
  )
}
