import { NextRequest, NextResponse } from "next/server"
import { scrapeWebsite, calculateLeadScore } from "@/lib/google-places"
import { getLeadById, updateLead } from "@/lib/supabase/scraper"

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json() as { id?: string }
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const lead = await getLeadById(id)
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  if (!lead.website) {
    const updated = await updateLead(id, { enrichment_status: "failed" })
    return NextResponse.json({ lead: updated })
  }

  const scrapeResult = await scrapeWebsite(lead.website)

  const { score, tag } = calculateLeadScore({
    review_count: lead.review_count,
    rating: lead.rating,
    has_website: !!lead.website,
    has_email: !!scrapeResult.email,
    has_instagram: !!scrapeResult.instagram,
    has_booking: !!scrapeResult.booking_platform,
    last_review_date: lead.last_review_date,
  })

  const updated = await updateLead(id, {
    email: scrapeResult.email,
    instagram: scrapeResult.instagram,
    booking_platform: scrapeResult.booking_platform,
    enrichment_status: "enriched",
    lead_score: score,
    score_tag: tag,
  })

  return NextResponse.json({ lead: updated })
}
