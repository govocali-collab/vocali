"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn, formatShortDate } from "@/lib/utils"
import TranscriptPanel from "./TranscriptPanel"
import type { Lead, LeadStatus } from "@/lib/supabase/dashboard"
import { AlertCircle, ChevronRight } from "lucide-react"

const STATUS_STYLES: Record<LeadStatus, string> = {
  nouveau: "text-blue-600 bg-blue-50 border-blue-200",
  contacté: "text-amber-600 bg-amber-50 border-amber-200",
  confirmé: "text-green-600 bg-green-50 border-green-200",
  annulé: "text-red-600 bg-red-50 border-red-200",
}

interface Props {
  leads: Lead[]
  followUpLeads: Lead[]
  services: string[]
}

export default function LeadsTable({ leads, followUpLeads, services }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [, startTransition] = useTransition()

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.replace(`/dashboard/leads?${next.toString()}`))
  }

  return (
    <>
      {followUpLeads.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-gold-600" />
            <h3 className="text-gold-700 text-sm font-body font-semibold">
              À suivre ({followUpLeads.length})
            </h3>
            <span className="text-charcoal-400 text-xs font-body">— sans réponse depuis +24h</span>
          </div>
          <div className="rounded-xl border border-gold-200 bg-gold-50 overflow-hidden">
            {followUpLeads.map((lead, i) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gold-100 transition-colors",
                  i < followUpLeads.length - 1 && "border-b border-gold-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  <span className="text-charcoal-800 text-sm font-body">
                    {lead.first_name} {lead.last_name}
                  </span>
                  {lead.service && (
                    <span className="text-charcoal-400 text-xs font-body hidden sm:block">
                      {lead.service}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-charcoal-400 text-xs font-body hidden sm:block">
                    {formatShortDate(lead.created_at)}
                  </span>
                  <ChevronRight size={14} className="text-charcoal-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          defaultValue={params.get("from") ?? ""}
          onChange={(e) => updateParam("from", e.target.value)}
          className="bg-ink-card border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-700 text-sm font-body focus:outline-none focus:border-gold-400 pr-8"
        />
        <input
          type="date"
          defaultValue={params.get("to") ?? ""}
          onChange={(e) => updateParam("to", e.target.value)}
          className="bg-ink-card border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-700 text-sm font-body focus:outline-none focus:border-gold-400 pr-8"
        />
        {services.length > 0 && (
          <div className="relative">
            <select
              defaultValue={params.get("service") ?? ""}
              onChange={(e) => updateParam("service", e.target.value)}
              className="appearance-none bg-ink-card border border-ivory-300 rounded-lg pl-4 pr-10 py-2.5 text-charcoal-700 text-sm font-body focus:outline-none focus:border-gold-400"
            >
              <option value="">Tous les services</option>
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        )}
        <div className="relative">
          <select
            defaultValue={params.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="appearance-none bg-ink-card border border-ivory-300 rounded-lg pl-4 pr-10 py-2.5 text-charcoal-700 text-sm font-body focus:outline-none focus:border-gold-400"
          >
            <option value="">Tous les statuts</option>
            <option value="nouveau">Nouveau</option>
            <option value="contacté">Contacté</option>
            <option value="confirmé">Confirmé</option>
            <option value="annulé">Annulé</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-ink-card rounded-xl border border-ivory-300">
          <p className="text-charcoal-400 text-base font-body">Aucun lead pour cette période.</p>
          <p className="text-charcoal-300 text-sm font-body mt-1">
            Les nouveaux leads apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-ivory-300 overflow-hidden bg-ink-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ivory-200 bg-ivory-50">
                  {["Nom", "Service", "Préférence RDV", "Statut", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-charcoal-400 text-[11px] font-body font-medium uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-ivory-100",
                      i < leads.length - 1 && "border-b border-ivory-200"
                    )}
                  >
                    <td className="px-4 py-3.5 text-charcoal-800 text-sm font-body font-medium whitespace-nowrap">
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td className="px-4 py-3.5 text-charcoal-500 text-sm font-body">
                      {lead.service ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-charcoal-500 text-sm font-body">
                      {lead.appointment_preference ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-body border", STATUS_STYLES[lead.status])}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-charcoal-400 text-xs font-body whitespace-nowrap">
                      {formatShortDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRight size={14} className="text-charcoal-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TranscriptPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}
