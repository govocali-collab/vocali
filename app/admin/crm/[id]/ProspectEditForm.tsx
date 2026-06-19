"use client"

import { useFormStatus } from "react-dom"
import { updateProspectAction } from "../actions"
import type { Prospect } from "@/lib/supabase/prospects"
import StatusSelect from "./StatusSelect"

const SOURCES = ["Instagram", "Référence", "Appel froid", "LinkedIn", "Site web", "Autre"]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
    >
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  )
}

export default function ProspectEditForm({ prospect }: { prospect: Prospect }) {
  const action = updateProspectAction.bind(null, prospect.id)

  const lastContact = prospect.last_contact_at
    ? new Date(prospect.last_contact_at).toISOString().split("T")[0]
    : ""

  return (
    <form action={action} className="bg-ink-card border border-ivory-300 rounded-xl p-6 shadow-card">
      <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-5">
        Informations
      </p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-xs text-charcoal-400 font-body mb-1">Nom de la clinique *</label>
          <input
            name="clinic_name"
            defaultValue={prospect.clinic_name}
            required
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Propriétaire</label>
          <input
            name="owner_name"
            defaultValue={prospect.owner_name ?? ""}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Ville</label>
          <input
            name="city"
            defaultValue={prospect.city ?? ""}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Téléphone</label>
          <input
            name="phone"
            type="tel"
            defaultValue={prospect.phone ?? ""}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Courriel</label>
          <input
            name="email"
            type="email"
            defaultValue={prospect.email ?? ""}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Statut</label>
          <StatusSelect defaultValue={prospect.status} />
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Source</label>
          <select
            name="source"
            defaultValue={prospect.source ?? ""}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-700 focus:outline-none focus:border-gold-400"
          >
            <option value="">—</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-charcoal-400 font-body mb-1">Dernier contact</label>
          <input
            name="last_contact_at"
            type="date"
            defaultValue={lastContact}
            className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400"
          />
        </div>
      </div>
      <div className="mb-5">
        <label className="block text-xs text-charcoal-400 font-body mb-1">Notes</label>
        <textarea
          name="notes"
          defaultValue={prospect.notes ?? ""}
          rows={5}
          placeholder="Notes de suivi, points importants, prochaines étapes..."
          className="w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400 resize-none"
        />
      </div>
      <SubmitButton />
    </form>
  )
}
