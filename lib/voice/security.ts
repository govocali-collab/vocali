// Vérification de signature des webhooks ElevenLabs (Agents).
// Header `ElevenLabs-Signature` au format `t=<timestamp>,v0=<hmac sha256 hex>`,
// contenu signé = `${timestamp}.${rawBody}` (HMAC-SHA256, hex) avec le secret
// ELEVENLABS_WEBHOOK_SECRET. Tout en Web Crypto (compatible Node + Edge).

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)))
  let hex = ""
  for (const b of sig) hex += b.toString(16).padStart(2, "0")
  return hex
}

// Comparaison à temps constant (évite de fuiter l'égalité octet par octet).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

/**
 * Vérifie la signature d'un webhook ElevenLabs.
 * Fail-open : si ELEVENLABS_WEBHOOK_SECRET n'est pas configuré, on laisse passer
 * (pour ne rien casser pendant le rollout). Pose le secret dès que tout marche.
 */
export async function verifyElevenLabsSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET
  if (!secret) {
    console.warn("[elevenlabs] ELEVENLABS_WEBHOOK_SECRET absent — vérification ignorée")
    return true
  }
  if (!signatureHeader) return false

  const parts: Record<string, string> = {}
  for (const segment of signatureHeader.split(",")) {
    const i = segment.indexOf("=")
    if (i > 0) parts[segment.slice(0, i).trim()] = segment.slice(i + 1).trim()
  }
  const timestamp = parts["t"]
  const provided = parts["v0"]
  if (!timestamp || !provided) return false

  // Anti-rejeu : rejette les requêtes de plus de 30 min.
  const ts = Number(timestamp)
  if (Number.isFinite(ts) && Math.abs(Date.now() / 1000 - ts) > 1800) {
    console.warn("[elevenlabs] horodatage hors tolérance — rejeté")
    return false
  }

  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`)
  return timingSafeEqual(expected, provided)
}
