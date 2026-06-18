import { NextResponse } from "next/server"

// Recherche de numéros Twilio disponibles, sans clinique (pour l'onboarding,
// avant que la clinique existe). Variante non-scopée de
// /api/admin/clinics/[id]/available-numbers.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const areaCode = searchParams.get("areaCode") ?? ""
    const country = searchParams.get("country") ?? "CA"

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (!accountSid || !authToken) throw new Error("Twilio non configuré")

    const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    const query = new URLSearchParams({ VoiceEnabled: "true", SmsEnabled: "true", PageSize: "10" })
    if (areaCode) query.set("AreaCode", areaCode)

    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${country}/Local.json?${query}`,
      { headers: { Authorization: auth } }
    )
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.message ?? "Erreur Twilio")

    const numbers = (data.available_phone_numbers ?? []).map((n: Record<string, unknown>) => ({
      phoneNumber: n.phone_number,
      friendlyName: n.friendly_name,
      region: n.region,
      locality: n.locality,
    }))

    return NextResponse.json({ success: true, numbers })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
