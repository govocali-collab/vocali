"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { formatShortDate } from "@/lib/utils"

type Invoice = {
  id: string
  number: string
  amount: number
  currency: string
  created: number
  period_start: number | null
  period_end: number | null
  hosted_invoice_url: string | null
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function getPeriod(start: number | null, end: number | null): string {
  if (!start) return "—"
  const d = new Date(start * 1000)
  const label = d.toLocaleDateString("fr-CA", { month: "long", year: "numeric" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function BillingTable({ invoices }: { invoices: Invoice[] }) {
  const [downloading, setDownloading] = useState<string | null>(null)

  async function downloadReceipt(invoiceId: string, invoiceNumber: string) {
    setDownloading(invoiceId)
    try {
      const res = await fetch(`/api/dashboard/invoices/${invoiceId}`)
      if (!res.ok) throw new Error("Erreur lors du téléchargement")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vocali-recu-${invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(null)
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-ink-card rounded-xl border border-ivory-300 text-center">
        <p className="text-charcoal-400 font-body text-base">Aucun paiement pour l'instant.</p>
        <p className="text-charcoal-300 font-body text-sm mt-1">
          Vos reçus mensuels apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-ivory-300 overflow-hidden bg-ink-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ivory-200 bg-ivory-50">
              {["Période", "Reçu", "Montant", "Date", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-charcoal-400 text-[11px] font-body font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr
                key={inv.id}
                className={i < invoices.length - 1 ? "border-b border-ivory-200" : ""}
              >
                <td className="px-4 py-3.5 text-charcoal-800 text-sm font-body font-medium">
                  {getPeriod(inv.period_start, inv.period_end)}
                </td>
                <td className="px-4 py-3.5 text-charcoal-400 text-xs font-body font-mono">
                  #{inv.number}
                </td>
                <td className="px-4 py-3.5 text-charcoal-800 text-sm font-body font-semibold">
                  {formatAmount(inv.amount, inv.currency)}
                </td>
                <td className="px-4 py-3.5 text-charcoal-400 text-xs font-body whitespace-nowrap">
                  {formatShortDate(new Date(inv.created * 1000))}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => downloadReceipt(inv.id, inv.number)}
                    disabled={downloading === inv.id}
                    className="inline-flex items-center gap-1.5 text-gold-600 hover:text-gold-700 text-xs font-body font-medium disabled:opacity-50 transition-colors"
                  >
                    {downloading === inv.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    Télécharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
