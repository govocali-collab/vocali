import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getAdminClient()

    // Get clinic to find owner email
    const { data: clinic } = await supabase
      .from("clinics")
      .select("owner_email")
      .eq("id", id)
      .single()

    // Delete clinic row
    const { error: clinicError } = await supabase
      .from("clinics")
      .delete()
      .eq("id", id)
    if (clinicError) throw new Error(clinicError.message)

    // Delete auth user if email exists
    if (clinic?.owner_email) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users?.find((u) => u.email === clinic.owner_email)
      if (user) {
        await supabase.auth.admin.deleteUser(user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
