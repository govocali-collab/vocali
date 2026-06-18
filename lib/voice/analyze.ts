import Anthropic from "@anthropic-ai/sdk"

// Analyse post-appel : extrait un résumé + les infos de lead/rendez-vous d'une
// transcription, en JSON structuré via tool_use (Claude Haiku — rapide, économe).

export type CallAnalysis = {
  summary: string
  is_lead: boolean
  name: string | null
  phone: string | null
  email: string | null
  service_interest: string | null
  preferred_date: string | null
  preferred_time: string | null
  notes: string | null
  appointment_requested: boolean
}

const EMPTY: CallAnalysis = {
  summary: "Aucun échange enregistré.",
  is_lead: false,
  name: null,
  phone: null,
  email: null,
  service_interest: null,
  preferred_date: null,
  preferred_time: null,
  notes: null,
  appointment_requested: false,
}

export async function analyzeTranscript(transcript: string): Promise<CallAnalysis> {
  if (!transcript.trim() || !process.env.ANTHROPIC_API_KEY) return EMPTY

  const client = new Anthropic()

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      tool_choice: { type: "tool", name: "save_call_analysis" },
      tools: [
        {
          name: "save_call_analysis",
          description:
            "Enregistre l'analyse d'un appel téléphonique entre une réceptionniste IA et une cliente d'une clinique d'esthétique au Québec. N'invente AUCUNE donnée : si une info n'a pas été dite clairement, mets null.",
          input_schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description:
                  "1 à 2 phrases en français québécois, ton neutre : motif de l'appel, infos clés, action à faire par la clinique.",
              },
              is_lead: {
                type: "boolean",
                description:
                  "true si l'appel demande un suivi (rendez-vous, message, question sans réponse, coordonnées laissées). false si simple info sans suivi.",
              },
              name: { type: "string", description: "Prénom (et nom si donné) de la cliente, sinon null." },
              phone: { type: "string", description: "Numéro de rappel donné PENDANT l'appel, chiffres seulement, sinon null." },
              email: { type: "string", description: "Courriel si donné, sinon null." },
              service_interest: { type: "string", description: "Service ou soin mentionné, sinon null." },
              preferred_date: { type: "string", description: "Date souhaitée en texte libre, sinon null." },
              preferred_time: { type: "string", description: "Moment souhaité en texte libre, sinon null." },
              notes: { type: "string", description: "Message ou détail utile pour la clinique, sinon null." },
              appointment_requested: {
                type: "boolean",
                description: "true si la cliente veut prendre, déplacer, confirmer ou annuler un rendez-vous.",
              },
            },
            required: ["summary", "is_lead", "appointment_requested"],
          },
        },
      ],
      messages: [
        { role: "user", content: `Analyse cette transcription d'appel :\n\n${transcript}` },
      ],
    })

    const block = res.content.find((b) => b.type === "tool_use")
    if (!block || block.type !== "tool_use") return EMPTY
    const input = block.input as Partial<CallAnalysis>

    return {
      summary: clean(input.summary) || "Résumé indisponible.",
      is_lead: Boolean(input.is_lead) || Boolean(input.appointment_requested),
      name: clean(input.name),
      phone: cleanPhone(input.phone),
      email: clean(input.email),
      service_interest: clean(input.service_interest),
      preferred_date: clean(input.preferred_date),
      preferred_time: clean(input.preferred_time),
      notes: clean(input.notes),
      appointment_requested: Boolean(input.appointment_requested),
    }
  } catch (e) {
    console.error("[voice.analyze] échec", e)
    return EMPTY
  }
}

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null
  const t = value.trim()
  if (!t || t.toLowerCase() === "null") return null
  return t.slice(0, 500)
}

function cleanPhone(value: unknown): string | null {
  const s = clean(value)
  if (!s) return null
  const digits = s.replace(/[^\d+]/g, "")
  return digits.length >= 7 ? digits.slice(0, 20) : null
}
