import { getClinic } from "@/lib/supabase/dashboard"
import { Zap, Clock, List, Mail } from "lucide-react"
import OwnerForm from "@/components/dashboard/OwnerForm"
import AgentToggle from "@/components/dashboard/AgentToggle"
import PasswordForm from "@/components/dashboard/PasswordForm"

const DAYS_FR: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi",
  thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
  lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi",
  jeudi: "Jeudi", vendredi: "Vendredi", samedi: "Samedi", dimanche: "Dimanche",
}

export default async function SettingsPage() {
  const clinic = await getClinic()
  if (!clinic) return null

  const agentName = (clinic.clinic_config?.agent_name as string | undefined) ?? "Sarah"
  const config = (clinic.clinic_config ?? {}) as Record<string, string>
  const ownerFirstName = config.owner_first_name ?? ""
  const ownerLastName = config.owner_last_name ?? ""
  const ownerPhone = config.owner_phone ?? ""
  const ownerEmail = clinic.owner_email ?? config.owner_email ?? ""
  const hours = clinic.hours ?? {}

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Paramètres</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">Configuration de votre clinique</p>
      </div>

      <div className="space-y-4">
        <AgentToggle agentName={agentName} isActive={clinic.is_active} />

        <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
          <h2 className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider mb-4">
            Informations générales
          </h2>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-ivory-100 border border-ivory-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <List size={13} className="text-charcoal-400" />
              </div>
              <div>
                <dt className="text-charcoal-400 text-xs font-body">Nom de la clinique</dt>
                <dd className="text-charcoal-800 text-sm font-body font-medium mt-0.5">{clinic.name}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-gold-50 border border-gold-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={13} className="text-gold-600" />
              </div>
              <div>
                <dt className="text-charcoal-400 text-xs font-body">Nom de l'agent IA</dt>
                <dd className="text-gold-700 text-sm font-body font-medium mt-0.5">{agentName}</dd>
              </div>
            </div>
          </dl>
        </section>

        <OwnerForm
          firstName={ownerFirstName}
          lastName={ownerLastName}
          phone={ownerPhone}
          email={ownerEmail}
        />

        <PasswordForm />

        {Object.keys(hours).length > 0 && (
          <section className="bg-white rounded-xl border border-ivory-300 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={13} className="text-charcoal-400" />
              <h2 className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">
                Heures d'opération
              </h2>
            </div>
            <dl className="space-y-2">
              {Object.entries(hours).map(([day, schedule]) => (
                <div key={day} className="flex items-center justify-between py-1.5 border-b border-ivory-200 last:border-0">
                  <dt className="text-charcoal-600 text-sm font-body capitalize">
                    {DAYS_FR[day.toLowerCase()] ?? day}
                  </dt>
                  <dd className="text-charcoal-800 text-sm font-body font-medium">
                    {schedule.closed ? (
                      <span className="text-charcoal-400">Fermé</span>
                    ) : (
                      `${schedule.open} – ${schedule.close}`
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="bg-gold-50 rounded-xl border border-gold-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gold-100 border border-gold-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail size={13} className="text-gold-600" />
            </div>
            <p className="text-charcoal-600 text-sm font-body leading-relaxed">
              Pour toute autre modification, contactez{" "}
              <a href="mailto:support@vocali.ca" className="text-gold-700 hover:text-gold-600 transition-colors underline underline-offset-2">
                support@vocali.ca
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
