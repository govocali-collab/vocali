import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyElevenLabsSignature } from "@/lib/voice/security"
import { analyzeTranscript } from "@/lib/voice/analyze"

/**
 * Webhook post-appel de l'Agent ElevenLabs. Reçoit la transcription complète à la
 * fin de l'appel, la sauve dans call_sessions, l'analyse avec Claude (résumé +
 * lead) et crée un lead si l'appel demande un suivi.
 *
 * Remplace la capture qui se faisait dans le moteur vocal externe.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text()

    if (!(await verifyElevenLabsSignature(raw, req.headers.get("ElevenLabs-Signature")))) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const payload = raw ? JSON.parse(raw) : {}
    const data = payload.data || payload
    const pc = data?.metadata?.phone_call || {}

    const callSid = String(pc.call_sid || data?.conversation_id || "")
    const agentNumber = String(pc.agent_number || "") // numéro de la clinique (appelé)
    const callerNumber = String(pc.external_number || "") // numéro de la cliente
    const durationSec = Number(data?.metadata?.call_duration_secs || 0) || null

    if (!callSid) {
      console.warn("[voice.postcall] aucun call_sid/conversation_id — ignoré")
      return new NextResponse("ok", { status: 200 })
    }

    // Reconstruit le transcript. Le dashboard attend un TABLEAU [{role, content}]
    // (role "assistant" = agent). On garde aussi une version texte pour Claude.
    const turns: Array<{ role?: string; message?: string }> = Array.isArray(data?.transcript)
      ? data.transcript
      : []
    const cleanTurns = turns.filter((t) => t && typeof t.message === "string" && t.message!.trim())
    const transcriptArray = cleanTurns.map((t) => ({
      role: t.role === "agent" ? "assistant" : "user",
      content: t.message!.trim(),
    }))
    const transcriptText = cleanTurns
      .map((t) => `${t.role === "user" ? "Client" : "IA"}: ${t.message!.trim()}`)
      .join("\n")

    // Résumé : ElevenLabs en génère déjà un (gratuit, fiable) → on l'utilise en
    // priorité, sans dépendre d'Anthropic.
    const elevenSummary =
      typeof data?.analysis?.transcript_summary === "string" ? data.analysis.transcript_summary.trim() : ""

    const supabase = admin()

    // 1) Retrouver la session (créée par voice/init) → location_id.
    const { data: session } = await supabase
      .from("call_sessions")
      .select("id, location_id")
      .eq("call_sid", callSid)
      .maybeSingle()

    let locationId = session?.location_id as string | null | undefined
    if (!locationId && agentNumber) {
      const { data: loc } = await supabase
        .from("locations")
        .select("id")
        .eq("twilio_phone_number", agentNumber)
        .maybeSingle()
      locationId = loc?.id
    }

    // 2) Analyse IA (extraction du lead via Claude — résumé en FRANÇAIS québécois).
    // On privilégie le résumé français de Claude ; on retombe sur celui d'ElevenLabs
    // (anglais) uniquement si Claude n'a pas produit de vrai résumé.
    const analysis = await analyzeTranscript(transcriptText)
    const claudeSummary =
      analysis.summary &&
      !["Aucun échange enregistré.", "Résumé indisponible."].includes(analysis.summary)
        ? analysis.summary
        : ""
    const summary = claudeSummary || elevenSummary || analysis.summary

    // 3) Upsert de la session avec transcript (tableau) + résumé + durée.
    const { data: upserted } = await supabase
      .from("call_sessions")
      .upsert(
        {
          call_sid: callSid,
          location_id: locationId ?? null,
          caller_phone: callerNumber || null,
          transcript: transcriptArray,
          conversation_summary: summary,
          duration_sec: durationSec,
          language: "fr",
        },
        { onConflict: "call_sid" },
      )
      .select("id")
      .maybeSingle()

    const sessionId = upserted?.id || session?.id

    // 4) Créer un lead dès qu'il y a une vraie conversation (au moins un tour
    // client). On NE dépend PAS de Claude pour l'existence du lead : les détails
    // (nom, service…) sont enrichis par Claude s'il est disponible, sinon null.
    // Idempotent : un seul lead par session.
    const hasUserTurn = transcriptArray.some((t) => t.role === "user")
    if (sessionId && locationId && hasUserTurn) {
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("call_session_id", sessionId)
        .maybeSingle()

      if (!existing) {
        await supabase.from("leads").insert({
          call_session_id: sessionId,
          location_id: locationId,
          // La table leads n'a pas de colonne `phone` : on garde le numéro de
          // rappel donné pendant l'appel (sinon l'identifiant de l'appelant).
          caller_phone: analysis.phone || callerNumber || null,
          name: analysis.name,
          email: analysis.email,
          service_interest: analysis.service_interest,
          preferred_date: analysis.preferred_date,
          preferred_time: analysis.preferred_time,
          notes: analysis.notes || summary,
          appointment_requested: analysis.appointment_requested,
          status: "nouveau",
        })
      }
    }

    return new NextResponse("ok", { status: 200 })
  } catch (error) {
    console.error("[voice.postcall] échec", error)
    // 200 quand même : ElevenLabs ne doit pas réessayer en boucle.
    return new NextResponse("ok", { status: 200 })
  }
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
