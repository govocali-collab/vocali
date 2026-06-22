import { redirect } from "next/navigation"
import { getClinic } from "@/lib/supabase/dashboard"
import { listCatalog } from "@/lib/supabase/catalog"
import CatalogEditor from "@/components/dashboard/CatalogEditor"

export default async function FormationsPage() {
  const clinic = await getClinic()
  if (!clinic) return null

  // La clinique n'offre pas de formations → on renvoie à l'accueil.
  if (!clinic.offers_trainings) redirect("/dashboard")

  const formationItems = await listCatalog(clinic.id, "formation").catch(() => [])

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Formations</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">
          Les formations que votre agent peut présenter
        </p>
      </div>

      <CatalogEditor kind="formation" title="Formations" noun="formation" items={formationItems} />
    </div>
  )
}
