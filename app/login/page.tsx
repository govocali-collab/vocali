"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Courriel ou mot de passe incorrect.")
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
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold mb-1">Connexion</h1>
          <p className="text-charcoal-400 text-sm mb-6">Accédez à votre tableau de bord.</p>

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
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-charcoal-500 text-xs font-medium uppercase tracking-wider">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-gold-600 hover:text-gold-500 text-xs transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"
                placeholder="••••••••"
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
              className="w-full bg-gold-gradient disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-opacity mt-2 hover:opacity-90"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-charcoal-400 text-xs mt-6">
          Problème de connexion ?{" "}
          <a href="mailto:support@vocali.ca" className="text-gold-600 hover:text-gold-500 transition-colors">
            support@vocali.ca
          </a>
        </p>
      </div>
    </div>
  )
}
