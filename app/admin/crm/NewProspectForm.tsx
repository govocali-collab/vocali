"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { addProspectAction } from "./actions"

const SOURCES = ["Instagram", "Référence", "Appel froid", "LinkedIn", "Site web", "Autre"]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      {pending ? "Ajout..." : "Ajouter"}
    </button>
  )
}

export default function NewProspectForm() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-gold-600 hover:bg-gold-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        + Nouveau prospect
      </button>
    )
  }

  return (
    <div className="bg-white border border-ivory-300 rounded-xl p-5 shadow-card w-full sm:w-auto sm:min-w-[500px]">
      <p className="text-charcoal-800 font-semibold font-body text-sm mb-4">Nouveau prospect</p>
      <form action={addProspectAction}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className="block text-xs text-charcoal-400 font-body mb-1">Nom de la clinique *</label>
            <input
              name="clinic_name"
              required
              autoFocus
              className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
            />
          </div>
          <div>
            <label className="block text-xs text-charcoal-400 font-body mb-1">Propriétaire</label>
            <input name="owner_name" className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400" />
          </div>
          <div>
            <label className="block text-xs text-charcoal-400 font-body mb-1">Ville</label>
            <input name="city" className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400" />
          </div>
          <div>
            <label className="block text-xs text-charcoal-400 font-body mb-1">Téléphone</label>
            <input name="phone" type="tel" className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400" />
          </div>
          <div>
            <label className="block text-xs text-charcoal-400 font-body mb-1">Source</label>
            <select name="source" className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-700 focus:outline-none focus:border-gold-400">
              <option value="">—</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SubmitButton />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-charcoal-400 hover:text-charcoal-700 text-sm px-4 py-2 font-body transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
