"use client"

import { useFormStatus } from "react-dom"
import { RotateCcw } from "lucide-react"
import { resetDemoStatsAction } from "./actions"

function Inner() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-60 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
    >
      <RotateCcw size={14} />
      {pending ? "Réinitialisation…" : "Réinitialiser les stats"}
    </button>
  )
}

export default function ResetDemoStatsButton() {
  return (
    <form
      action={resetDemoStatsAction}
      onSubmit={(e) => {
        if (!confirm("Réinitialiser les stats démo ?\n\nToutes les sessions et transcriptions de démo seront supprimées définitivement. Action irréversible.")) {
          e.preventDefault()
        }
      }}
    >
      <Inner />
    </form>
  )
}
