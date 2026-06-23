import Link from "next/link"
import {
  Mail, MessageSquare, Phone, Bell, CreditCard, CalendarDays, FileText, Users,
  Search, LayoutGrid, UserPlus, BarChart2, Mic, Database, Globe, Github, AtSign,
  ExternalLink, ArrowRight, Receipt,
} from "lucide-react"

export const metadata = { title: "Carte du système — Vocali" }

type Step = { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }

const FLOW: { key: string; title: string; accent: string; steps: Step[] }[] = [
  {
    key: "acq", title: "Acquisition", accent: "bg-sky-400",
    steps: [
      { icon: Mail, text: "Guide PDF envoyé au visiteur (contact@)" },
      { icon: Bell, text: "Notif lead / demande démo → contact@" },
      { icon: CalendarDays, text: "Posts planifiés (calendrier)" },
      { icon: Search, text: "Scraper → prospects au CRM" },
    ],
  },
  {
    key: "sale", title: "Vente & embarquement", accent: "bg-emerald-400",
    steps: [
      { icon: Receipt, text: "Facture / lien de paiement (paiement@)" },
      { icon: CreditCard, text: "Stripe checkout → payé" },
      { icon: UserPlus, text: "Onboarding → compte créé" },
      { icon: Mail, text: "Courriel d'accès + mot de passe (app@)" },
      { icon: Phone, text: "Numéro Twilio importé → ElevenLabs" },
    ],
  },
  {
    key: "agent", title: "Agent (le produit)", accent: "bg-amber-400",
    steps: [
      { icon: Phone, text: "Appel entrant → l'agent répond" },
      { icon: Mic, text: "Lit les heures + le catalogue PUBLIÉ" },
      { icon: FileText, text: "Transcript → lead capturé (dashboard cliente)" },
      { icon: MessageSquare, text: "SMS de suivi (selon la config)" },
    ],
  },
  {
    key: "billing", title: "Facturation", accent: "bg-rose-400",
    steps: [
      { icon: Receipt, text: "Renouvellement mensuel → reçu" },
      { icon: Bell, text: "Paiement échoué → paiement@ + alerte@" },
      { icon: Bell, text: "Annulation / pause → alerte@" },
    ],
  },
]

const VOCALI_LEVERS: { label: string; desc: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { label: "Cliniques", desc: "Agent, voix, catalogue, heures, config par clinique", href: "/admin/clinics", icon: LayoutGrid },
  { label: "Posts & calendrier", desc: "Générer, planifier, prévu/publié", href: "/admin/social", icon: CalendarDays },
  { label: "CRM / prospects", desc: "Suivi des prospects", href: "/admin/crm", icon: Users },
  { label: "Scraper", desc: "Trouver des cliniques", href: "/admin/scraper", icon: Search },
  { label: "Facturation", desc: "Créer factures, forfaits, frais d'installation", href: "/admin/billing", icon: FileText },
  { label: "Onboarding", desc: "Embarquer une nouvelle clinique", href: "/admin/onboarding", icon: UserPlus },
  { label: "Statistiques", desc: "Appels, leads, démos", href: "/admin/stats", icon: BarChart2 },
]

const EXTERNAL: { label: string; desc: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { label: "Stripe", desc: "Prix, coupons, reçus, paiements", href: "https://dashboard.stripe.com", icon: CreditCard },
  { label: "ElevenLabs", desc: "Voix, modèle, webhooks de l'agent", href: "https://elevenlabs.io/app/conversational-ai", icon: Mic },
  { label: "Resend", desc: "Courriels envoyés, domaine, suppression", href: "https://resend.com/emails", icon: Mail },
  { label: "Google Workspace", desc: "Alias app@ / paiement@ / contact@ / support@ / alerte@", href: "https://admin.google.com", icon: AtSign },
  { label: "Twilio", desc: "Numéros de téléphone", href: "https://console.twilio.com", icon: Phone },
  { label: "Supabase", desc: "Base de données", href: "https://supabase.com/dashboard", icon: Database },
  { label: "Vercel", desc: "Variables d'environnement, déploiements", href: "https://vercel.com/dashboard", icon: Globe },
  { label: "GitHub", desc: "Code source", href: "https://github.com/govocali-collab/vocali", icon: Github },
]

export default function SystemMapPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Carte du système</h1>
        <p className="text-charcoal-500 text-sm font-body mt-1">
          Vue d'ensemble : ce qui se déclenche quand, et où aller pour changer chaque chose.
        </p>
      </div>

      {/* ── LE FLUX ── */}
      <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">Le flux</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        {FLOW.map((stage, i) => (
          <div key={stage.key} className="relative bg-white border border-ivory-300 rounded-xl shadow-card overflow-hidden">
            <div className={`h-1 ${stage.accent}`} />
            <div className="p-4">
              <h2 className="text-charcoal-800 font-body font-semibold text-sm mb-3">
                <span className="text-charcoal-300 mr-1">{i + 1}.</span>{stage.title}
              </h2>
              <ul className="space-y-2.5">
                {stage.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <step.icon size={14} className="text-gold-600 mt-0.5 flex-shrink-0" />
                    <span className="text-charcoal-600 text-xs font-body leading-snug">{step.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-charcoal-400 text-xs font-body mb-8">
        <ArrowRight size={13} className="text-gold-500" />
        Chaque étape déclenche la suivante. Les notifications internes (nouveau lead, clinique, alertes) arrivent à <span className="font-medium">contact@</span> / <span className="font-medium">alerte@</span>.
      </div>

      {/* ── LES LEVIERS ── */}
      <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">Les leviers — où changer les choses</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dans Vocali */}
        <section className="bg-white border border-ivory-300 rounded-xl shadow-card p-4">
          <h2 className="flex items-center gap-2 text-charcoal-800 font-body font-semibold text-sm mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dans Vocali
          </h2>
          <div className="space-y-1.5">
            {VOCALI_LEVERS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-ivory-100 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-ivory-100 border border-ivory-300 flex items-center justify-center flex-shrink-0 group-hover:border-gold-300">
                  <l.icon size={15} className="text-charcoal-500 group-hover:text-gold-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-charcoal-800 text-sm font-body font-medium">{l.label}</p>
                  <p className="text-charcoal-400 text-xs font-body truncate">{l.desc}</p>
                </div>
                <ArrowRight size={14} className="text-charcoal-300 group-hover:text-gold-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Outils externes */}
        <section className="bg-white border border-ivory-300 rounded-xl shadow-card p-4">
          <h2 className="flex items-center gap-2 text-charcoal-800 font-body font-semibold text-sm mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Outils externes connectés
          </h2>
          <div className="space-y-1.5">
            {EXTERNAL.map((t) => (
              <a
                key={t.href}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-ivory-100 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-ivory-100 border border-ivory-300 flex items-center justify-center flex-shrink-0 group-hover:border-gold-300">
                  <t.icon size={15} className="text-charcoal-500 group-hover:text-gold-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-charcoal-800 text-sm font-body font-medium">{t.label}</p>
                  <p className="text-charcoal-400 text-xs font-body truncate">{t.desc}</p>
                </div>
                <ExternalLink size={14} className="text-charcoal-300 group-hover:text-gold-600 flex-shrink-0" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
