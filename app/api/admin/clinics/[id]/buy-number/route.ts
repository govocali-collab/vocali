import { NextResponse } from "next/server"
import { updateClinicTwilioNumber, syncLocationFromClinic, getClinicById } from "@/lib/supabase/clinics"
import { importNumberToElevenLabs } from "@/lib/elevenlabs"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { phoneNumber } = await req.json()
    if (!phoneNumber) throw new Error("Numéro manquant")

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (!accountSid || !authToken) throw new Error("Twilio non configuré")

    const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    // 1) Acheter le numéro. Pas de VoiceUrl ici : ElevenLabs reconfigure
    // automatiquement le webhook du numéro à l'import (étape 3).
    const buyResp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ PhoneNumber: phoneNumber }).toString(),
      }
    )
    const bought = await buyResp.json()
    if (!buyResp.ok) throw new Error(bought.message ?? "Erreur lors de l'achat Twilio")

    // 2) Enregistrer dans le profil clinique + synchroniser l'emplacement.
    await updateClinicTwilioNumber(id, phoneNumber)
    await syncLocationFromClinic(id).catch((err) =>
      console.error("Location sync error (non-fatal):", err)
    )

    // 3) Importer le numéro dans ElevenLabs et l'assigner à l'agent Vocali.
    const clinic = await getClinicById(id)
    try {
      await importNumberToElevenLabs(phoneNumber, clinic?.name || phoneNumber)
    } catch (elevenErr) {
      const warning = elevenErr instanceof Error ? elevenErr.message : String(elevenErr)
      console.error("ElevenLabs import error:", warning)
      // Le numéro est acheté et enregistré, mais pas branché sur ElevenLabs.
      return NextResponse.json({
        success: true,
        phoneNumber,
        warning: `Numéro acheté, mais l'import dans ElevenLabs a échoué : ${warning}`,
      })
    }

    return NextResponse.json({ success: true, phoneNumber })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
