import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScoreTag = "hot" | "warm" | "cool" | "cold"

export interface ScraperSession {
  id: string
  created_at: string
  business_type: string | null
  city: string | null
  province: string | null
  max_results: number | null
  language: string | null
  result_count: number
  status: string
}

export interface ScraperLead {
  id: string
  created_at: string
  session_id: string | null
  place_id: string
  business_name: string
  address: string | null
  city: string | null
  province: string | null
  phone: string | null
  website: string | null
  google_cid: string | null
  rating: number | null
  review_count: number | null
  last_review_date: string | null
  business_status: string | null
  email: string | null
  instagram: string | null
  booking_platform: string | null
  enrichment_status: string
  lead_score: number | null
  score_tag: ScoreTag | null
  imported: boolean
  imported_at: string | null
  imported_prospect_id: string | null
}

// ─── Score Config ─────────────────────────────────────────────────────────────

export const SCORE_CONFIG: Record<ScoreTag, { label: string; badge: string; dot: string }> = {
  hot:  { label: "Chaud",     badge: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  warm: { label: "Tiède",     badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  cool: { label: "Potentiel", badge: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  cold: { label: "Froid",     badge: "bg-slate-100 text-slate-600",  dot: "bg-slate-400" },
}

// ─── Session CRUD ─────────────────────────────────────────────────────────────

export async function createSession(params: Partial<ScraperSession>): Promise<ScraperSession> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("scraper_sessions")
    .insert(params)
    .select()
    .single()
  if (error) throw error
  return data as ScraperSession
}

export async function updateSession(id: string, updates: Partial<ScraperSession>): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin
    .from("scraper_sessions")
    .update(updates)
    .eq("id", id)
  if (error) throw error
}

export async function getRecentSessions(limit = 15): Promise<ScraperSession[]> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("scraper_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ScraperSession[]
}

// ─── Lead CRUD ────────────────────────────────────────────────────────────────

export async function insertLeads(leads: Partial<ScraperLead>[]): Promise<ScraperLead[]> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("scraper_leads")
    .insert(leads)
    .select()
  if (error) throw error
  return (data ?? []) as ScraperLead[]
}

export async function getLeadsBySession(sessionId: string): Promise<ScraperLead[]> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("scraper_leads")
    .select("*")
    .eq("session_id", sessionId)
    .order("lead_score", { ascending: false })
  if (error) throw error
  return (data ?? []) as ScraperLead[]
}

export async function updateLead(id: string, updates: Partial<ScraperLead>): Promise<ScraperLead> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("scraper_leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as ScraperLead
}

export async function markLeadImported(id: string, prospectId: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin
    .from("scraper_leads")
    .update({
      imported: true,
      imported_at: new Date().toISOString(),
      imported_prospect_id: prospectId,
    })
    .eq("id", id)
  if (error) throw error
}

export async function getLeadById(id: string): Promise<ScraperLead | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("scraper_leads")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as ScraperLead
}
