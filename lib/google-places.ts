import type { ScoreTag } from "@/lib/supabase/scraper"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlaceBasic {
  place_id: string
  name: string
  formatted_address: string
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface PlaceReview {
  time: number
  rating: number
  text: string
  author_name: string
}

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  address_components: AddressComponent[]
  formatted_phone_number: string | null
  website: string | null
  url: string | null
  rating: number | null
  user_ratings_total: number | null
  reviews: PlaceReview[] | null
  business_status: string | null
}

export interface WebsiteScrapeResult {
  email: string | null
  instagram: string | null
  booking_platform: string | null
}

// ─── Text Search (Places API New — v1) ─────────────────────────────────────────

export async function searchPlaces(
  query: string,
  apiKey: string,
  language: string,
  pageToken?: string
): Promise<{ results: PlaceBasic[]; nextPageToken?: string }> {
  const body: Record<string, unknown> = {
    textQuery: query,
    languageCode: language,
    regionCode: "CA",
    pageSize: 20,
  }
  if (pageToken) body.pageToken = pageToken

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,nextPageToken",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { status?: string; message?: string } }
    throw new Error(`Places API error: ${err.error?.status ?? res.status} — ${err.error?.message ?? ""}`)
  }

  const json = (await res.json()) as {
    places?: Array<{ id: string; displayName?: { text: string }; formattedAddress?: string }>
    nextPageToken?: string
  }

  const results: PlaceBasic[] = (json.places ?? []).map((p) => ({
    place_id: p.id,
    name: p.displayName?.text ?? "",
    formatted_address: p.formattedAddress ?? "",
  }))

  return { results, nextPageToken: json.nextPageToken }
}

// ─── Place Details (Places API New — v1) ────────────────────────────────────────

const DETAILS_FIELD_MASK =
  "id,displayName,formattedAddress,addressComponents,nationalPhoneNumber,websiteUri,googleMapsUri,rating,userRatingCount,reviews,businessStatus"

export async function getPlaceDetails(
  placeId: string,
  apiKey: string,
  language: string
): Promise<PlaceDetails | null> {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(language)}`

  try {
    const res = await fetch(url, {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": DETAILS_FIELD_MASK },
    })
    if (!res.ok) return null

    const r = (await res.json()) as {
      id?: string
      displayName?: { text: string }
      formattedAddress?: string
      addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>
      nationalPhoneNumber?: string
      websiteUri?: string
      googleMapsUri?: string
      rating?: number
      userRatingCount?: number
      reviews?: Array<{ rating?: number; text?: { text: string }; authorAttribution?: { displayName: string }; publishTime?: string }>
      businessStatus?: string
    }

    return {
      place_id: r.id ?? placeId,
      name: r.displayName?.text ?? "",
      formatted_address: r.formattedAddress ?? "",
      address_components: (r.addressComponents ?? []).map((c) => ({
        long_name: c.longText,
        short_name: c.shortText,
        types: c.types,
      })),
      formatted_phone_number: r.nationalPhoneNumber ?? null,
      website: r.websiteUri ?? null,
      url: r.googleMapsUri ?? null,
      rating: r.rating ?? null,
      user_ratings_total: r.userRatingCount ?? null,
      reviews: (r.reviews ?? []).map((rv) => ({
        time: rv.publishTime ? Math.floor(Date.parse(rv.publishTime) / 1000) : 0,
        rating: rv.rating ?? 0,
        text: rv.text?.text ?? "",
        author_name: rv.authorAttribution?.displayName ?? "",
      })),
      business_status: r.businessStatus ?? null,
    }
  } catch {
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function extractCidFromUrl(url?: string | null): string | null {
  if (!url) return null
  const match = url.match(/cid=(\d+)/)
  return match ? match[1] : null
}

export function extractFromAddressComponents(
  components: AddressComponent[]
): { city: string | null; province: string | null } {
  let city: string | null = null
  let province: string | null = null

  for (const c of components) {
    if (c.types.includes("locality")) {
      city = c.long_name
    }
    if (c.types.includes("administrative_area_level_1")) {
      province = c.short_name
    }
  }

  return { city, province }
}

// ─── Website Scraping ─────────────────────────────────────────────────────────

const BOOKING_KEYWORDS: Record<string, string> = {
  vagaro: "Vagaro",
  mindbody: "Mindbody",
  "jane.app": "Jane",
  boulevard: "Boulevard",
  fresha: "Fresha",
  meevo: "Meevo",
}

export async function scrapeWebsite(url: string): Promise<WebsiteScrapeResult> {
  const result: WebsiteScrapeResult = {
    email: null,
    instagram: null,
    booking_platform: null,
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VocaliBot/1.0; +https://vocali.ca)",
      },
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) return result

    const html = await res.text()
    const lower = html.toLowerCase()

    // Email — find mailto: links
    const emailMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i)
    if (emailMatch) {
      result.email = emailMatch[1].toLowerCase()
    }

    // Instagram handle — exclude non-handle paths
    const igMatch = html.match(
      /instagram\.com\/(?!p\/|reel\/|stories\/|explore\/)([a-zA-Z0-9._]{1,30})/i
    )
    if (igMatch) {
      result.instagram = `https://instagram.com/${igMatch[1]}`
    }

    // Booking platform
    for (const [keyword, name] of Object.entries(BOOKING_KEYWORDS)) {
      if (lower.includes(keyword)) {
        result.booking_platform = name
        break
      }
    }
  } catch {
    // Network errors, timeouts — return empty result
  }

  return result
}

// ─── Lead Scoring ─────────────────────────────────────────────────────────────

interface ScoreInput {
  review_count?: number | null
  rating?: number | null
  has_website?: boolean
  has_email?: boolean
  has_instagram?: boolean
  has_booking?: boolean
  last_review_date?: string | null
}

export function calculateLeadScore(input: ScoreInput): { score: number; tag: ScoreTag } {
  let score = 0

  // Review count
  const rc = input.review_count ?? 0
  if (rc >= 40) score += 20
  else if (rc >= 20) score += 15
  else if (rc >= 10) score += 10
  else if (rc >= 5) score += 5

  // Rating
  const rating = input.rating ?? 0
  if (rating >= 4.5) score += 10
  else if (rating >= 4.0) score += 7
  else if (rating >= 3.5) score += 4

  // Presence signals
  if (input.has_website) score += 15
  if (input.has_email) score += 20
  if (input.has_instagram) score += 15
  if (input.has_booking) score += 15

  // Recent review (within 6 months)
  if (input.last_review_date) {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    if (new Date(input.last_review_date) >= sixMonthsAgo) {
      score += 5
    }
  }

  let tag: ScoreTag
  if (score >= 70) tag = "hot"
  else if (score >= 45) tag = "warm"
  else if (score >= 20) tag = "cool"
  else tag = "cold"

  return { score, tag }
}
