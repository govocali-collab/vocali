import { NextResponse } from "next/server"
import { upsertDemoAttribution } from "@/lib/supabase/demo-stats"

/**
 * Appelé par la page /demo au démarrage d'une conversation : enregistre la
 * provenance (src, utm, referrer) liée au conversation_id. La durée et le statut
 * prospect sont complétés plus tard par le webhook post-appel.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const conversationId = String(body?.conversation_id || "").trim()
    if (!conversationId) return NextResponse.json({ ok: false }, { status: 200 })

    const s = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 200) || null : null)
    await upsertDemoAttribution({
      conversation_id: conversationId,
      src: s(body?.src),
      referrer: s(body?.referrer),
      utm_source: s(body?.utm_source),
      utm_medium: s(body?.utm_medium),
      utm_campaign: s(body?.utm_campaign),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
