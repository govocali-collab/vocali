import { NextResponse } from "next/server"
import { createProspect } from "@/lib/supabase/prospects"
import { sendGuideToVisitor, sendGuideLeadNotification } from "@/lib/email/guide"

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
  const fullName = str(body.fullName)
  const email = str(body.email)
  const phone = str(body.phone)
  const src = str(body.src) || null

  if (!email || !phone) {
    return NextResponse.json({ error: "Courriel et téléphone requis." }, { status: 400 })
  }

  // 1) Sauvegarde du prospect (base existante).
  let prospectId: string | null = null
  try {
    const prospect = await createProspect({
      clinic_name: fullName || "Téléchargement du guide",
      owner_name: fullName || null,
      email,
      phone,
      source: src ? `Guide PDF (${src})` : "Guide PDF",
      status: "nouveau",
    })
    prospectId = prospect.id
  } catch (e) {
    console.error("guide-request: échec sauvegarde prospect", e)
  }

  // 2) Envoi du guide au visiteur (par courriel).
  let sentToVisitor = false
  try {
    await sendGuideToVisitor(email, fullName || null)
    sentToVisitor = true
  } catch (e) {
    console.error("guide-request: échec envoi guide", e)
  }

  // 3) Notification interne.
  try {
    await sendGuideLeadNotification({ fullName, email, phone, prospectId })
  } catch (e) {
    console.error("guide-request: échec notif interne", e)
  }

  if (!sentToVisitor) {
    return NextResponse.json({ error: "L'envoi du guide a échoué." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
