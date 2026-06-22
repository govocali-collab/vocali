"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { updatePassword } from "@/app/actions/settings"

/**
 * Modal non fermable affiché à la 1re connexion (mot de passe temporaire).
 * Force la cliente à définir un mot de passe personnel avant d'utiliser le tableau de bord.
 */
export default function ForcePasswordChange() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const mismatch = confirm.length > 0 && newPassword !== confirm

  if (done) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }
    setLoading(true)
    setError("")
    try {
      await updatePassword(newPassword)
      setDone(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
      setLoading(false)
    }
  }

  const fieldClass = (bad = false) =>
    `w-full px-3 py-2 pr-10 rounded-lg border bg-ivory-50 text-charcoal-800 text-sm font-body placeholder:text-charcoal-300 focus:outline-none focus:ring-1 transition-colors ${
      bad
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-ivory-300 focus:border-gold-400 focus:ring-gold-200"
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm px-4 font-body">
      <div className="w-full max-w-md bg-white rounded-2xl border border-ivory-300 shadow-xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-gold-600" />
          </div>
          <h2 className="text-charcoal-900 text-lg font-semibold">Choisissez votre mot de passe</h2>
        </div>
        <p className="text-charcoal-500 text-sm mb-5">
          Pour votre sécurité, remplacez le mot de passe temporaire par un mot de passe personnel avant de continuer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-charcoal-400 text-xs font-body mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 caractères"
                required
                minLength={8}
                autoFocus
                className={fieldClass(false)}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500 transition-colors"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-charcoal-400 text-xs font-body mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                className={fieldClass(mismatch)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500 transition-colors"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {mismatch && (
              <p className="mt-1 text-red-500 text-xs font-body">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          {error && <p className="text-red-500 text-xs font-body">{error}</p>}

          <button
            type="submit"
            disabled={loading || mismatch || !newPassword || !confirm}
            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-gold-gradient text-white text-sm font-body font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Enregistrement…" : "Définir mon mot de passe"}
          </button>
        </form>
      </div>
    </div>
  )
}
