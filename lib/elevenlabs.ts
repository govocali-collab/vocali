// Intégration ElevenLabs (Agents) — import de numéros Twilio + voix par défaut.

const PHONE_API = "https://api.elevenlabs.io/v1/convai/phone-numbers"

// Voix par défaut du modèle officiel Vocali. Surchargeable par clinique via
// clinic_config.voice_id (voir le webhook voice/init).
// Claudia — voix québécoise (accent QC clair et chaleureux). Remplace Amélie
// (UJCi4DDncuo0VJDSIegj) qui sonnait trop neutre/France.
export const ELEVENLABS_DEFAULT_VOICE_ID = "WW0JfNPk5DgcQdM0d6X6"

/**
 * Importe un numéro Twilio dans ElevenLabs et l'assigne à l'agent Vocali.
 * Renvoie le phone_number_id ElevenLabs. Lève une erreur si la config manque
 * ou si l'API échoue (à attraper par l'appelant pour un message clair).
 *
 * Requiert les variables d'env : ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID,
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.
 */
export async function importNumberToElevenLabs(phoneNumber: string, label: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY manquant dans l'environnement")
  const agentId = process.env.ELEVENLABS_AGENT_ID
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error("Identifiants Twilio manquants")

  // 1) Import du numéro (ElevenLabs reconfigure automatiquement le webhook Twilio).
  const res = await fetch(PHONE_API, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, label, sid, token, provider: "twilio" }),
  })
  if (!res.ok) {
    throw new Error(`Import ElevenLabs échoué (${res.status}) : ${await res.text()}`)
  }
  const data = (await res.json()) as { phone_number_id?: string }
  const phoneNumberId = data.phone_number_id
  if (!phoneNumberId) throw new Error("ElevenLabs n'a pas renvoyé de phone_number_id")

  // 2) Assignation à l'agent Vocali (l'endpoint d'import n'accepte pas agent_id).
  if (agentId) {
    const patch = await fetch(`${PHONE_API}/${phoneNumberId}`, {
      method: "PATCH",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    })
    if (!patch.ok) {
      throw new Error(`Assignation de l'agent échouée (${patch.status}) : ${await patch.text()}`)
    }
  } else {
    console.warn("[elevenlabs] ELEVENLABS_AGENT_ID manquant — numéro importé mais non assigné à un agent")
  }

  return phoneNumberId
}
