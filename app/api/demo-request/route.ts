import { NextResponse } from "next/server"
import { createProspect } from "@/lib/supabase/prospects"
import { sendDemoRequestEmail } from "@/lib/email/demo-request"

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
  const fullName = str(body.fullName)
  const company = str(body.company)
  const email = str(body.email)
  const phone = str(body.phone)
  const message = str(body.message)

  if (!fullName || !email || !phone) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 })
  }

  // 1) Sauvegarde dans la base existante (table prospects).
  let prospectId: string | null = null
  try {
    const prospect = await createProspect({
      clinic_name: company || fullName,
      owner_name: fullName,
      email,
      phone,
      source: "Demande de démo (pop-up)",
      status: "nouveau",
      notes: message || null,
    })
    prospectId = prospect.id
  } catch (e) {
    console.error("demo-request: échec sauvegarde prospect", e)
  }

  // 2) Notification courriel à contact@vocali.ca.
  let emailOk = false
  try {
    await sendDemoRequestEmail({ fullName, company, email, phone, message, prospectId })
    emailOk = true
  } catch (e) {
    console.error("demo-request: échec envoi courriel", e)
  }

  if (!prospectId && !emailOk) {
    return NextResponse.json({ error: "Le serveur n'a pas pu traiter la demande." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
