"use client"

import { useEffect, useTransition } from "react"
import { X, Phone, Clock, Globe, User } from "lucide-react"
import { cn, formatDate, formatDuration } from "@/lib/utils"
import type { Lead, CallLogWithLead, LeadStatus } from "@/lib/supabase/dashboard"
import { updateLeadStatus } from "@/app/actions/leads"

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "nouveau", label: "Nouveau", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "contacté", label: "Contacté", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "confirmé", label: "Confirmé", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "annulé", label: "Annulé", color: "text-red-600 bg-red-50 border-red-200" },
]

interface Props {
  lead?: Lead | null
  call?: CallLogWithLead | null
  onClose: () => void
}

export default function TranscriptPanel({ lead, call, onClose }: Props) {
  const isOpen = !!(lead || call)
  const [isPending, startTransition] = useTransition()

  const callLog = lead?.call_logs ?? null
  const transcript = callLog?.transcript ?? call?.transcript ?? null
  const summary = callLog?.summary ?? call?.summary ?? null
  const duration = callLog?.duration_seconds ?? call?.duration_seconds ?? 0
  const callerNumber = callLog?.caller_number ?? call?.caller_number ?? "—"
  const language = callLog?.language ?? call?.language ?? "—"
  const createdAt = callLog?.created_at ?? call?.created_at ?? ""
  const recordingSid = call?.recording_sid ?? null

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-ivory-300 z-50",
          "flex flex-col transition-transform duration-300 ease-out shadow-luxury",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ivory-200">
          <div>
            {lead ? (
              <p className="text-charcoal-900 font-body font-semibold">
                {lead.first_name} {lead.last_name}
              </p>
            ) : (
              <p className="text-charcoal-900 font-body font-semibold">Détails de l'appel</p>
            )}
            {createdAt && (
              <p className="text-charcoal-400 text-xs font-body mt-0.5">{formatDate(createdAt)}</p>
            )}
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-700 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-ivory-200 bg-ivory-50">
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-charcoal-300 flex-shrink-0" />
              <div>
                <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider">Numéro</p>
                <p className="text-charcoal-700 text-xs font-body font-medium">{callerNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-charcoal-300 flex-shrink-0" />
              <div>
                <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider">Durée</p>
                <p className="text-charcoal-700 text-xs font-body font-medium">{formatDuration(duration)}</p>
              </div>
            </div>
            {lead?.service && (
              <div className="flex items-center gap-2">
                <User size={13} className="text-charcoal-300 flex-shrink-0" />
                <div>
                  <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider">Service</p>
                  <p className="text-charcoal-700 text-xs font-body font-medium">{lead.service}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-charcoal-300 flex-shrink-0" />
              <div>
                <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider">Langue</p>
                <p className="text-charcoal-700 text-xs font-body font-medium capitalize">{language}</p>
              </div>
            </div>
          </div>

          {recordingSid && (
            <div className="px-5 py-4 border-b border-ivory-200">
              <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider mb-2">Enregistrement</p>
              <audio
                controls
                src={`/api/dashboard/recordings/${recordingSid}`}
                className="w-full h-9"
                preload="none"
              />
            </div>
          )}

          {lead && (
            <div className="px-5 py-4 border-b border-ivory-200">
              <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider mb-2">Statut</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={isPending}
                    onClick={() => startTransition(() => updateLeadStatus(lead.id, opt.value))}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-body border transition-all",
                      lead.status === opt.value
                        ? opt.color
                        : "text-charcoal-400 bg-white border-ivory-300 hover:border-ivory-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {lead.appointment_preference && (
                <p className="text-charcoal-400 text-xs font-body mt-3">
                  Préférence RDV :{" "}
                  <span className="text-charcoal-700">{lead.appointment_preference}</span>
                </p>
              )}
            </div>
          )}

          {summary && (
            <div className="px-5 py-4 border-b border-ivory-200">
              <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider mb-2">
                Résumé IA
              </p>
              <p className="text-charcoal-700 text-sm font-body leading-relaxed">{summary}</p>
            </div>
          )}

          <div className="px-5 py-4">
            <p className="text-charcoal-400 text-[10px] font-body uppercase tracking-wider mb-3">
              Transcription
            </p>
            {transcript ? (
              <div className="space-y-3">
                {transcript.split("\n").filter(Boolean).map((line, i) => {
                  const isAgent =
                    line.toLowerCase().startsWith("sofia:") ||
                    line.toLowerCase().startsWith("agent:") ||
                    line.toLowerCase().startsWith("ia:")
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-xs font-body leading-relaxed",
                        isAgent ? "text-gold-700 font-medium" : "text-charcoal-600"
                      )}
                    >
                      {line}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-charcoal-400 text-sm font-body italic">
                Aucune transcription disponible.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
