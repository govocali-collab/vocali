"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn, formatShortDate, formatDuration } from "@/lib/utils"
import TranscriptPanel from "./TranscriptPanel"
import type { CallLogWithLead } from "@/lib/supabase/dashboard"
import { Check, X, ChevronRight } from "lucide-react"

interface Props {
  calls: CallLogWithLead[]
}

export default function CallsTable({ calls }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [selectedCall, setSelectedCall] = useState<CallLogWithLead | null>(null)
  const [, startTransition] = useTransition()

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.replace(`/dashboard/calls?${next.toString()}`))
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          defaultValue={params.get("from") ?? ""}
          onChange={(e) => updateParam("from", e.target.value)}
          className="bg-white border border-ivory-300 rounded-lg px-3 py-2 text-charcoal-700 text-sm font-body focus:outline-none focus:border-gold-400"
        />
        <input
          type="date"
          defaultValue={params.get("to") ?? ""}
          onChange={(e) => updateParam("to", e.target.value)}
          className="bg-white border border-ivory-300 rounded-lg px-3 py-2 text-charcoal-700 text-sm font-body focus:outline-none focus:border-gold-400"
        />
      </div>

      {calls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-ivory-300">
          <p className="text-charcoal-400 text-base font-body">Aucun appel pour cette période.</p>
          <p className="text-charcoal-300 text-sm font-body mt-1">
            Les appels de votre agent apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-ivory-300 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ivory-200 bg-ivory-50">
                  {["Date / Heure", "Numéro", "Durée", "Lead capturé", "Langue"].map((h) => (
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
                {calls.map((call, i) => {
                  const hasLead = call.leads && call.leads.length > 0
                  return (
                    <tr
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-ivory-100",
                        i < calls.length - 1 && "border-b border-ivory-200"
                      )}
                    >
                      <td className="px-4 py-3.5 text-charcoal-700 text-sm font-body whitespace-nowrap">
                        {formatShortDate(call.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-500 text-sm font-body font-mono">
                        {call.caller_number}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-500 text-sm font-body">
                        {formatDuration(call.duration_seconds)}
                      </td>
                      <td className="px-4 py-3.5">
                        {hasLead ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body border text-green-600 bg-green-50 border-green-200">
                            <Check size={10} /> Oui
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body border text-charcoal-400 bg-ivory-100 border-ivory-300">
                            <X size={10} /> Non
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-500 text-sm font-body capitalize">
                        {call.language ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight size={14} className="text-charcoal-300" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TranscriptPanel call={selectedCall} onClose={() => setSelectedCall(null)} />
    </>
  )
}
