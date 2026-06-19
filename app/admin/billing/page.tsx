"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, ExternalLink, Download, Plus, Loader2 } from "lucide-react"

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

const statusConfig: Record<string, { label: string; className: string }> = {
  paid:   { label: "Payée",     className: "bg-green-50 text-green-700 border-green-200" },
  open:   { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  void:   { label: "Annulée",   className: "bg-ivory-100 text-charcoal-400 border-ivory-300" },
  draft:  { label: "Brouillon", className: "bg-ivory-100 text-charcoal-400 border-ivory-300" },
  uncollectible: { label: "Irrécouvrable", className: "bg-red-50 text-red-600 border-red-200" },
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("fr-CA", {
    year: "numeric", month: "short", day: "numeric",
  })
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency", currency,
  }).format(amount)
}

export default function AdminBillingPage() {
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

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <div className="max-w-5xl mx-auto px-5 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Facturation</h1>
            <p className="text-charcoal-500 text-sm mt-1">Historique des paiements Stripe</p>
          </div>
          <Link
            href="/admin/quotes"
            className="flex items-center gap-2 bg-gold-gradient text-white font-body font-semibold text-sm rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Nouveau lien
          </Link>
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
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-body">Chargement…</span>
            </div>
          )}

          {error && (
            <div className="py-10 text-center text-red-500 text-sm font-body">{error}</div>
          )}

          {!loading && !error && invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-charcoal-400">
              <FileText size={28} className="text-ivory-400" />
              <p className="text-sm font-body">Aucune facture trouvée</p>
            </div>
          )}

          {!loading && !error && invoices.length > 0 && (
            <table className="w-full text-sm font-body">
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {inv.hostedUrl && (
                            <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer" title="Voir le reçu" className="text-charcoal-400 hover:text-gold-600 transition-colors">
                              <ExternalLink size={15} />
                            </a>
                          )}
                          {inv.pdfUrl && (
                            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" title="Télécharger PDF" className="text-charcoal-400 hover:text-gold-600 transition-colors">
                              <Download size={15} />
                            </a>
                          )}
                          {!inv.hostedUrl && !inv.pdfUrl && (
                            <span className="text-charcoal-300 text-xs">—</span>
                          )}
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
