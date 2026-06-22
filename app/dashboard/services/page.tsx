import { getClinic } from "@/lib/supabase/dashboard"
import { listCatalog } from "@/lib/supabase/catalog"
import CatalogEditor from "@/components/dashboard/CatalogEditor"
import CsvImporter from "@/components/dashboard/CsvImporter"

export default async function ServicesPage() {
  const clinic = await getClinic()
  if (!clinic) return null

  // Résilient : si le catalogue est indisponible, la page s'affiche quand même (vide).
  const serviceItems = await listCatalog(clinic.id, "service").catch(() => [])

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Services &amp; tarifs</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">
          Les services et prix que votre agent connaît
        </p>
      </div>

      <div className="space-y-6">
        <CatalogEditor kind="service" title="Services & tarifs" noun="service" items={serviceItems} />
        <CsvImporter />
      </div>
    </div>
  )
}
