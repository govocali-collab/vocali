"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/** Déconnecte la cliente et la renvoie à la page de connexion. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
