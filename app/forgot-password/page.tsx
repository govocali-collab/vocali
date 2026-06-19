"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={127} height={39} priority />
        </div>

        <div className="bg-ink-card border border-ivory-300 rounded-2xl p-8 shadow-card">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-charcoal-900 font-display text-xl font-semibold mb-2">Courriel envoyé</h1>
              <p className="text-charcoal-400 text-sm leading-relaxed mb-6">
                Si un compte existe pour <strong className="text-charcoal-700">{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes.
              </p>
              <Link href="/login" className="text-gold-600 hover:text-gold-500 text-sm transition-colors">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-charcoal-900 font-display text-2xl font-semibold mb-1">
                Mot de passe oublié
              </h1>
              <p className="text-charcoal-400 text-sm mb-6">
                Entrez votre courriel et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-charcoal-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                    Courriel
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"
                    placeholder="vous@clinique.ca"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold-gradient disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-opacity hover:opacity-90"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-charcoal-400 hover:text-charcoal-600 text-sm transition-colors">
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
