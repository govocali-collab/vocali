import { NextResponse } from "next/server"
import twilio from "twilio"
import { createClinic, updateClinicTwilioNumber, createAuthUser, createLocation } from "@/lib/supabase/clinics"
import { sendWelcomeEmail, sendAdminNotification } from "@/lib/email/resend"

const CITY_AREA_CODES: Record<string, number> = {
  "montréal": 514, "montreal": 514,
  "laval": 450, "longueuil": 450, "brossard": 450, "repentigny": 450,
  "terrebonne": 450, "blainville": 450, "mirabel": 450, "mascouche": 450,
  "saint-jérôme": 450, "saint-jerome": 450, "granby": 450,
  "saint-hyacinthe": 450, "vaudreuil-dorion": 450,
  "québec": 418, "quebec": 418, "saguenay": 418, "lévis": 418, "levis": 418,
  "gatineau": 819, "sherbrooke": 819, "trois-rivières": 819,
  "trois-rivieres": 819, "drummondville": 819, "shawinigan": 819,
  "toronto": 416, "mississauga": 905, "brampton": 905, "hamilton": 905,
  "ottawa": 613, "london": 519, "kitchener": 519, "windsor": 519,
  "vancouver": 604, "surrey": 604, "burnaby": 604, "victoria": 250,
  "calgary": 403, "edmonton": 780, "winnipeg": 204,
  "regina": 306, "saskatoon": 306, "halifax": 902,
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
      selectedServices,
      customServices,
      hours,
      bookingSystem,
    } = body

    const allServices = [
      ...selectedServices,
      ...customServices
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    ]

    const ownerName = `${ownerFirstName} ${ownerLastName}`.trim()

    const clinicConfig: Record<string, unknown> = {
      agent_name: agentName || "Sofia",
      tone,
      languages: language,
      owner_first_name: ownerFirstName,
      owner_last_name: ownerLastName,
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_phone: ownerPhone,
      city,
      keyword_boost: allServices,
      booking_system: bookingSystem,
    }

    // 1. Create clinic
    const clinicId = await createClinic({
      name: clinicName,
      owner_email: ownerEmail,
      is_active: false,
      services: allServices,
      hours,
      clinic_config: clinicConfig,
    })

    // 2. Purchase Twilio number — prefer matching area code
    let twilioNumber: string | null = null
    try {
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
      const areaCode = getAreaCode(city)
      let available = areaCode
        ? await twilioClient.availablePhoneNumbers("CA").local.list({ limit: 1, voiceEnabled: true, areaCode })
        : []

      if (available.length === 0) {
        available = await twilioClient.availablePhoneNumbers("CA").local.list({ limit: 1, voiceEnabled: true })
      }

      if (available.length > 0) {
        const purchased = await twilioClient.incomingPhoneNumbers.create({
          phoneNumber: available[0].phoneNumber,
          friendlyName: clinicName,
        })
        twilioNumber = purchased.phoneNumber
        await updateClinicTwilioNumber(clinicId, twilioNumber)
      }
    } catch (twilioErr) {
      console.error("Twilio error (non-fatal):", twilioErr)
    }

    // 3. Create agent locations record
    await createLocation({
      clinic_id: clinicId,
      twilio_phone_number: twilioNumber,
      name: clinicName,
      hours,
      services: allServices,
      is_active: false,
    }).catch((err) => console.error("Location create error (non-fatal):", err))

    // 4. Create auth user
    const tempPassword = generateTempPassword()
    await createAuthUser(ownerEmail, tempPassword)

    // 5. Send welcome email to clinic owner
    await sendWelcomeEmail({
      clinicName,
      agentName: agentName || "Sofia",
      ownerEmail,
      ownerFirstName,
      tempPassword,
    })

    // 6. Notify Jonathan
    await sendAdminNotification({
      clinicId,
      clinicName,
      ownerName,
      ownerEmail,
      ownerPhone,
      city,
      agentName: agentName || "Sofia",
      services: allServices,
      bookingSystem,
      language,
    }).catch((err) => console.error("Admin notification error (non-fatal):", err))

    return NextResponse.json({
      success: true,
      clinicId,
      agentName: agentName || "Sofia",
      clinicName,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("Onboard error:", message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
