import { NextResponse } from "next/server"
import twilio from "twilio"
import { createClinic, updateClinicTwilioNumber, createAuthUser, syncLocationFromClinic } from "@/lib/supabase/clinics"
import { importNumberToElevenLabs } from "@/lib/elevenlabs"
import { getAreaCode } from "@/lib/city-area-codes"
import { sendWelcomeEmail } from "@/lib/email/resend"

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
      phoneNumber, // numéro Twilio choisi par l'admin (optionnel)
    } = body

    const allServices = [
      ...selectedServices,
      ...customServices
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    ]

    const clinicConfig: Record<string, unknown> = {
      agent_name: agentName || "Sarah",
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

      // Numéro choisi par l'admin → on l'achète directement. Sinon, recherche
      // automatique par indicatif régional (comportement de repli).
      let numberToBuy: string
      if (phoneNumber) {
        numberToBuy = phoneNumber
      } else {
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
        numberToBuy = available[0].phoneNumber
      }

      const purchased = await twilioClient.incomingPhoneNumbers.create({
        phoneNumber: numberToBuy,
        friendlyName: clinicName,
      })
      twilioNumber = purchased.phoneNumber
      await updateClinicTwilioNumber(clinicId, twilioNumber)
      await syncLocationFromClinic(clinicId).catch((e) =>
        console.error("Location sync (non-fatal):", e)
      )
      // Importer le numéro dans ElevenLabs et l'assigner à l'agent Vocali.
      await importNumberToElevenLabs(twilioNumber, clinicName)
      console.log(`[Twilio+ElevenLabs] Purchased & imported ${twilioNumber} for ${clinicName}`)
    } catch (twilioErr) {
      twilioError = twilioErr instanceof Error ? twilioErr.message : String(twilioErr)
      console.error("Twilio error (non-fatal):", twilioError)
    }

    // 3. Create Supabase Auth user
    const tempPassword = generateTempPassword()
    await createAuthUser(ownerEmail, tempPassword, clinicName)

    // 4. Send welcome email
    await sendWelcomeEmail({
      clinicName,
      agentName: agentName || "Sarah",
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
