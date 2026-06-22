import { NextResponse } from "next/server"
import { createProspect } from "@/lib/supabase/prospects"
import { sendFounderApplicationEmail } from "@/lib/email/resend"

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

  if (!fullName || !company || !email || !phone) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 })
  }

  const businessType = str(body.businessType) || null
  const callVolume = str(body.callVolume) || null
  const missedCalls = str(body.missedCalls) || null
  const challenge = str(body.challenge) || null
  const urgency = str(body.urgency) || null

  const notes = [
    businessType && `Type d'entreprise : ${businessType}`,
    callVolume && `Appels par semaine : ${callVolume}`,
    missedCalls && `Manque des appels : ${missedCalls}`,
    urgency && `Souhaite régler : ${urgency}`,
    challenge && `Plus grand défi : ${challenge}`,
  ]
    .filter(Boolean)
    .join("\n")

  // 1) Sauvegarde dans la base existante (table prospects).
  let prospectId: string | null = null
  try {
    const prospect = await createProspect({
      clinic_name: company,
      owner_name: fullName,
      email,
      phone,
      source: "Formulaire fondateur (démo)",
      status: "nouveau",
      notes: notes || null,
    })
    prospectId = prospect.id
  } catch (e) {
    console.error("founder-application: échec sauvegarde prospect", e)
  }

  // 2) Notification courriel.
  let emailOk = false
  try {
    await sendFounderApplicationEmail({
      fullName,
      company,
      email,
      phone,
      businessType,
      callVolume,
      missedCalls,
      challenge,
      urgency,
      prospectId,
    })
    emailOk = true
  } catch (e) {
    console.error("founder-application: échec envoi courriel", e)
  }

  // Si rien n'a fonctionné, signaler l'erreur pour permettre une nouvelle tentative.
  if (!prospectId && !emailOk) {
    return NextResponse.json({ error: "Le serveur n'a pas pu traiter la demande." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
