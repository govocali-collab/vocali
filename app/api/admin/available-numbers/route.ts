import { NextResponse } from "next/server"
import { getAreaCode } from "@/lib/city-area-codes"

// Recherche de numéros Twilio disponibles, sans clinique (pour l'onboarding,
// avant que la clinique existe). Variante non-scopée de
// /api/admin/clinics/[id]/available-numbers.
//
// Paramètre `q` : ville OU indicatif. 3 chiffres → AreaCode ; sinon → InLocality.
// Si la recherche par ville ne renvoie rien, on retombe sur l'indicatif de la
// ville (ex: "Laval" → 0 résultat → indicatif 450). Compatible avec les anciens
// paramètres areaCode/inLocality.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const country = searchParams.get("country") ?? "CA"
    const q = (searchParams.get("q") || searchParams.get("inLocality") || searchParams.get("areaCode") || "").trim()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (!accountSid || !authToken) throw new Error("Twilio non configuré")

    const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    async function search(filter: { areaCode?: string; inLocality?: string }) {
      const query = new URLSearchParams({ VoiceEnabled: "true", SmsEnabled: "true", PageSize: "10" })
      if (filter.areaCode) query.set("AreaCode", filter.areaCode)
      if (filter.inLocality) query.set("InLocality", filter.inLocality)
      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${country}/Local.json?${query}`,
        { headers: { Authorization: auth } }
      )
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.message ?? "Erreur Twilio")
      return (data.available_phone_numbers ?? []).map((n: Record<string, unknown>) => ({
        phoneNumber: n.phone_number,
        friendlyName: n.friendly_name,
        region: n.region,
        locality: n.locality,
      }))
    }

    let numbers: unknown[] = []
    let fallbackAreaCode: number | undefined

    if (/^\d{3}$/.test(q)) {
      numbers = await search({ areaCode: q })
    } else if (q) {
      // Recherche par ville, puis repli sur l'indicatif de la ville.
      numbers = await search({ inLocality: q })
      if (numbers.length === 0) {
        fallbackAreaCode = getAreaCode(q)
        if (fallbackAreaCode) numbers = await search({ areaCode: String(fallbackAreaCode) })
      }
    } else {
      numbers = await search({})
    }

    return NextResponse.json({ success: true, numbers, fallbackAreaCode: fallbackAreaCode ?? null })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
