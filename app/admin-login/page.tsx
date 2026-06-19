"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push("/admin/clinics")
      router.refresh()
    } else {
      setError("Mot de passe incorrect.")
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={127} height={39} priority />
        </div>

        <div className="bg-white border border-ivory-300 rounded-2xl p-8 shadow-card">
          <h1 className="text-charcoal-900 font-display text-xl font-semibold mb-1">Accès admin</h1>
          <p className="text-charcoal-400 text-sm mb-6">Zone réservée à l'équipe Vocali.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"
            />

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gold-gradient text-white font-semibold text-sm rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
            >
              Entrer
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
