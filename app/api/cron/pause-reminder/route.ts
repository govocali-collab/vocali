import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPauseReminderNotification } from "@/lib/email/resend"

export const runtime = "nodejs"

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find clinics paused for 24h+ with no reminder sent yet
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: clinics, error } = await admin
    .from("clinics")
    .select("id, name, owner_email, clinic_config, paused_at")
    .eq("is_active", false)
    .eq("pause_reminder_sent", false)
    .not("paused_at", "is", null)
    .lte("paused_at", cutoff)

  if (error) {
    console.error("Pause reminder cron error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!clinics || clinics.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const clinic of clinics) {
    const config = (clinic.clinic_config ?? {}) as Record<string, string>
    try {
      await sendPauseReminderNotification({
        clinicName: clinic.name,
        agentName: config.agent_name ?? "Alexandra",
        ownerName: [config.owner_first_name, config.owner_last_name].filter(Boolean).join(" "),
        ownerEmail: clinic.owner_email,
        clinicId: clinic.id,
        pausedAt: clinic.paused_at,
      })

      // Mark reminder as sent so we don't send again
      await admin
        .from("clinics")
        .update({ pause_reminder_sent: true })
        .eq("id", clinic.id)

      sent++
    } catch (err) {
      console.error(`Reminder failed for clinic ${clinic.id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
