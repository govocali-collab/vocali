"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { updatePassword } from "@/app/actions/settings"

export default function PasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const mismatch = confirm.length > 0 && newPassword !== confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      await updatePassword(newPassword)
      setSuccess(true)
      setNewPassword("")
      setConfirm("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-ivory-100 border border-ivory-300 flex items-center justify-center flex-shrink-0">
          <Lock size={13} className="text-charcoal-400" />
        </div>
        <h2 className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">
          Mot de passe
        </h2>
      </div>

      {success && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-body">Mot de passe mis à jour avec succès.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-charcoal-400 text-xs font-body mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              required
              minLength={8}
              className="w-full px-3 py-2 pr-10 rounded-lg border border-ivory-300 bg-ivory-50 text-charcoal-800 text-sm font-body placeholder:text-charcoal-300 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-200 transition-colors"
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
          <label className="block text-charcoal-400 text-xs font-body mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
              className={`w-full px-3 py-2 pr-10 rounded-lg border text-charcoal-800 text-sm font-body placeholder:text-charcoal-300 focus:outline-none focus:ring-1 transition-colors bg-ivory-50 ${
                mismatch
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-ivory-300 focus:border-gold-400 focus:ring-gold-200"
              }`}
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

        {error && (
          <p className="text-red-500 text-xs font-body">{error}</p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || mismatch || !newPassword || !confirm}
            className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white text-sm font-body font-medium transition-colors disabled:opacity-40"
          >
            {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </div>
      </form>
    </section>
  )
}
