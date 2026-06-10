export const dynamic = "force-dynamic"

import { getAllClinics } from "@/lib/supabase/clinics"
import type { ClinicWithStats } from "@/lib/supabase/clinics"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Phone, PhoneOff, Settings } from "lucide-react"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })
}

function formatPausedSince(d: string) {
  const hours = Math.round((Date.now() - new Date(d).getTime()) / 3600000)
  if (hours < 24) return `En pause depuis ${hours}h`
  const days = Math.floor(hours / 24)
  return `En pause depuis ${days}j`
}

type ClinicStatus = "active" | "paused" | "pending"

function getStatus(clinic: ClinicWithStats): ClinicStatus {
  if (!clinic.is_active && clinic.paused_at) return "paused"
  if (!clinic.is_active) return "pending"
  return "active"
}

const STATUS_STYLE: Record<ClinicStatus, { label: string; badge: string; row: string }> = {
  active:  { label: "Active",        badge: "bg-green-100 text-green-700",  row: "border-ivory-300" },
  paused:  { label: "En pause",      badge: "bg-amber-100 text-amber-700",  row: "border-amber-200 bg-amber-50/30" },
  pending: { label: "À configurer",  badge: "bg-slate-100 text-slate-500",  row: "border-ivory-200 bg-ivory-50/60" },
}

export default async function AdminClinicsPage() {
  const clinics = await getAllClinics()

  const active  = clinics.filter((c) => getStatus(c) === "active")
  const paused  = clinics.filter((c) => getStatus(c) === "paused")
  const pending = clinics.filter((c) => getStatus(c) === "pending")

  const totalCallsThisMonth = clinics.reduce((s, c) => s + c.calls_this_month, 0)

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Vue d'ensemble</h1>
            <p className="text-charcoal-500 text-sm mt-1">
              {clinics.length} clinique{clinics.length !== 1 ? "s" : ""} · {totalCallsThisMonth} appel{totalCallsThisMonth !== 1 ? "s" : ""} ce mois
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Actives",       count: active.length,  color: "text-green-700", bg: "bg-green-50 border-green-200" },
            { label: "En pause",      count: paused.length,  color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
            { label: "À configurer",  count: pending.length, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={cn("rounded-xl border p-4", bg)}>
              <p className={cn("text-2xl font-display font-semibold", color)}>{count}</p>
              <p className="text-charcoal-500 text-xs font-body mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Paused — highlighted first */}
        {paused.length > 0 && (
          <section className="mb-6">
            <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">
              En pause ({paused.length})
            </p>
            <div className="space-y-2">
              {paused.map((c) => <ClinicRow key={c.id} clinic={c} />)}
            </div>
          </section>
        )}

        {/* Active */}
        {active.length > 0 && (
          <section className="mb-6">
            <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Actives ({active.length})
            </p>
            <div className="space-y-2">
              {active.map((c) => <ClinicRow key={c.id} clinic={c} />)}
            </div>
          </section>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <section className="mb-6">
            <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">
              À configurer ({pending.length})
            </p>
            <div className="space-y-2">
              {pending.map((c) => <ClinicRow key={c.id} clinic={c} />)}
            </div>
          </section>
        )}

        {clinics.length === 0 && (
          <div className="bg-white rounded-xl border border-ivory-300 p-12 text-center">
            <p className="text-charcoal-400 text-sm">Aucune clinique pour l'instant.</p>
          </div>
        )}
    </div>
  )
}

function ClinicRow({ clinic }: { clinic: ClinicWithStats }) {
  const config = (clinic.clinic_config ?? {}) as Record<string, unknown>
  const city = (config.city as string) ?? "—"
  const agentName = (config.agent_name as string) ?? "Alexandra"
  const status = getStatus(clinic)
  const style = STATUS_STYLE[status]

  return (
    <div className={cn("flex items-center gap-4 bg-white rounded-xl border px-5 py-4", style.row)}>

      {/* Status icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        status === "active" ? "bg-green-50 border border-green-200" :
        status === "paused" ? "bg-amber-50 border border-amber-200" :
        "bg-slate-50 border border-slate-200"
      )}>
        {status === "active"
          ? <Phone size={13} className="text-green-600" />
          : <PhoneOff size={13} className={status === "paused" ? "text-amber-600" : "text-slate-400"} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-charcoal-900 font-body font-semibold text-sm truncate">{clinic.name}</span>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", style.badge)}>
            {style.label}
          </span>
        </div>
        <p className="text-charcoal-400 text-xs font-body truncate">
          {clinic.owner_email} · {city} · {agentName}
          {status === "paused" && clinic.paused_at && (
            <span className="text-amber-600"> · {formatPausedSince(clinic.paused_at)}</span>
          )}
          {status === "pending" && (
            <span className="text-slate-400"> · Inscrite le {formatDate(clinic.created_at)}</span>
          )}
        </p>
      </div>

      {/* Calls this month */}
      <div className="text-center flex-shrink-0 hidden sm:block">
        <p className="text-charcoal-900 font-body font-semibold text-sm">{clinic.calls_this_month}</p>
        <p className="text-charcoal-400 text-[10px] font-body">appels / mois</p>
      </div>

      {/* Configure link */}
      <Link
        href={`/admin/clinics/${clinic.id}`}
        className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg border border-ivory-300 text-charcoal-500 text-xs font-body hover:border-gold-300 hover:text-gold-700 transition-colors"
      >
        <Settings size={11} />
        Gérer
      </Link>
    </div>
  )
}
