import { NextRequest, NextResponse } from "next/server"
import { getLeadById, markLeadImported } from "@/lib/supabase/scraper"
import { createProspect } from "@/lib/supabase/prospects"
import type { ProspectStatus } from "@/lib/supabase/prospects"

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json() as {
    ids?: string[]
    status?: ProspectStatus
    source?: string
  }

  const { ids = [], status = "nouveau", source = "Scraper Google Maps" } = body

  if (ids.length === 0) {
    return NextResponse.json({ count: 0, prospectIds: [] })
  }

  const prospectIds: string[] = []

  for (const id of ids) {
    const lead = await getLeadById(id)
    if (!lead) continue

    const notesParts: string[] = []
    if (lead.website) notesParts.push(`Site web: ${lead.website}`)
    if (lead.instagram) notesParts.push(`Instagram: ${lead.instagram}`)
    if (lead.booking_platform) notesParts.push(`Booking: ${lead.booking_platform}`)
    if (lead.rating !== null) notesParts.push(`Note Google: ${lead.rating}/5 (${lead.review_count ?? 0} avis)`)
    if (lead.google_cid) notesParts.push(`Google CID: ${lead.google_cid}`)
    const notes = notesParts.length > 0 ? notesParts.join("\n") : null

    const prospect = await createProspect({
      clinic_name: lead.business_name,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      status,
      source: source || "Scraper Google Maps",
      notes,
    })

    await markLeadImported(lead.id, prospect.id)
    prospectIds.push(prospect.id)
  }

  return NextResponse.json({ count: prospectIds.length, prospectIds })
}
