"use client"

import { useEffect, useState } from "react"
import { FileText, ExternalLink, Download, Loader2, Check, Copy, Send } from "lucide-react"

type Invoice = {
  id: string
  number: string | null
  clinicName: string
  email: string
  amount: number
  currency: string
  status: string | null
  created: number
  hostedUrl: string | null
  pdfUrl: string | null
}

// Les deux forfaits Vocali (prix mensuels réguliers, modifiables au besoin).
const PLANS = [
  {
    key: "essentiel",
    name: "Vocali Essentiel",
    price: 247,
    tagline: "Jusqu'à 60 appels / mois",
    desc: "Vocali Essentiel — réceptionniste IA (jusqu'à 60 appels par mois)",
    productId: "prod_UkfmoPOlzPxMIJ",
  },
  {
    key: "illimite",
    name: "Vocali Illimité",
    price: 497,
    tagline: "Appels illimités · recommandé",
    desc: "Vocali Illimité — réceptionniste IA (appels illimités)",
    productId: "prod_UkfmaJt73lcY47",
  },
] as const

const statusConfig: Record<string, { label: string; className: string }> = {
  paid:   { label: "Payée",     className: "bg-green-50 text-green-700 border-green-200" },
  open:   { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  void:   { label: "Annulée",   className: "bg-ivory-100 text-charcoal-400 border-ivory-300" },
  draft:  { label: "Brouillon", className: "bg-ivory-100 text-charcoal-400 border-ivory-300" },
  uncollectible: { label: "Irrécouvrable", className: "bg-red-50 text-red-600 border-red-200" },
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" })
}
function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency }).format(amount)
}

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-3.5 py-2.5 text-sm text-charcoal-900 placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

