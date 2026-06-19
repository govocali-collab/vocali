"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, UserCheck } from "lucide-react"
import type { DemoSession } from "@/lib/supabase/demo-stats"

function fmtDuration(sec: number | null): string {
  if (!sec) return "—"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-CA", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function DemoTranscripts({ sessions }: { sessions: DemoSession[] }) {
  const [open, setOpen] = useState<string | null>(null)

  if (sessions.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-charcoal-400 text-sm font-body">
          Aucune conversation de démo enregistrée pour l&apos;instant.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-ivory-200">
      {sessions.map((s) => {
        const turns = Array.isArray(s.transcript) ? s.transcript : []
        const isOpen = open === s.id
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : s.id)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-ivory-100 transition-colors"
            >
              {isOpen ? (
                <ChevronDown size={15} className="text-charcoal-400 flex-shrink-0" />
              ) : (
                <ChevronRight size={15} className="text-charcoal-400 flex-shrink-0" />
              )}
              <span className="text-charcoal-700 text-sm font-body w-32 flex-shrink-0">{fmtDate(s.created_at)}</span>
              <span className="text-charcoal-500 text-xs font-body bg-ivory-100 border border-ivory-300 rounded-full px-2 py-0.5 truncate max-w-[180px]">
                {s.src || "direct"}
              </span>
              <span className="text-charcoal-500 text-xs font-body ml-auto flex-shrink-0">{fmtDuration(s.duration_sec)}</span>
              {s.is_prospect && (
                <span className="inline-flex items-center gap-1 text-green-700 text-xs font-body bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex-shrink-0">
                  <UserCheck size={11} /> Prospect
                </span>
              )}
              <span className="text-charcoal-400 text-xs font-body flex-shrink-0">{turns.length} tours</span>
            </button>

            {isOpen && (
              <div className="px-5 pb-4 pt-1 bg-ivory-50">
                {turns.length === 0 ? (
                  <p className="text-charcoal-400 text-sm font-body italic">Transcription non disponible.</p>
                ) : (
                  <div className="space-y-2 max-w-3xl">
                    {turns.map((t, i) => (
                      <div key={i} className="flex gap-2">
                        <span
                          className={
                            t.role === "assistant"
                              ? "text-gold-700 text-xs font-body font-semibold w-14 flex-shrink-0"
                              : "text-charcoal-500 text-xs font-body font-semibold w-14 flex-shrink-0"
                          }
                        >
                          {t.role === "assistant" ? "Sarah" : "Visiteur"}
                        </span>
                        <p className="text-charcoal-700 text-sm font-body">{t.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
