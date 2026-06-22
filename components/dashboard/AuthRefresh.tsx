"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AuthRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Le serveur n'a pas vu de session. Si le client en a une (cookie pas encore
    // synchronisé), on rafraîchit. Sinon, la cliente n'est pas connectée → /login.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.refresh()
      } else {
        router.replace("/login")
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
