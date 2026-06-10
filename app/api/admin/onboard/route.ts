import { NextResponse } from "next/server"
import twilio from "twilio"
import { createClinic, updateClinicTwilioNumber, createAuthUser } from "@/lib/supabase/clinics"
import { sendWelcomeEmail } from "@/lib/email/resend"

const CITY_AREA_CODES: Record<string, number> = {
  // Québec
  "montréal": 514, "montreal": 514, "mont-réal": 514,
  "laval": 450, "longueuil": 450, "brossard": 450, "repentigny": 450,
  "terrebonne": 450, "blainville": 450, "mirabel": 450, "mascouche": 450,
  "saint-jérôme": 450, "saint-jerome": 450, "granby": 450,
  "saint-hyacinthe": 450, "sorel-tracy": 450, "vaudreuil-dorion": 450,
  "québec": 418, "quebec": 418, "saguenay": 418, "lévis": 418, "levis": 418,
  "chicoutimi": 418, "jonquière": 418, "jonquiere": 418,
  "gatineau": 819, "sherbrooke": 819, "trois-rivières": 819,
  "trois-rivieres": 819, "drummondville": 819, "shawinigan": 819,
  "rouyn-noranda": 819, "val-d'or": 819, "victoriaville": 819,
  // Ontario
  "toronto": 416, "north york": 416, "etobicoke": 416, "scarborough": 416,
  "mississauga": 905, "brampton": 905, "hamilton": 905, "oakville": 905,
  "markham": 905, "vaughan": 905, "richmond hill": 905, "oshawa": 905,
  "ajax": 905, "pickering": 905, "whitby": 905, "barrie": 705,
  "ottawa": 613, "kingston": 613, "cornwall": 613,
  "london": 519, "windsor": 519, "kitchener": 519, "waterloo": 519,
  "cambridge": 519, "guelph": 519, "brantford": 519,
  "sudbury": 705, "thunder bay": 807,
  // Colombie-Britannique
  "vancouver": 604, "surrey": 604, "burnaby": 604, "richmond": 604,
  "delta": 604, "langley": 604, "coquitlam": 604, "abbotsford": 604,
  "victoria": 250, "kelowna": 250, "kamloops": 250, "nanaimo": 250,
  // Alberta
  "calgary": 403, "lethbridge": 403, "medicine hat": 403, "red deer": 403,
  "edmonton": 780, "fort mcmurray": 780, "grande prairie": 780,
  // Autres
  "winnipeg": 204, "regina": 306, "saskatoon": 306, "halifax": 902,
  "moncton": 506, "fredericton": 506, "saint john": 506,
}

function getAreaCode(city: string): number | undefined {
  return CITY_AREA_CODES[city.toLowerCase().trim()]
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clinicName,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone,
      city,
      language,
      agentName,
      tone,
      systemPromptOverride,
      websiteUrl,
      selectedServices,
      customServices,
      hours,
      bookingSystem,
      bookingCreds,
    } = body

    const allServices = [
      ...selectedServices,
      ...customServices
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    ]

    const clinicConfig: Record<string, unknown> = {
      agent_name: agentName || "Sofia",
      tone,
      languages: language,
      owner_first_name: ownerFirstName,
      owner_last_name: ownerLastName,
      owner_name: `${ownerFirstName} ${ownerLastName}`.trim(),
      owner_email: ownerEmail,
      owner_phone: ownerPhone,
      city,
      keyword_boost: allServices,
      booking_system: bookingSystem,
      website_url: websiteUrl || null,
    }

    if (bookingSystem !== "Aucun" && bookingCreds) {
      clinicConfig.booking_creds = bookingCreds
    }

    // 1. Create clinic row
    const clinicId = await createClinic({
      name: clinicName,
      owner_email: ownerEmail,
      is_active: false,
      services: allServices,
      hours,
      clinic_config: clinicConfig,
      system_prompt_override: systemPromptOverride || null,
    })

    // 2. Purchase Twilio number — prefer matching area code
    let twilioNumber: string | null = null
    let twilioError: string | null = null
    try {
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )

      const voiceWebhookUrl = process.env.VOICE_AGENT_WEBHOOK_URL
      if (!voiceWebhookUrl) {
        throw new Error("VOICE_AGENT_WEBHOOK_URL not configured in environment")
      }

      const areaCode = getAreaCode(city)
      let available = areaCode
        ? await twilioClient
            .availablePhoneNumbers("CA")
            .local.list({ limit: 1, voiceEnabled: true, areaCode })
        : []

      // Fallback to any Canadian number if area code had no results
      if (available.length === 0) {
        console.warn(`[Twilio] No numbers for area code ${areaCode} (${city}) — trying Canada-wide`)
        available = await twilioClient
          .availablePhoneNumbers("CA")
          .local.list({ limit: 1, voiceEnabled: true })
      }

      if (available.length === 0) {
        throw new Error("Aucun numéro canadien disponible dans Twilio")
      }

      const purchased = await twilioClient.incomingPhoneNumbers.create({
        phoneNumber: available[0].phoneNumber,
        friendlyName: clinicName,
        voiceUrl: voiceWebhookUrl,
        voiceMethod: "POST",
      })
      twilioNumber = purchased.phoneNumber
      await updateClinicTwilioNumber(clinicId, twilioNumber)
      console.log(`[Twilio] Purchased ${twilioNumber} for ${clinicName}`)
    } catch (twilioErr) {
      twilioError = twilioErr instanceof Error ? twilioErr.message : String(twilioErr)
      console.error("Twilio error (non-fatal):", twilioError)
    }

    // 3. Create Supabase Auth user
    const tempPassword = generateTempPassword()
    await createAuthUser(ownerEmail, tempPassword)

    // 4. Send welcome email
    await sendWelcomeEmail({
      clinicName,
      agentName: agentName || "Sofia",
      ownerEmail,
      ownerFirstName,
      tempPassword,
    })

    return NextResponse.json({ success: true, clinicId, twilioNumber, twilioError })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("Onboard error:", message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
