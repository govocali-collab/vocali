import { NextResponse } from "next/server"
import { updateClinicConfig, syncLocationFromClinic } from "@/lib/supabase/clinics"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { agentName, tone, systemPromptOverride, bookingCreds, bookingSystem, bookingApiUrl, bookingApiKey, activate } = await req.json()

    await updateClinicConfig(id, {
      agentName,
      tone,
      systemPromptOverride,
      bookingCreds,
      bookingSystem,
      bookingApiUrl,
      bookingApiKey,
      activate: !!activate,
    })

    await syncLocationFromClinic(id).catch((err) =>
      console.error("Location sync error (non-fatal):", err)
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
