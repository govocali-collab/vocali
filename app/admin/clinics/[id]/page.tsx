import { getClinicById } from "@/lib/supabase/clinics"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ClinicConfigForm from "./ClinicConfigForm"
import { formatPhone } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

export default async function ClinicDetailPage({ params }: Props) {
  const { id } = await params
  const clinic = await getClinicById(id)
  if (!clinic) notFound()

  const config = (clinic.clinic_config ?? {}) as Record<string, unknown>
  const hours = (clinic.hours ?? {}) as Record<string, { open: string; close: string; closed: boolean }>
  const services = (clinic.services ?? []) as string[]

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <div className="max-w-3xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="mb-8">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={90} height={28} className="mb-6" />
          <Link href="/admin/clinics" className="text-charcoal-400 text-sm font-body hover:text-gold-600 transition-colors mb-4 inline-block">
            ← Toutes les cliniques
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-charcoal-900 font-display text-2xl font-semibold">{clinic.name}</h1>
              <p className="text-charcoal-500 text-sm mt-1">{clinic.owner_email}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 flex-shrink-0 ${
              clinic.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {clinic.is_active ? "Active" : "En attente"}
            </span>
          </div>
        </div>

        {/* Infos soumises par la clinique */}
        <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card mb-5">
          <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Informations soumises par la clinique
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-5">
            {[
              ["Propriétaire", `${config.owner_first_name ?? ""} ${config.owner_last_name ?? ""}`.trim() || "—"],
              ["Téléphone", formatPhone((config.owner_phone as string) || "") || "—"],
              ["Ville", (config.city as string) || "—"],
              ["Langue", (config.languages as string) || "—"],
              ["Réservation", (config.booking_system as string) || "—"],
              ["Numéro Twilio", clinic.twilio_phone_number || "Non assigné"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-charcoal-400 text-xs font-body mb-0.5">{label}</p>
                <p className="text-charcoal-800 text-sm font-body font-medium">{value}</p>
              </div>
            ))}
          </div>

          {services.length > 0 && (
            <div className="mb-5">
              <p className="text-charcoal-400 text-xs font-body mb-2">Services</p>
              <div className="flex flex-wrap gap-1.5">
                {services.map((s) => (
                  <span key={s} className="bg-ivory-100 border border-ivory-300 text-charcoal-600 text-xs font-body px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-charcoal-400 text-xs font-body mb-2">Heures d'ouverture</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              {DAYS.map((day) => {
                const h = hours[day]
                if (!h) return null
                return (
                  <div key={day} className="flex items-center gap-2 text-sm font-body">
                    <span className="text-charcoal-500 capitalize w-24">{day}</span>
                    <span className={h.closed ? "text-charcoal-300" : "text-charcoal-700"}>
                      {h.closed ? "Fermé" : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Formulaire de configuration admin */}
        <ClinicConfigForm clinic={clinic} />
      </div>
    </div>
  )
}
