import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendSupportMessage } from "@/lib/email/resend"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message || !String(message).trim()) {
      return NextResponse.json({ success: false, error: "Message vide" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: clinic } = await admin
      .from("clinics")
      .select("name")
      .eq("owner_email", user.email)
      .single()

    await sendSupportMessage({
      clinicName: clinic?.name ?? "Clinique",
      email: user.email,
      message: String(message).slice(0, 5000),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}
