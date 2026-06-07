"use server"

import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function updateClinicNotes(clinicId: string, notes: string) {
  const admin = getAdminClient()
  const { error } = await admin
    .from("clinics")
    .update({ internal_notes: notes })
    .eq("id", clinicId)
  if (error) throw new Error(error.message)
}
