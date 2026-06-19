export const dynamic = "force-dynamic"

import { getClinic, getLeads, getFollowUpLeads } from "@/lib/supabase/dashboard"
import LeadsTable from "@/components/dashboard/LeadsTable"
import type { LeadFilters } from "@/lib/supabase/dashboard"

interface Props {
  searchParams: Promise<{ from?: string; to?: string; service?: string; status?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams
  const clinic = await getClinic()
  if (!clinic) return null

  const filters: LeadFilters = {
    from: params.from,
    to: params.to,
    service: params.service,
    status: params.status,
  }

  const services = Array.isArray(clinic.services)
    ? clinic.services.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean)
    : []

  const [leads, followUpLeads] = await Promise.all([
    getLeads(clinic.id, filters),
    getFollowUpLeads(clinic.id),
  ])

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Leads</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} trouvé{leads.length !== 1 ? "s" : ""}
        </p>
      </div>
      <LeadsTable leads={leads} followUpLeads={followUpLeads} services={services} />
    </div>
  )
}
