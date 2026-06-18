import { NextResponse } from "next/server"
import { updateClinicConfig, syncLocationFromClinic, getClinicById, updateOwnerEmail } from "@/lib/supabase/clinics"
import { sendAgentLiveEmail } from "@/lib/email/resend"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { ownerEmail, agentName, tone, systemPromptOverride, websiteUrl, bookingCreds, bookingSystem, bookingApiUrl, bookingApiKey, voiceId, offersTrainings, greeting, activate } = await req.json()

    if (ownerEmail !== undefined) {
      await updateOwnerEmail(id, ownerEmail.trim())
    }

    await updateClinicConfig(id, {
      agentName,
      tone,
      systemPromptOverride,
      websiteUrl,
      bookingCreds,
      bookingSystem,
      bookingApiUrl,
      bookingApiKey,
      voiceId,
      offersTrainings,
      greeting,
      activate: !!activate,
    })

    await syncLocationFromClinic(id).catch((err) =>
      console.error("Location sync error (non-fatal):", err)
    )

    if (activate) {
      const clinic = await getClinicById(id)
      if (clinic) {
        const config = (clinic.clinic_config ?? {}) as Record<string, string>
        sendAgentLiveEmail({
          clinicName: clinic.name,
          ownerEmail: clinic.owner_email,
          ownerFirstName: config.owner_first_name ?? clinic.name,
          agentName: config.agent_name ?? "Alexandra",
        }).catch((err) => console.error("Agent live email error (non-fatal):", err))
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
