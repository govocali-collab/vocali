"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function MagicAuthPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => router.replace("/dashboard"))
    } else {
      // PKCE flow — code handled by /auth/callback
      router.replace("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center font-body">
      <p className="text-charcoal-600 text-base">Connexion en cours…</p>
    </div>
  )
}
