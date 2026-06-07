"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const mismatch = confirm.length > 0 && password !== confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={127} height={39} priority />
        </div>

        <div className="bg-white border border-ivory-300 rounded-2xl p-8 shadow-card">
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold mb-1">
            Nouveau mot de passe
          </h1>
          <p className="text-charcoal-400 text-sm mb-6">
            Choisissez un mot de passe sécurisé pour votre compte.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-charcoal-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 pr-10 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="Min. 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-charcoal-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                Confirmer
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full bg-ivory-50 border rounded-lg px-4 py-2.5 pr-10 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none transition-colors ${
                    mismatch
                      ? "border-red-300 focus:border-red-400"
                      : "border-ivory-300 focus:border-gold-400"
                  }`}
                  placeholder="Répétez le mot de passe"
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
                <p className="mt-1 text-red-500 text-xs">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || mismatch || !password || !confirm}
              className="w-full bg-gold-gradient disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-opacity hover:opacity-90 mt-2"
            >
              {loading ? "Mise à jour…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
