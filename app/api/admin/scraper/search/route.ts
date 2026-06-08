import { NextRequest, NextResponse } from "next/server"
import {
  searchPlaces,
  getPlaceDetails,
  extractCidFromUrl,
  extractFromAddressComponents,
  calculateLeadScore,
} from "@/lib/google-places"
import {
  createSession,
  updateSession,
  insertLeads,
} from "@/lib/supabase/scraper"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 500 })
  }

  const body = await req.json() as {
    businessType?: string
    city?: string
    province?: string
    maxResults?: number
    language?: string
  }

  const { businessType = "", city = "", province = "", maxResults = 20, language = "fr" } = body

  const session = await createSession({
    business_type: businessType,
    city,
    province,
    max_results: Math.min(maxResults, 40),
    language,
    status: "running",
  })

  try {
    const query = `${businessType} ${city} ${province} Canada`
    const lang = language === "both" ? "fr" : language

    // Collect place IDs — up to 2 pages, capped at min(maxResults, 40)
    const cap = Math.min(maxResults, 40)
    const placeIds: string[] = []

    const page1 = await searchPlaces(query, apiKey, lang)
    for (const r of page1.results) {
      if (placeIds.length >= cap) break
      placeIds.push(r.place_id)
    }

    if (page1.nextPageToken && placeIds.length < cap) {
      await delay(2000) // Google requires ~2s before next_page_token is valid
      const page2 = await searchPlaces(query, apiKey, lang, page1.nextPageToken)
      for (const r of page2.results) {
        if (placeIds.length >= cap) break
        placeIds.push(r.place_id)
      }
    }

    // Fetch details in batches of 10
    const allDetails = []
    for (let i = 0; i < placeIds.length; i += 10) {
      const batch = placeIds.slice(i, i + 10)
      const batchResults = await Promise.all(
        batch.map((id) => getPlaceDetails(id, apiKey, lang))
      )
      allDetails.push(...batchResults)
    }

    // Build lead rows
    const leadRows = allDetails
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .map((d) => {
        const { city: detailCity, province: detailProvince } =
          extractFromAddressComponents(d.address_components)

        const googleCid = extractCidFromUrl(d.url)

        // Determine last review date
        let lastReviewDate: string | null = null
        if (d.reviews && d.reviews.length > 0) {
          const newest = d.reviews.reduce((a, b) => (a.time > b.time ? a : b))
          lastReviewDate = new Date(newest.time * 1000).toISOString()
        }

        const { score, tag } = calculateLeadScore({
          review_count: d.user_ratings_total,
          rating: d.rating,
          has_website: !!d.website,
          has_email: false,
          has_instagram: false,
          has_booking: false,
          last_review_date: lastReviewDate,
        })

        return {
          session_id: session.id,
          place_id: d.place_id,
          business_name: d.name,
          address: d.formatted_address,
          city: detailCity ?? city,
          province: detailProvince ?? province,
          phone: d.formatted_phone_number,
          website: d.website,
          google_cid: googleCid,
          rating: d.rating,
          review_count: d.user_ratings_total,
          last_review_date: lastReviewDate,
          business_status: d.business_status,
          enrichment_status: "scraped",
          lead_score: score,
          score_tag: tag,
          imported: false,
        }
      })

    const leads = await insertLeads(leadRows)
    await updateSession(session.id, { status: "done", result_count: leads.length })

    const updatedSession = { ...session, status: "done", result_count: leads.length }
    return NextResponse.json({ session: updatedSession, leads })
  } catch (err) {
    await updateSession(session.id, { status: "error" })
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
