"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { updateOwnerInfo } from "@/app/actions/settings"

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ""
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-3.5 py-2 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

type Props = {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export default function OwnerForm({ firstName, lastName, phone, email }: Props) {
  const [first, setFirst] = useState(firstName)
  const [last, setLast] = useState(lastName)
  const [tel, setTel] = useState(formatPhone(phone))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function save() {
    setSaving(true)
    setError("")
    try {
      await updateOwnerInfo({ firstName: first, lastName: last, phone: tel })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <h2 className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider mb-4">
        Propriétaire
      </h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-charcoal-400 text-xs font-body mb-1.5">Prénom</label>
            <input
              className={inputClass}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              placeholder="Prénom"
            />
          </div>
          <div>
            <label className="block text-charcoal-400 text-xs font-body mb-1.5">Nom</label>
            <input
              className={inputClass}
              value={last}
              onChange={(e) => setLast(e.target.value)}
              placeholder="Nom de famille"
            />
          </div>
        </div>

        <div>
          <label className="block text-charcoal-400 text-xs font-body mb-1.5">Téléphone</label>
          <input
            className={inputClass}
            value={tel}
            onChange={(e) => setTel(formatPhone(e.target.value))}
            placeholder="(514) 000-0000"
            type="tel"
          />
        </div>

        <div>
          <label className="block text-charcoal-400 text-xs font-body mb-1.5">Courriel</label>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-ivory-100 border border-ivory-200">
            <Mail size={13} className="text-charcoal-300 flex-shrink-0" />
            <span className="text-charcoal-500 text-sm font-body">{email}</span>
          </div>
          <p className="text-charcoal-300 text-xs font-body mt-1">
            Pour modifier le courriel, contactez{" "}
            <a href="mailto:support@vocali.ca" className="text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors">
              support@vocali.ca
            </a>
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-red-500 text-xs font-body">{error}</p>
      )}

      <div className="mt-4 pt-4 border-t border-ivory-200">
        <button
          onClick={save}
          disabled={saving}
          className="bg-gold-gradient text-white font-body font-semibold text-sm rounded-lg px-5 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Sauvegarde…" : saved ? "✓ Sauvegardé" : "Sauvegarder"}
        </button>
      </div>
    </section>
  )
}
