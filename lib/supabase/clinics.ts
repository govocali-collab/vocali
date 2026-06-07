import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type ClinicInsert = {
  name: string
  owner_email: string
  twilio_phone_number?: string | null
  is_active: boolean
  services: Array<string>
  hours: Record<string, { open: string; close: string; closed: boolean }>
  clinic_config: Record<string, unknown>
  system_prompt_override?: string | null
}

export type ClinicRow = ClinicInsert & { id: string; created_at: string }

export async function createClinic(data: ClinicInsert): Promise<string> {
  const supabase = getAdminClient()
  const { data: row, error } = await supabase
    .from("clinics")
    .insert(data)
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  return row.id
}

export async function updateClinicTwilioNumber(
  clinicId: string,
  twilioPhoneNumber: string
): Promise<void> {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from("clinics")
    .update({ twilio_phone_number: twilioPhoneNumber })
    .eq("id", clinicId)
  if (error) throw new Error(error.message)
}

export async function getClinicByOwnerEmail(email: string): Promise<ClinicRow | null> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from("clinics")
    .select("*")
    .eq("owner_email", email)
    .single()
  return data ?? null
}

export async function setClinicActive(clinicId: string): Promise<void> {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from("clinics")
    .update({ is_active: true })
    .eq("id", clinicId)
  if (error) throw new Error(error.message)
}

export type ClinicWithStats = ClinicRow & {
  paused_at: string | null
  calls_this_month: number
}

export async function getAllClinics(): Promise<ClinicWithStats[]> {
  const supabase = getAdminClient()

  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("*, paused_at")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  if (!clinics || clinics.length === 0) return []

  // Get location_ids for all clinics
  const clinicIds = clinics.map((c) => c.id)
  const { data: locations } = await supabase
    .from("locations")
    .select("id, clinic_id")
    .in("clinic_id", clinicIds)

  const locationIdsByClinic: Record<string, string> = {}
  for (const loc of locations ?? []) {
    if (loc.clinic_id) locationIdsByClinic[loc.clinic_id] = loc.id
  }

  // Count calls this month per location
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const locationIds = Object.values(locationIdsByClinic)
  const callCounts: Record<string, number> = {}

  if (locationIds.length > 0) {
    const { data: calls } = await supabase
      .from("call_sessions")
      .select("location_id")
      .in("location_id", locationIds)
      .gte("created_at", startOfMonth.toISOString())

    for (const call of calls ?? []) {
      callCounts[call.location_id] = (callCounts[call.location_id] ?? 0) + 1
    }
  }

  return clinics.map((clinic) => {
    const locationId = locationIdsByClinic[clinic.id]
    return {
      ...clinic,
      calls_this_month: locationId ? (callCounts[locationId] ?? 0) : 0,
    }
  })
}

export async function getClinicById(id: string): Promise<ClinicRow | null> {
  const supabase = getAdminClient()
  const { data } = await supabase.from("clinics").select("*").eq("id", id).single()
  return data ?? null
}

export async function updateClinicConfig(
  id: string,
  config: {
    agentName?: string
    tone?: string
    systemPromptOverride?: string
    bookingCreds?: string
    bookingSystem?: string
    bookingApiUrl?: string
    bookingApiKey?: string
    activate?: boolean
  }
): Promise<void> {
  const supabase = getAdminClient()
  const clinic = await getClinicById(id)
  if (!clinic) throw new Error("Clinique introuvable")

  const updatedConfig = {
    ...(clinic.clinic_config as Record<string, unknown>),
    ...(config.agentName ? { agent_name: config.agentName } : {}),
    ...(config.tone ? { tone: config.tone } : {}),
    ...(config.bookingCreds !== undefined ? { booking_creds: config.bookingCreds } : {}),
    ...(config.bookingSystem !== undefined ? { booking_system: config.bookingSystem } : {}),
    ...(config.bookingApiUrl !== undefined ? { booking_api_url: config.bookingApiUrl } : {}),
    ...(config.bookingApiKey !== undefined ? { booking_api_key: config.bookingApiKey } : {}),
  }

  const update: Record<string, unknown> = { clinic_config: updatedConfig }
  if (config.systemPromptOverride !== undefined)
    update.system_prompt_override = config.systemPromptOverride || null
  if (config.activate) update.is_active = true

  const { error } = await supabase.from("clinics").update(update).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function createLocation(data: {
  clinic_id: string
  twilio_phone_number: string | null
  name: string
  hours: Record<string, unknown>
  services: string[]
  prompt_additions?: string | null
  is_active?: boolean
}): Promise<string> {
  const supabase = getAdminClient()
  const { data: row, error } = await supabase
    .from("locations")
    .insert({
      clinic_id: data.clinic_id,
      twilio_phone_number: data.twilio_phone_number,
      name: data.name,
      hours: data.hours,
      services: data.services,
      prompt_additions: data.prompt_additions ?? null,
      is_active: data.is_active ?? false,
    })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  return row.id
}

export async function syncLocationFromClinic(clinicId: string): Promise<void> {
  const supabase = getAdminClient()
  const clinic = await getClinicById(clinicId)
  if (!clinic) return

  const config = (clinic.clinic_config ?? {}) as Record<string, unknown>

  const { data: existing } = await supabase
    .from("locations")
    .select("id")
    .eq("clinic_id", clinicId)
    .maybeSingle()

  const payload = {
    name: clinic.name,
    is_active: clinic.is_active,
    services: clinic.services,
    hours: clinic.hours,
    prompt_additions: clinic.system_prompt_override ?? null,
    ...(clinic.twilio_phone_number ? { twilio_phone_number: clinic.twilio_phone_number } : {}),
    ...(config.agent_name ? { agent_name: config.agent_name } : {}),
    ...(config.tone ? { tone: config.tone } : {}),
    ...(config.booking_system ? { booking_system: config.booking_system } : {}),
    ...(config.booking_api_url ? { booking_api_url: config.booking_api_url } : {}),
    ...(config.booking_api_key ? { booking_api_key: config.booking_api_key } : {}),
  }

  if (existing) {
    await supabase.from("locations").update(payload).eq("clinic_id", clinicId)
  } else {
    await supabase.from("locations").insert({ clinic_id: clinicId, ...payload })
  }
}

export async function createAuthUser(
  email: string,
  password: string
): Promise<string> {
  const supabase = getAdminClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(error.message)
  return data.user.id
}
