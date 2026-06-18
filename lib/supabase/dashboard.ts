import { cache } from "react"
import { createClient } from "./server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Clinic = {
  id: string
  name: string
  twilio_phone_number: string | null
  clinic_config: { agent_name?: string; [key: string]: unknown }
  is_active: boolean
  system_prompt_override: string | null
  services: Array<{ name: string; description?: string } | string>
  hours: Record<string, { open: string; close: string; closed?: boolean }>
  owner_email?: string
  offers_trainings?: boolean
}

export type CallLog = {
  id: string
  clinic_id: string
  caller_number: string
  twilio_call_sid: string
  transcript: string | null
  summary: string | null
  duration_seconds: number
  language: string
  created_at: string
  recording_sid: string | null
}

export type CallLogWithLead = CallLog & {
  leads: Array<{ id: string }>
}

export type LeadStatus = "nouveau" | "contacté" | "confirmé" | "annulé"

export type Lead = {
  id: string
  clinic_id: string
  call_log_id: string | null
  first_name: string
  last_name: string
  service: string | null
  appointment_preference: string | null
  status: LeadStatus
  created_at: string
  call_logs?: Pick<
    CallLog,
    "id" | "transcript" | "summary" | "duration_seconds" | "caller_number" | "language" | "created_at"
  > | null
}

export type TodayStats = {
  callsToday: number
  leadsToday: number
  avgDuration: number
  missedCalls: number
}

export type LeadFilters = {
  from?: string
  to?: string
  service?: string
  status?: string
}

export type CallFilters = {
  from?: string
  to?: string
}

// --- Helpers ---

async function getLocationId(clinicId: string): Promise<string | null> {
  const admin = getServiceClient()
  const { data } = await admin
    .from("locations")
    .select("id")
    .eq("clinic_id", clinicId)
    .maybeSingle()
  return data?.id ?? null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transcriptToText(transcript: unknown): string | null {
  if (!Array.isArray(transcript) || transcript.length === 0) return null
  return transcript
    .map((m: { role: string; content: string }) =>
      `${m.role === "assistant" ? "Alexandra" : "Client"}: ${m.content}`
    )
    .join("\n")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLead(raw: any, clinicId: string): Lead {
  const parts = (raw.name ?? "").trim().split(/\s+/)
  const firstName = parts[0] ?? "—"
  const lastName = parts.slice(1).join(" ")
  const session = raw.call_sessions

  const preference = [raw.preferred_date, raw.preferred_time].filter(Boolean).join(" à ") || null

  return {
    id: raw.id,
    clinic_id: clinicId,
    call_log_id: raw.call_session_id ?? null,
    first_name: firstName,
    last_name: lastName,
    service: raw.service_interest ?? null,
    appointment_preference: preference,
    status: (raw.status ?? "nouveau") as LeadStatus,
    created_at: raw.created_at,
    call_logs: session
      ? {
          id: session.id,
          transcript: transcriptToText(session.transcript),
          summary: session.conversation_summary ?? null,
          duration_seconds: session.duration_sec ?? 0,
          caller_number: session.caller_phone ?? raw.caller_phone ?? "",
          language: session.language ?? "fr",
          created_at: session.created_at,
        }
      : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCallSession(raw: any, clinicId: string): CallLogWithLead {
  return {
    id: raw.id,
    clinic_id: clinicId,
    caller_number: raw.caller_phone ?? "",
    twilio_call_sid: raw.call_sid ?? "",
    transcript: transcriptToText(raw.transcript),
    summary: raw.conversation_summary ?? null,
    duration_seconds: raw.duration_sec ?? 0,
    language: raw.language ?? "fr",
    created_at: raw.created_at,
    recording_sid: raw.recording_sid ?? null,
    leads: raw.leads ?? [],
  }
}

const LEAD_SESSION_SELECT =
  "*, call_sessions!call_session_id(id, transcript, conversation_summary, duration_sec, caller_phone, language, created_at, call_sid)"

// --- Public API ---

export const getClinic = cache(async (): Promise<Clinic | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return null

  const admin = getServiceClient()
  const { data } = await admin
    .from("clinics")
    .select("*")
    .eq("owner_email", user.email)
    .single()

  return data ?? null
})

export async function getTodayStats(clinicId: string): Promise<TodayStats> {
  const admin = getServiceClient()
  const locationId = await getLocationId(clinicId)
  if (!locationId) return { callsToday: 0, leadsToday: 0, avgDuration: 0, missedCalls: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [callsResult, leadsResult] = await Promise.all([
    admin
      .from("call_sessions")
      .select("duration_sec")
      .eq("location_id", locationId)
      .gte("created_at", today.toISOString()),
    admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("location_id", locationId)
      .gte("created_at", today.toISOString()),
  ])

  const calls = callsResult.data ?? []
  const callsToday = calls.length
  const leadsToday = leadsResult.count ?? 0
  const avgDuration =
    callsToday > 0
      ? Math.round(calls.reduce((sum, c) => sum + (c.duration_sec ?? 0), 0) / callsToday)
      : 0
  const missedCalls = calls.filter((c) => (c.duration_sec ?? 0) < 10).length

  return { callsToday, leadsToday, avgDuration, missedCalls }
}

export async function getTodayLeads(clinicId: string): Promise<Lead[]> {
  const admin = getServiceClient()
  const locationId = await getLocationId(clinicId)
  if (!locationId) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data } = await admin
    .from("leads")
    .select(LEAD_SESSION_SELECT)
    .eq("location_id", locationId)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(10)

  return (data ?? []).map((r) => mapLead(r, clinicId))
}

export async function getLeads(clinicId: string, filters: LeadFilters = {}): Promise<Lead[]> {
  const admin = getServiceClient()
  const locationId = await getLocationId(clinicId)
  if (!locationId) return []

  let query = admin
    .from("leads")
    .select(LEAD_SESSION_SELECT)
    .eq("location_id", locationId)
    .order("created_at", { ascending: false })

  if (filters.from) query = query.gte("created_at", filters.from)
  if (filters.to) query = query.lte("created_at", filters.to + "T23:59:59")
  if (filters.service) query = query.eq("service_interest", filters.service)
  if (filters.status) query = query.eq("status", filters.status)

  const { data } = await query
  return (data ?? []).map((r) => mapLead(r, clinicId))
}

export async function getFollowUpLeads(clinicId: string): Promise<Lead[]> {
  const admin = getServiceClient()
  const locationId = await getLocationId(clinicId)
  if (!locationId) return []

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data } = await admin
    .from("leads")
    .select(LEAD_SESSION_SELECT)
    .eq("location_id", locationId)
    .eq("status", "nouveau")
    .lte("created_at", cutoff)
    .order("created_at", { ascending: false })

  return (data ?? []).map((r) => mapLead(r, clinicId))
}

export async function getCalls(
  clinicId: string,
  filters: CallFilters = {}
): Promise<CallLogWithLead[]> {
  const admin = getServiceClient()
  const locationId = await getLocationId(clinicId)
  if (!locationId) return []

  let query = admin
    .from("call_sessions")
    .select("*, leads!call_session_id(id)")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false })

  if (filters.from) query = query.gte("created_at", filters.from)
  if (filters.to) query = query.lte("created_at", filters.to + "T23:59:59")

  const { data } = await query
  return (data ?? []).map((r) => mapCallSession(r, clinicId))
}