export default function AdminBillingPage() {
  // ---- Historique ----
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error)
        setInvoices(data.invoices)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const paid = invoices.filter((i) => i.status === "paid")
  const totalPaid = paid.reduce((sum, i) => sum + i.amount, 0)

  // ---- Création de facture ----
  const [plan, setPlan] = useState<string>("essentiel")
  const [clinicName, setClinicName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [price, setPrice] = useState("247")
  const [billing, setBilling] = useState<"month" | "year">("month")
  const [trial, setTrial] = useState(true)
  const [founderRate, setFounderRate] = useState(false)
  const [preview, setPreview] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [checkoutUrl, setCheckoutUrl] = useState("")
  const [copied, setCopied] = useState(false)

  function selectPlan(p: (typeof PLANS)[number]) {
    setPlan(p.key)
    setPrice(String(p.price))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    setPreview(true)
  }

  async function handleConfirm() {
    setCreateError("")
    setCheckoutUrl("")
    setCreating(true)
    try {
      const selected = PLANS.find((p) => p.key === plan) ?? PLANS[0]
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName,
          firstName,
          lastName,
          email,
          price: parseFloat(price),
          description: selected.desc,
          productId: selected.productId,
          billing,
          trial,
          founderRate,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setCheckoutUrl(data.url)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setCreating(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(checkoutUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Facturation</h1>
          <p className="text-charcoal-500 text-sm mt-1">Crée une facture et envoie-la par courriel · suivi des paiements</p>
        </div>

        {/* ============ Créer une facture ============ */}
        <section className="bg-white rounded-xl border border-ivory-300 shadow-card p-6 mb-8">
          <h2 className="text-charcoal-900 font-display text-lg font-semibold mb-1">Créer une facture</h2>
          <p className="text-charcoal-500 text-sm mb-5">Choisis un forfait, remplis les infos de la cliente, et envoie le lien Stripe par courriel.</p>

          {checkoutUrl ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                <Check size={16} /> Facture créée et envoyée à {email}
              </div>
              <div className="flex items-center gap-2">
                <input readOnly value={checkoutUrl} className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-xs text-charcoal-600" />
                <button onClick={copyLink} className="flex items-center gap-1.5 bg-white border border-green-200 text-green-700 text-xs font-medium px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <button onClick={() => { setCheckoutUrl(""); setPreview(false); setClinicName(""); setFirstName(""); setLastName(""); setEmail("") }} className="mt-4 text-sm text-charcoal-500 hover:text-gold-600 transition-colors">
                ← Créer une autre facture
              </button>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest">Aperçu avant envoi</p>
              <div className="rounded-xl border border-ivory-200 bg-ivory-50 divide-y divide-ivory-200">
                {[
                  ["Cliente", `${firstName} ${lastName}`.trim() || "—"],
                  ["Clinique", clinicName || "—"],
                  ["Courriel", email],
                  ["Forfait", (PLANS.find((p) => p.key === plan) ?? PLANS[0]).name],
                  [
                    "Prix",
                    founderRate
                      ? `${formatAmount(parseFloat(price) / 2, "CAD")} / ${billing === "month" ? "mois" : "an"} les 3 premiers mois, puis ${formatAmount(parseFloat(price), "CAD")} / ${billing === "month" ? "mois" : "an"}`
                      : `${formatAmount(parseFloat(price), "CAD")} / ${billing === "month" ? "mois" : "an"}`,
                  ],
                  ["Option", founderRate ? "Tarif fondateur (50 % × 3 mois)" : trial ? "Essai gratuit 30 jours" : "Aucune"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                    <span className="text-charcoal-400 text-sm">{label}</span>
                    <span className="text-charcoal-800 text-sm font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-charcoal-500 text-sm">
                Un courriel avec le lien de paiement sécurisé sera envoyé à <strong className="text-charcoal-800">{email}</strong>.
              </p>

              {createError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>}

              <div className="flex items-center gap-3">
                <button onClick={() => setPreview(false)} disabled={creating} className="text-sm text-charcoal-500 hover:text-gold-600 transition-colors px-3 py-2.5">
                  ← Modifier
                </button>
                <button onClick={handleConfirm} disabled={creating} className="flex items-center justify-center gap-2 bg-gold-gradient disabled:opacity-60 text-white font-semibold text-sm rounded-lg px-6 py-3 hover:opacity-90 transition-opacity">
                  {creating ? <><Loader2 size={15} className="animate-spin" /> Envoi…</> : <><Send size={15} /> Confirmer et envoyer par courriel</>}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Forfaits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANS.map((p) => (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => selectPlan(p)}
                    className={`text-left rounded-xl border p-4 transition-colors ${plan === p.key ? "border-gold-400 bg-gold-50 ring-1 ring-gold-300" : "border-ivory-300 bg-white hover:border-gold-300"}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-semibold text-charcoal-900">{p.name}</span>
                      <span className="font-display font-bold text-charcoal-900">{p.price} $<span className="text-charcoal-400 text-xs font-body font-normal"> /mois</span></span>
                    </div>
                    <p className="text-charcoal-500 text-xs mt-1">{p.tagline}</p>
                  </button>
                ))}
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-charcoal-400 text-xs font-medium mb-1.5">Nom de la clinique</label>
                  <input className={inputClass} value={clinicName} onChange={(e) => setClinicName(e.target.value)} required placeholder="Clinique Dermavia" />
                </div>
                <div>
                  <label className="block text-charcoal-400 text-xs font-medium mb-1.5">Prénom</label>
                  <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Marie" />
                </div>
                <div>
                  <label className="block text-charcoal-400 text-xs font-medium mb-1.5">Nom</label>
                  <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Tremblay" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-charcoal-400 text-xs font-medium mb-1.5">Courriel</label>
                  <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="marie@cliniquedermavia.ca" />
                </div>
              </div>

              {/* Prix + facturation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-charcoal-400 text-xs font-medium mb-1.5">Prix (CAD / {billing === "month" ? "mois" : "an"})</label>
                  <input className={inputClass} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-charcoal-400 text-xs font-medium mb-1.5">Fréquence</label>
                  <div className="flex gap-1.5">
                    {([["month", "Mensuel"], ["year", "Annuel"]] as const).map(([val, lbl]) => (
                      <button type="button" key={val} onClick={() => setBilling(val)} className={`flex-1 px-3 py-2.5 rounded-lg border text-sm transition-colors ${billing === val ? "bg-gold-50 border-gold-400 text-gold-700 font-medium" : "bg-white border-ivory-300 text-charcoal-500 hover:border-gold-300"}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer pb-1">
                  <button type="button" role="switch" aria-checked={trial} onClick={() => { const n = !trial; setTrial(n); if (n) setFounderRate(false) }} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${trial ? "bg-gold-400" : "bg-ivory-300"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${trial ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm text-charcoal-600">Essai 30 jours</span>
                </label>
              </div>

              {/* Tarif fondateur */}
              <div className="rounded-xl border border-ivory-200 bg-ivory-50 p-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <button type="button" role="switch" aria-checked={founderRate} onClick={() => { const n = !founderRate; setFounderRate(n); if (n) setTrial(false) }} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${founderRate ? "bg-gold-400" : "bg-ivory-300"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${founderRate ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm font-medium text-charcoal-700">Tarif fondateur — 50 % les 3 premiers mois</span>
                </label>
                {founderRate && parseFloat(price) > 0 && (
                  <p className="text-xs text-gold-700 mt-2 ml-[54px]">
                    La cliente paiera <strong>{formatAmount(parseFloat(price) / 2, "CAD")}</strong> / {billing === "month" ? "mois" : "an"} pendant 3 mois, puis <strong>{formatAmount(parseFloat(price), "CAD")}</strong> / {billing === "month" ? "mois" : "an"}.
                  </p>
                )}
                {founderRate && trial && (
                  <p className="text-xs text-charcoal-400 mt-1 ml-[54px]">L&apos;essai 30 jours est désactivé avec le tarif fondateur.</p>
                )}
              </div>

              {createError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>}

              <button type="submit" className="flex items-center justify-center gap-2 bg-gold-gradient text-white font-semibold text-sm rounded-lg px-6 py-3 hover:opacity-90 transition-opacity">
                Aperçu de la facture →
              </button>
              <p className="text-charcoal-300 text-xs">Astuce : pour le tarif fondateur des 3 premiers mois, ajuste le prix manuellement (ex. 123,50 $).</p>
            </form>
          )}
        </section>

        {/* ============ Historique de paiement ============ */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-charcoal-900 font-display text-lg font-semibold">Historique de paiement</h2>
        </div>

        {!loading && !error && invoices.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
              <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-1">Factures payées</p>
              <p className="text-charcoal-900 font-display text-2xl font-semibold">{paid.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
              <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-1">Total encaissé</p>
              <p className="text-charcoal-900 font-display text-2xl font-semibold">{formatAmount(totalPaid, "CAD")}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-ivory-300 shadow-card overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-charcoal-400">
              <Loader2 size={18} className="animate-spin" /><span className="text-sm">Chargement…</span>
            </div>
          )}
          {error && <div className="py-10 text-center text-red-500 text-sm">{error}</div>}
          {!loading && !error && invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-charcoal-400">
              <FileText size={28} className="text-ivory-400" /><p className="text-sm">Aucune facture trouvée</p>
            </div>
          )}
          {!loading && !error && invoices.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ivory-200">
                  <th className="text-left text-charcoal-400 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">Clinique</th>
                  <th className="text-left text-charcoal-400 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">Date</th>
                  <th className="text-left text-charcoal-400 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">Montant</th>
                  <th className="text-left text-charcoal-400 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">Statut</th>
                  <th className="text-right text-charcoal-400 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const status = statusConfig[inv.status ?? ""] ?? { label: inv.status ?? "—", className: "bg-ivory-100 text-charcoal-400 border-ivory-300" }
                  return (
                    <tr key={inv.id} className={`border-b border-ivory-100 hover:bg-ivory-50 transition-colors ${i === invoices.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-5 py-4">
                        <p className="text-charcoal-900 font-medium">{inv.clinicName}</p>
                        <p className="text-charcoal-400 text-xs mt-0.5">{inv.email}</p>
                      </td>
                      <td className="px-5 py-4 text-charcoal-600">{formatDate(inv.created)}</td>
                      <td className="px-5 py-4 text-charcoal-900 font-medium">{formatAmount(inv.amount, inv.currency)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {inv.hostedUrl && <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer" title="Voir le reçu" className="text-charcoal-400 hover:text-gold-600 transition-colors"><ExternalLink size={15} /></a>}
                          {inv.pdfUrl && <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" title="Télécharger PDF" className="text-charcoal-400 hover:text-gold-600 transition-colors"><Download size={15} /></a>}
                          {!inv.hostedUrl && !inv.pdfUrl && <span className="text-charcoal-300 text-xs">—</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
