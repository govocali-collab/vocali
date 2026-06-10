import { NextResponse } from "next/server"
import { updateClinicTwilioNumber, syncLocationFromClinic } from "@/lib/supabase/clinics"

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
    const webhookUrl = process.env.VOICE_AGENT_WEBHOOK_URL
    if (!accountSid || !authToken) throw new Error("Twilio non configuré")

    const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    // Acheter le numéro
    const buyBody = new URLSearchParams({ PhoneNumber: phoneNumber })
    if (webhookUrl) {
      buyBody.set("VoiceUrl", webhookUrl)
      buyBody.set("VoiceMethod", "POST")
    }

    const buyResp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: buyBody.toString(),
      }
    )
    const bought = await buyResp.json()
    if (!buyResp.ok) throw new Error(bought.message ?? "Erreur lors de l'achat Twilio")

    // Enregistrer dans le profil clinique
    await updateClinicTwilioNumber(id, phoneNumber)
    await syncLocationFromClinic(id).catch((err) =>
      console.error("Location sync error (non-fatal):", err)
    )

    return NextResponse.json({ success: true, phoneNumber })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
