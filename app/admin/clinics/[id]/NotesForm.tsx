"use client"

import { useState, useRef } from "react"
import { StickyNote, Check } from "lucide-react"
import { updateClinicNotes } from "@/app/actions/admin"

export default function NotesForm({ clinicId, initialNotes }: { clinicId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    setNotes(value)
    setStatus("idle")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(value), 1200)
  }

  async function save(value: string) {
    setStatus("saving")
    try {
      await updateClinicNotes(clinicId, value)
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("idle")
    }
  }

  return (
    <div className="bg-ink-card rounded-xl border border-ivory-300 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gold-50 border border-gold-200 flex items-center justify-center">
            <StickyNote size={12} className="text-gold-600" />
          </div>
          <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest">
            Notes internes
          </p>
        </div>
        {status === "saving" && (
          <span className="text-charcoal-300 text-xs font-body">Sauvegarde…</span>
        )}
        {status === "saved" && (
          <span className="flex items-center gap-1 text-green-600 text-xs font-body">
            <Check size={11} /> Sauvegardé
          </span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Ex : Cliente difficile · Renouvelle en août · Préfère être contactée par email…"
        rows={5}
        className="w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-3 text-charcoal-800 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-100 transition-colors resize-none"
      />
      <p className="text-charcoal-300 text-xs font-body mt-2">
        Sauvegarde automatique · Visible uniquement par toi
      </p>
    </div>
  )
}
