import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type ProspectStatus = "nouveau" | "contacte" | "demo" | "proposition" | "signe" | "declin"

export const STATUS_CONFIG: Record<ProspectStatus, { label: string; badge: string; dot: string }> = {
  nouveau:     { label: "Nouveau",     badge: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
  contacte:    { label: "Contacté",    badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  demo:        { label: "Démo",        badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  proposition: { label: "Proposition", badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  signe:       { label: "Signé",       badge: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  declin:      { label: "Décliné",     badge: "bg-red-100 text-red-500",       dot: "bg-red-400" },
}

export const STATUSES = Object.keys(STATUS_CONFIG) as ProspectStatus[]

export interface Prospect {
  id: string
  created_at: string
  updated_at: string
  clinic_name: string
  owner_name: string | null
  phone: string | null
  email: string | null
  city: string | null
  status: ProspectStatus
  source: string | null
  notes: string | null
  last_contact_at: string | null
}

export async function getAllProspects(): Promise<Prospect[]> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("prospects")
    .select("*")
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Prospect[]
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("prospects")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as Prospect
}

export async function createProspect(input: Partial<Prospect>): Promise<Prospect> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("prospects")
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Prospect
}

export async function updateProspect(id: string, input: Partial<Prospect>): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin
    .from("prospects")
    .update(input)
    .eq("id", id)
  if (error) throw error
}

export async function deleteProspect(id: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin
    .from("prospects")
    .delete()
    .eq("id", id)
  if (error) throw error
}
