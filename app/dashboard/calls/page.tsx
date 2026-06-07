import { getClinic, getCalls } from "@/lib/supabase/dashboard"
import CallsTable from "@/components/dashboard/CallsTable"
import type { CallFilters } from "@/lib/supabase/dashboard"

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function CallsPage({ searchParams }: Props) {
  const params = await searchParams
  const clinic = await getClinic()
  if (!clinic) return null

  const filters: CallFilters = {
    from: params.from,
    to: params.to,
  }

  const calls = await getCalls(clinic.id, filters)

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-white font-display text-2xl font-semibold">Appels</h1>
        <p className="text-white/40 text-sm font-body mt-0.5">
          {calls.length} appel{calls.length !== 1 ? "s" : ""} trouvé{calls.length !== 1 ? "s" : ""}
        </p>
      </div>
      <CallsTable calls={calls} />
    </div>
  )
}
