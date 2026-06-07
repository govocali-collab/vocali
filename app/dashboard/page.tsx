import Link from "next/link"
import { Phone, Users, Clock, PhoneMissed, ArrowRight } from "lucide-react"
import {
  getClinic,
  getTodayStats,
  getTodayLeads,
} from "@/lib/supabase/dashboard"
import StatsCard from "@/components/dashboard/StatsCard"
import { cn, formatDuration, formatShortDate } from "@/lib/utils"
import type { LeadStatus } from "@/lib/supabase/dashboard"

const STATUS_STYLES: Record<LeadStatus, string> = {
  nouveau: "text-blue-600 bg-blue-50 border-blue-200",
  contacté: "text-amber-600 bg-amber-50 border-amber-200",
  confirmé: "text-green-600 bg-green-50 border-green-200",
  annulé: "text-red-600 bg-red-50 border-red-200",
}

export default async function DashboardPage() {
  const clinic = await getClinic()
  if (!clinic) return null

  const [stats, leads] = await Promise.all([
    getTodayStats(clinic.id),
    getTodayLeads(clinic.id),
  ])

  const today = new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      {!clinic.is_active && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
          <p className="text-amber-700 text-sm font-body">
            <span className="font-semibold">Votre agent est en cours de configuration.</span>{" "}
            Nous l'activerons ensemble lors de votre appel d'embarquement.
          </p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold capitalize">{today}</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">Vue d'ensemble de la journée</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatsCard title="Appels aujourd'hui" value={stats.callsToday} icon={<Phone size={16} />} />
        <StatsCard title="Leads capturés" value={stats.leadsToday} icon={<Users size={16} />} highlight={stats.leadsToday > 0} />
        <StatsCard title="Durée moyenne" value={formatDuration(stats.avgDuration)} icon={<Clock size={16} />} />
        <StatsCard title="Sans réponse" value={stats.missedCalls} icon={<PhoneMissed size={16} />} />
      </div>

      <div className="bg-white rounded-xl border border-ivory-300 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ivory-200">
          <h2 className="text-charcoal-800 font-body font-semibold text-sm">Leads d'aujourd'hui</h2>
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-1 text-gold-600 text-xs font-body hover:text-gold-500 transition-colors"
          >
            Voir tous <ArrowRight size={12} />
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-charcoal-400 text-sm font-body">Aucun lead aujourd'hui.</p>
            <p className="text-charcoal-300 text-xs font-body mt-1">
              Ils apparaîtront ici dès qu'un appel sera capturé.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ivory-50">
                  {["Nom", "Service", "Statut", "Heure"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-charcoal-400 text-[11px] font-body font-medium uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} className={cn(i < leads.length - 1 && "border-b border-ivory-200")}>
                    <td className="px-5 py-3 text-charcoal-800 text-sm font-body font-medium">
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td className="px-5 py-3 text-charcoal-500 text-sm font-body">{lead.service ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-body border", STATUS_STYLES[lead.status])}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-charcoal-400 text-xs font-body">
                      {formatShortDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ivory-300 hover:border-gold-300 rounded-lg text-charcoal-500 hover:text-charcoal-800 text-sm font-body transition-all shadow-card"
        >
          <Users size={14} /> Voir tous les leads
        </Link>
        <Link
          href="/dashboard/calls"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ivory-300 hover:border-gold-300 rounded-lg text-charcoal-500 hover:text-charcoal-800 text-sm font-body transition-all shadow-card"
        >
          <Phone size={14} /> Voir tous les appels
        </Link>
      </div>
    </div>
  )
}
