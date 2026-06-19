import Anthropic from "@anthropic-ai/sdk"

// Analyse d'une conversation de DÉMO (agent Salon Élégance). Détecte si la
// personne qui a testé la démo est un PROSPECT (propriétaire de clinique/salon
// intéressé par Vocali pour son entreprise) et extrait ses coordonnées.

export type DemoProspect = {
  is_prospect: boolean
  owner_name: string | null
  clinic_name: string | null
  phone: string | null
  email: string | null
  city: string | null
  notes: string | null
}

const EMPTY: DemoProspect = {
  is_prospect: false,
  owner_name: null,
  clinic_name: null,
  phone: null,
  email: null,
  city: null,
  notes: null,
}

export async function analyzeDemoProspect(transcript: string): Promise<DemoProspect> {
  if (!transcript.trim() || !process.env.ANTHROPIC_API_KEY) return EMPTY

  const client = new Anthropic()
  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      tool_choice: { type: "tool", name: "save_demo_prospect" },
      tools: [
        {
          name: "save_demo_prospect",
          description:
            "Analyse une conversation de DÉMONSTRATION d'une réceptionniste virtuelle (Vocali). La personne qui appelle teste la démo ; certaines sont des propriétaires de clinique/salon intéressées à avoir Vocali pour leur propre entreprise. N'invente AUCUNE donnée : si une info n'a pas été dite, mets null.",
          input_schema: {
            type: "object",
            properties: {
              is_prospect: {
                type: "boolean",
                description:
                  "true SEULEMENT si la personne a manifesté de l'intérêt pour Vocali pour SON entreprise (clinique/salon) ET a laissé au moins une coordonnée (téléphone ou courriel). false si elle a juste testé la démo sans intérêt commercial ou sans laisser de contact.",
              },
              owner_name: { type: "string", description: "Prénom/nom de la personne intéressée, sinon null." },
              clinic_name: { type: "string", description: "Nom de sa clinique/salon/entreprise si mentionné, sinon null." },
              phone: { type: "string", description: "Numéro de téléphone laissé, chiffres seulement, sinon null." },
              email: { type: "string", description: "Courriel laissé, sinon null." },
              city: { type: "string", description: "Ville mentionnée, sinon null." },
              notes: {
                type: "string",
                description: "1-2 phrases en français : son contexte/intérêt (type de clinique, besoin, questions posées).",
              },
            },
            required: ["is_prospect"],
          },
        },
      ],
      messages: [{ role: "user", content: `Voici la transcription d'un appel de démo :\n\n${transcript}` }],
    })

    const block = res.content.find((b) => b.type === "tool_use")
    if (!block || block.type !== "tool_use") return EMPTY
    const input = block.input as Partial<DemoProspect>

    return {
      is_prospect: Boolean(input.is_prospect),
      owner_name: clean(input.owner_name),
      clinic_name: clean(input.clinic_name),
      phone: cleanPhone(input.phone),
      email: clean(input.email),
      city: clean(input.city),
      notes: clean(input.notes),
    }
  } catch (e) {
    console.error("[demo.prospect] échec", e)
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
