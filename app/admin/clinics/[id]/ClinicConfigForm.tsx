"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { ClinicRow } from "@/lib/supabase/clinics"

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-charcoal-600 text-sm font-body font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-charcoal-400 text-xs font-body mt-1">{hint}</p>}
    </div>
  )
}

export default function ClinicConfigForm({ clinic }: { clinic: ClinicRow }) {
  const router = useRouter()
  const config = (clinic.clinic_config ?? {}) as Record<string, unknown>

  const [systemPrompt, setSystemPrompt] = useState(clinic.system_prompt_override ?? "")
  const [bookingCreds, setBookingCreds] = useState((config.booking_creds as string) ?? "")
  const [bookingSystem, setBookingSystem] = useState((config.booking_system as string) || "manual")
  const [bookingApiUrl, setBookingApiUrl] = useState((config.booking_api_url as string) ?? "")
  const [bookingApiKey, setBookingApiKey] = useState((config.booking_api_key as string) ?? "")

  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [impersonating, setImpersonating] = useState(false)
  const [magicLink, setMagicLink] = useState("")
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function accessAccount() {
    setImpersonating(true)
    setMagicLink("")
    // Ouvrir la fenêtre immédiatement (clic synchrone) pour éviter le popup blocker
    const newTab = window.open("", "_blank")
    try {
      const res = await fetch(`/api/admin/clinics/${clinic.id}/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clinic.owner_email }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      if (newTab) {
        newTab.location.href = data.url
      } else {
        setMagicLink(data.url)
      }
    } catch (err) {
      newTab?.close()
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setImpersonating(false)
    }
  }

  async function save(activate = false) {
    setError("")
    activate ? setActivating(true) : setSaving(true)

    try {
      const res = await fetch(`/api/admin/clinics/${clinic.id}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPromptOverride: systemPrompt, bookingCreds, bookingSystem, bookingApiUrl, bookingApiKey, activate }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      if (activate) {
        router.push("/admin/clinics")
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSaving(false)
      setActivating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
      <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-4">
        Configuration de l'agent
      </p>

      <div className="space-y-4">
        <Field label="Instructions spéciales" hint="Comportements spécifiques, promotions, restrictions...">
          <textarea
            className={cn(inputClass, "min-h-[100px] resize-y")}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Ex : Toujours mentionner la promotion du mois. Ne jamais confirmer de prix sans la grille tarifaire..."
          />
        </Field>

        <Field label="Système de réservation">
          <div className="relative">
            <select
              className={cn(inputClass, "appearance-none pr-10")}
              value={bookingSystem}
              onChange={(e) => setBookingSystem(e.target.value)}
            >
              <option value="manual">Manuel — l'équipe confirme par téléphone</option>
              <option value="bookly">Bookly</option>
              <option value="jane">Jane App</option>
              <option value="mindbody">Mindbody</option>
              <option value="acuity">Acuity Scheduling</option>
              <option value="simplybook">SimplyBook.me</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </Field>

        {bookingSystem !== "manual" && (
          <>
            <Field label="URL de l'API" hint="Ex: https://macliniqueesthetique.com/wp-json/bookly-api/v1">
              <input
                className={inputClass}
                value={bookingApiUrl}
                onChange={(e) => setBookingApiUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Clé API" hint="Stockée de façon sécurisée, jamais exposée au public">
              <input
                className={cn(inputClass, "font-mono text-xs")}
                value={bookingApiKey}
                onChange={(e) => setBookingApiKey(e.target.value)}
                placeholder="sk_live_..."
                type="password"
              />
            </Field>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
          {error}
        </div>
      )}

      {magicLink && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-xs font-semibold mb-2 font-body">Lien d'accès généré — clique pour ouvrir le compte</p>
          <a
            href={magicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-body font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            Ouvrir le tableau de bord de la cliente →
          </a>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-ivory-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving || activating}
            className="text-charcoal-600 border border-ivory-300 bg-white font-body font-medium text-sm rounded-lg px-5 py-2.5 hover:border-gold-300 disabled:opacity-50 transition-colors"
          >
            {saving ? "Sauvegarde…" : saved ? "✓ Sauvegardé" : "Sauvegarder"}
          </button>

          <button
            type="button"
            onClick={accessAccount}
            disabled={impersonating}
            className="text-charcoal-500 border border-ivory-300 bg-white font-body font-medium text-sm rounded-lg px-5 py-2.5 hover:border-charcoal-300 disabled:opacity-50 transition-colors"
          >
            {impersonating ? "Connexion…" : "Accéder au compte →"}
          </button>
        </div>

        {!clinic.is_active && (
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saving || activating}
            className="bg-gold-gradient text-white font-body font-semibold text-sm rounded-lg px-6 py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {activating ? "Activation…" : "Activer la clinique →"}
          </button>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-red-100">
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-400 text-sm font-body hover:text-red-600 transition-colors"
          >
            Supprimer ce compte
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-body font-medium mb-1">
              Supprimer {clinic.name} ?
            </p>
            <p className="text-red-500 text-xs font-body mb-3">
              Cette action est irréversible. La clinique, le compte auth et le numéro Twilio seront supprimés.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  setDeleting(true)
                  try {
                    const res = await fetch(`/api/admin/clinics/${clinic.id}`, { method: "DELETE" })
                    const data = await res.json()
                    if (!data.success) throw new Error(data.error)
                    router.push("/admin/clinics")
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Erreur inconnue")
                    setShowDeleteConfirm(false)
                  } finally {
                    setDeleting(false)
                  }
                }}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-body font-semibold text-sm rounded-lg px-4 py-2 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Suppression…" : "Confirmer la suppression"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-charcoal-500 border border-ivory-300 bg-white font-body text-sm rounded-lg px-4 py-2 hover:border-charcoal-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
