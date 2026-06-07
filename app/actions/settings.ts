"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendAgentPausedNotification } from "@/lib/email/resend"

export async function updatePassword(newPassword: string) {
  if (newPassword.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères")
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
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
      agentName: config.agent_name ?? "Sofia",
      ownerName: [config.owner_first_name, config.owner_last_name].filter(Boolean).join(" "),
      ownerEmail: user.email,
      clinicId: clinic.id,
    }).catch((err) => console.error("Pause notification error (non-fatal):", err))
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}
