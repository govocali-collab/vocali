import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyElevenLabsSignature } from "@/lib/voice/security"

/**
 * Webhook d'initialisation de conversation pour l'Agent ElevenLabs (appels
 * Twilio entrants). ElevenLabs appelle ce endpoint au DÉBUT de chaque appel avec
 * le numéro composé (called_number). On identifie l'emplacement (location) de la
 * clinique, on charge sa connaissance et on renvoie :
 *   - dynamic_variables  → remplit {{business_name}}, {{knowledge_base}}, etc.
 *   - conversation_config_override → first message + langue par clinique
 *
 * Remplace l'ancien moteur vocal (VOICE_AGENT_WEBHOOK_URL → service externe).
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text()

    if (!(await verifyElevenLabsSignature(raw, req.headers.get("ElevenLabs-Signature")))) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = raw ? JSON.parse(raw) : {}
    const calledNumber = String(body.called_number || body.agent_number || "")
    const callerId = String(body.caller_id || body.from_number || "")
    const callSid = String(body.call_sid || "")

    const supabase = admin()

    // 1) Identifier l'emplacement par le numéro composé (fail-safe multi-tenant :
    // aucun fallback sur une autre clinique).
    const { data: location } = await supabase
      .from("locations")
      .select(
        "id, clinic_id, name, agent_name, tone, address, city, hours, services, faq, trainings, prompt_additions, custom_rules, callback_promise, booking_mode, transfer_phone, twilio_phone_number, website_url",
      )
      .eq("twilio_phone_number", calledNumber)
      .maybeSingle()

    if (!location) {
      console.warn(`[voice.init] Aucun emplacement pour called_number=${calledNumber}`)
      return NextResponse.json(neutralPayload())
    }

    // 2) Le courriel de la clinique (les locations ne le stockent pas).
    const { data: clinic } = await supabase
      .from("clinics")
      .select("name, owner_email")
      .eq("id", location.clinic_id)
      .maybeSingle()

    const agentName = location.agent_name || "Alexandra"
    const bizName = location.name || clinic?.name || "notre clinique"

    // 3) Créer la session d'appel (le webhook post-call la complétera). Idempotent.
    if (callSid) {
      await supabase
        .from("call_sessions")
        .upsert(
          { call_sid: callSid, location_id: location.id, caller_phone: callerId || null, language: "fr" },
          { onConflict: "call_sid" },
        )
    }

    // 4) Message d'accueil avec avis d'enregistrement (Loi 25).
    const firstMessage = `${bizName} bonjour, je suis ${agentName}. Pour la qualité de notre service, cet appel pourrait être enregistré. Comment puis-je vous aider aujourd'hui ?`

    return NextResponse.json({
      type: "conversation_initiation_client_data",
      dynamic_variables: {
        business_name: bizName,
        receptionist_name: agentName,
        business_hours: formatHours(location.hours),
        address: [location.address, location.city].filter(Boolean).join(", ") || "-",
        phone: location.transfer_phone || location.twilio_phone_number || "-",
        email: clinic?.owner_email || "-",
        knowledge_base: buildKnowledge(location),
        custom_instructions: buildCustomInstructions(location),
      },
      conversation_config_override: {
        agent: { first_message: firstMessage, language: "fr" },
      },
    })
  } catch (error) {
    console.error("[voice.init] échec", error)
    return NextResponse.json(neutralPayload())
  }
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function neutralPayload() {
  return {
    type: "conversation_initiation_client_data",
    dynamic_variables: {
      business_name: "notre clinique",
      receptionist_name: "la réceptionniste",
      business_hours: "-",
      address: "-",
      phone: "-",
      email: "-",
      knowledge_base: "Aucune information disponible.",
      custom_instructions: "",
    },
    conversation_config_override: {
      agent: {
        first_message: "Bonjour, merci de votre appel. Comment puis-je vous aider ?",
        language: "fr",
      },
    },
  }
}

const EN_TO_FR_DAY: Record<string, string> = {
  monday: "lundi", tuesday: "mardi", wednesday: "mercredi", thursday: "jeudi",
  friday: "vendredi", saturday: "samedi", sunday: "dimanche",
}

function formatHours(hours: unknown): string {
  if (!hours || typeof hours !== "object") return "-"
  const h = hours as Record<string, string | null>
  const parts: string[] = []
  for (const [en, fr] of Object.entries(EN_TO_FR_DAY)) {
    const v = h[en]
    parts.push(v ? `${fr} de ${v.replace("–", " à ")}` : `${fr} fermé`)
  }
  if (typeof h.notes === "string" && h.notes.trim()) parts.push(h.notes.trim())
  return parts.join(", ")
}

function buildKnowledge(loc: Record<string, unknown>): string {
  const sections: string[] = []

  const services = Array.isArray(loc.services) ? loc.services : []
  if (services.length) {
    const lines = services.map((s) => {
      if (s && typeof s === "object") {
        const o = s as Record<string, unknown>
        const bits = [o.price_range, o.duration].filter((x) => x && x !== "Sur demande").join(", ")
        return `- ${o.name}${bits ? ` (${bits})` : ""}${o.description ? ` : ${o.description}` : ""}`
      }
      return `- ${String(s)}`
    })
    sections.push(`SERVICES OFFERTS :\n${lines.join("\n")}`)
  }

  const faq = Array.isArray(loc.faq) ? loc.faq : []
  if (faq.length) {
    const lines = faq.map((f) => {
      const o = (f || {}) as Record<string, unknown>
      return `- Q : ${o.question ?? ""} R : ${o.answer ?? ""}`
    })
    sections.push(`QUESTIONS FRÉQUENTES :\n${lines.join("\n")}`)
  }

  const trainings = Array.isArray(loc.trainings) ? loc.trainings : []
  if (trainings.length) {
    const lines = trainings.map((t) =>
      t && typeof t === "object" ? `- ${JSON.stringify(t)}` : `- ${String(t)}`,
    )
    sections.push(`FORMATIONS :\n${lines.join("\n")}`)
  }

  return sections.join("\n\n") || "Aucune information détaillée disponible."
}

function buildCustomInstructions(loc: Record<string, unknown>): string {
  const parts: string[] = []
  if (loc.tone) parts.push(`Ton à adopter : ${loc.tone}.`)
  if (loc.booking_mode) {
    const promise = loc.callback_promise || "dans les plus brefs délais"
    parts.push(`Mode de réservation : ${loc.booking_mode}. Promesse de rappel : ${promise}.`)
  }
  if (loc.prompt_additions) parts.push(String(loc.prompt_additions))
  if (loc.custom_rules) parts.push(String(loc.custom_rules))
  return parts.join("\n") || "Aucune instruction particulière."
}
