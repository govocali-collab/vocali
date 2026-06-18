import { getProspectById, STATUS_CONFIG } from "@/lib/supabase/prospects"
import { notFound } from "next/navigation"
import Link from "next/link"
import ProspectEditForm from "./ProspectEditForm"

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })
}

export default async function ProspectDetailPage({ params }: Props) {
  const { id } = await params
  const prospect = await getProspectById(id)
  if (!prospect) notFound()

  const cfg = STATUS_CONFIG[prospect.status]

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/crm"
          className="text-charcoal-400 text-sm font-body hover:text-gold-600 transition-colors mb-4 inline-block"
        >
          ← Prospection
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-charcoal-900 font-display text-2xl font-semibold">
              {prospect.clinic_name}
            </h1>
            <p className="text-charcoal-400 text-xs font-body mt-1">
              Ajouté le {formatDate(prospect.created_at)}
              {prospect.city && ` · ${prospect.city}`}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full mt-1 flex-shrink-0 ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      <ProspectEditForm prospect={prospect} />
    </div>
  )
}
