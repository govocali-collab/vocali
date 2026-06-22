"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendAgentPausedNotification } from "@/lib/email/resend"

export async function updatePassword(newPassword: string) {
  if (newPassword.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères")
  const supabase = await createClient()
  // Change le mot de passe ET efface le flag « mot de passe temporaire ».
  const { error } = await supabase.auth.updateUser({ password: newPassword, data: { must_change_password: false } })
  if (error) throw new Error(error.message)
}

// Correspondance jour FR (affichage / clinics.hours) → EN (agent / locations.hours).
const HOURS_FR_TO_EN: Record<string, string> = {
  lundi: "monday", mardi: "tuesday", mercredi: "wednesday", jeudi: "thursday",
  vendredi: "friday", samedi: "saturday", dimanche: "sunday",
}

/**
 * Met à jour les heures d'ouverture. Écrit DEUX formats en sync :
 * - clinics.hours = { jourFR: {open, close, closed} }  (affichage tableau de bord)
 * - locations.hours = { jourEN: "ouv–ferm" | null, notes }  (lu par l'agent vocal)
 */
export async function updateHours(hours: Record<string, { open: string; close: string; closed: boolean }>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Non autorisé")

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinic } = await admin
    .from("clinics")
    .select("id")
    .eq("owner_email", user.email)
    .single()
  if (!clinic) throw new Error("Clinique introuvable")

  // 1) clinics.hours (affichage)
  const { error: e1 } = await admin.from("clinics").update({ hours }).eq("id", clinic.id)
  if (e1) throw new Error(e1.message)

  // 2) locations.hours (agent vocal) — en préservant les notes de chaque emplacement
  const { data: locations } = await admin
    .from("locations")
    .select("id, hours")
    .eq("clinic_id", clinic.id)

  for (const loc of locations ?? []) {
    const notes = (loc.hours as { notes?: string | null } | null)?.notes ?? null
    const locHours: Record<string, string | null> = { notes }
    for (const [fr, en] of Object.entries(HOURS_FR_TO_EN)) {
      const d = hours[fr]
      locHours[en] = d && !d.closed ? `${d.open}–${d.close}` : null
    }
    await admin.from("locations").update({ hours: locHours }).eq("id", loc.id)
  }

  revalidatePath("/dashboard/settings")
}

export async function updateOwnerInfo(data: {
  firstName: string
  lastName: string
  phone: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Non autorisé")

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinic } = await admin
    .from("clinics")
    .select("clinic_config")
    .eq("owner_email", user.email)
    .single()

  if (!clinic) throw new Error("Clinique introuvable")

  const updatedConfig = {
    ...(clinic.clinic_config as Record<string, unknown>),
    owner_first_name: data.firstName,
    owner_last_name: data.lastName,
    owner_name: `${data.firstName} ${data.lastName}`.trim(),
    owner_phone: data.phone,
  }

  const { error } = await admin
    .from("clinics")
    .update({ clinic_config: updatedConfig })
    .eq("owner_email", user.email)

  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/settings")
}

export async function setAgentActive(active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Non autorisé")

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinic } = await admin
    .from("clinics")
    .select("id, twilio_phone_number, name, clinic_config")
    .eq("owner_email", user.email)
    .single()

  if (!clinic) throw new Error("Clinique introuvable")

  // Update clinics table — track when paused for reminder logic
  const pauseFields = active
    ? { is_active: true, paused_at: null, pause_reminder_sent: false }
    : { is_active: false, paused_at: new Date().toISOString(), pause_reminder_sent: false }
  await admin.from("clinics").update(pauseFields).eq("id", clinic.id)

  // Update locations — try by clinic_id first, fallback to twilio_phone_number
  const { data: byClinicId } = await admin
    .from("locations")
    .update({ is_active: active, clinic_id: clinic.id })
    .eq("clinic_id", clinic.id)
    .select("id")

  if ((!byClinicId || byClinicId.length === 0) && clinic.twilio_phone_number) {
    await admin
      .from("locations")
      .update({ is_active: active, clinic_id: clinic.id })
      .eq("twilio_phone_number", clinic.twilio_phone_number)
  }

  // Notify Jonathan when a clinic pauses their agent
  if (!active) {
    const config = (clinic.clinic_config ?? {}) as Record<string, string>
    sendAgentPausedNotification({
      clinicName: clinic.name,
      agentName: config.agent_name ?? "Sarah",
      ownerName: [config.owner_first_name, config.owner_last_name].filter(Boolean).join(" "),
      ownerEmail: user.email,
      clinicId: clinic.id,
    }).catch((err) => console.error("Pause notification error (non-fatal):", err))
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}
