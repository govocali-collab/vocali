"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Copy, Check, ExternalLink } from "lucide-react"

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-charcoal-600 text-sm font-body font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-charcoal-400 text-xs font-body mt-1">{hint}</p>}
    </div>
  )
}

export default function AdminQuotesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkoutUrl, setCheckoutUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const [clinicName, setClinicName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("Vocali — Secrétaire IA")
  const [billing, setBilling] = useState<"month" | "year">("month")
  const [trial, setTrial] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setCheckoutUrl("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicName, firstName, lastName, email, price: parseFloat(price), description, billing, trial }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setCheckoutUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(checkoutUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <div className="max-w-5xl mx-auto px-5 py-10">

        <div className="mb-8">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={104} height={32} className="mb-4" />
          <Link href="/admin/clinics" className="text-charcoal-400 text-sm hover:text-gold-600 transition-colors mb-4 inline-block">
            ← Cliniques
          </Link>
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Nouveau lien de paiement</h1>
          <p className="text-charcoal-500 text-sm mt-1">Crée une facture Stripe et envoie le lien à ta cliente.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-4">Compte cliente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nom de la clinique">
                  <input className={inputClass} value={clinicName} onChange={(e) => setClinicName(e.target.value)} required placeholder="Clinique Dermavia" />
                </Field>
              </div>
              <Field label="Prénom">
                <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Marie" />
              </Field>
              <Field label="Nom">
                <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Tremblay" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Courriel">
                  <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="marie@cliniquedermavia.ca" />
                </Field>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-4">Facturation</p>
            <div className="space-y-4">
              <Field label="Facturation">
                <div className="flex gap-2 mt-0.5">
                  {([["month", "Mensuel"], ["year", "Annuel"]] as const).map(([val, lbl]) => (
                    <label key={val} className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg border text-sm font-body cursor-pointer transition-colors ${billing === val ? "bg-gold-50 border-gold-400 text-gold-700 font-medium" : "bg-white border-ivory-300 text-charcoal-500 hover:border-gold-300"}`}>
                      <input type="radio" name="billing" value={val} checked={billing === val} onChange={() => setBilling(val)} className="sr-only" />
                      {lbl}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label={`Prix / ${billing === "month" ? "mois" : "an"} (CAD)`}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm font-body">$</span>
                  <input
                    className={inputClass + " pl-7"}
                    type="number"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder={billing === "month" ? "97.00" : "970.00"}
                  />
                </div>
              </Field>

              <Field label="Description">
                <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Vocali — Secrétaire IA" />
              </Field>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setTrial(!trial)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${trial ? "bg-gold-400" : "bg-ivory-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${trial ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <div>
                  <p className="text-charcoal-700 text-sm font-body font-medium">Essai gratuit de 30 jours</p>
                  <p className="text-charcoal-400 text-xs font-body">Aucun débit pendant 30 jours. Annulation à tout moment.</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient text-white font-body font-semibold text-sm rounded-xl px-6 py-3.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Envoi en cours…" : "Envoyer à la cliente →"}
          </button>
        </form>

        {checkoutUrl && (
          <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="text-green-700 text-sm font-body font-semibold mb-3">Lien de paiement prêt ✓</p>
            <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2.5 mb-3">
              <span className="text-charcoal-600 text-xs font-body truncate flex-1">{checkoutUrl}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 bg-white border border-green-300 text-green-700 font-body font-medium text-sm rounded-lg px-4 py-2 hover:bg-green-50 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copié !" : "Copier"}
              </button>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white border border-green-300 text-green-700 font-body font-medium text-sm rounded-lg px-4 py-2 hover:bg-green-50 transition-colors"
              >
                <ExternalLink size={14} />
                Tester
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
