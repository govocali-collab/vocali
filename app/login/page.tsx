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
    <div className="vk min-h-screen flex items-center justify-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .vk { background:#161221; font-family:'Inter',-apple-system,sans-serif; position:relative; overflow:hidden; }
        .vk::before { content:""; position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:700px; height:700px; border-radius:9999px; background:rgba(139,92,246,0.18); filter:blur(160px); }
        .vk-card { background:linear-gradient(180deg,#1E1830 0%,#171124 100%); border:1px solid rgba(255,255,255,0.08); }
        .vk-h { font-family:'Space Grotesk',sans-serif; letter-spacing:-0.02em; color:#FAFAFB; }
        .vk-muted { color:#A5A3AD; }
        .vk-label { color:#9A98A4; }
        .vk-input { background:#211B33; border:1px solid rgba(255,255,255,0.10); color:#FAFAFB; }
        .vk-input::placeholder { color:#6F6C7E; }
        .vk-input:focus { outline:none; border-color:#8B5CF6; }
        .vk-btn { background:linear-gradient(135deg,#6B21A8 0%,#8B5CF6 100%); box-shadow:0 12px 40px -12px rgba(139,92,246,0.6); }
        .vk-link { color:#A78BFA; }
        .vk-link:hover { color:#C4B5FD; }
      `}</style>

      <div className="w-full max-w-sm relative">
        <div className="flex justify-center mb-8">
          <Image src="/vocali-logo-white.png" alt="Vocali" width={127} height={39} priority />
        </div>

        <div className="vk-card rounded-2xl p-8">
          <h1 className="vk-h text-2xl font-semibold mb-1">Connexion</h1>
          <p className="vk-muted text-sm mb-6">Accédez à votre tableau de bord.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block vk-label text-xs font-medium uppercase tracking-wider mb-1.5">Courriel</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="vk-input w-full rounded-lg px-4 py-2.5 text-sm transition-colors"
                placeholder="vous@clinique.ca"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block vk-label text-xs font-medium uppercase tracking-wider">Mot de passe</label>
                <Link href="/forgot-password" className="vk-link text-xs transition-colors">Mot de passe oublié ?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="vk-input w-full rounded-lg px-4 py-2.5 text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#FCA5A5", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="vk-btn w-full disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-opacity mt-2 hover:opacity-90"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center vk-muted text-xs mt-6">
          Problème de connexion ?{" "}
          <a href="mailto:jonathan@vocali.ca" className="vk-link transition-colors">jonathan@vocali.ca</a>
        </p>
      </div>
    </div>
  )
}
