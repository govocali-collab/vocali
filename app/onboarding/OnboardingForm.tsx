"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn, formatPhone } from "@/lib/utils"

const PREDEFINED_SERVICES = [
  "Botox", "Filler", "Acide hyaluronique", "Peeling", "Microneedling",
  "Radiofréquence", "HIFU", "Épilation laser", "Lash lift", "Microblading",
  "Dermopigmentation", "Maquillage permanent", "Extensions de cils",
  "Lamination de sourcils", "Soin du visage", "HydraFacial",
  "Microdermabrasion", "Cryolipolyse", "Remodelage corporel",
  "Manucure", "Pédicure", "Bronzage",
]

const DAYS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
]

type HoursEntry = { closed: boolean; open: string; close: string }

const DEFAULT_HOURS: Record<string, HoursEntry> = {
  lundi:    { closed: false, open: "09:00", close: "18:00" },
  mardi:    { closed: false, open: "09:00", close: "18:00" },
  mercredi: { closed: false, open: "09:00", close: "18:00" },
  jeudi:    { closed: false, open: "09:00", close: "18:00" },
  vendredi: { closed: false, open: "09:00", close: "17:00" },
  samedi:   { closed: false, open: "10:00", close: "16:00" },
  dimanche: { closed: true,  open: "10:00", close: "16:00" },
}

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-charcoal-700 text-sm font-body font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-charcoal-400 text-xs font-body mt-1">{hint}</p>}
    </div>
  )
}

const chipClass = (active: boolean) =>
  cn(
    "flex items-center justify-center px-4 py-2.5 rounded-lg border text-sm font-body cursor-pointer transition-colors",
    active
      ? "bg-gold-50 border-gold-400 text-gold-700 font-medium"
      : "bg-white border-ivory-300 text-charcoal-500 hover:border-gold-300"
  )

interface Prefill {
  clinicName?: string
  firstName?: string
  lastName?: string
  email?: string
}

export default function OnboardingForm({ prefill }: { prefill?: Prefill }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [clinicName, setClinicName] = useState(prefill?.clinicName ?? "")
  const [ownerFirstName, setOwnerFirstName] = useState(prefill?.firstName ?? "")
  const [ownerLastName, setOwnerLastName] = useState(prefill?.lastName ?? "")
  const [ownerEmail, setOwnerEmail] = useState(prefill?.email ?? "")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [city, setCity] = useState("")
  const [language, setLanguage] = useState<"fr-CA" | "en" | "bilingual">("fr-CA")
  const [agentName, setAgentName] = useState("Sofia")
  const [tone, setTone] = useState<"Chaleureuse" | "Professionnelle" | "Mixte">("Chaleureuse")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customServices, setCustomServices] = useState("")
  const [hours, setHours] = useState<Record<string, HoursEntry>>(DEFAULT_HOURS)
  const [bookingSystem, setBookingSystem] = useState<"Jane App" | "Acuity" | "Bookly" | "Mindbody" | "Aucun">("Aucun")

  const toggleService = (s: string) =>
    setSelectedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const updateHours = (day: string, field: keyof HoursEntry, value: string | boolean) =>
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName, ownerFirstName, ownerLastName, ownerEmail, ownerPhone,
          city, language, agentName, tone, selectedServices, customServices,
          hours, bookingSystem,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      router.push(`/onboarding/confirmation?agent=${encodeURIComponent(data.agentName)}&clinic=${encodeURIComponent(data.clinicName)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <div className="max-w-2xl mx-auto px-5 py-10">

        <div className="text-center mb-10">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={100} height={32} className="mx-auto mb-6" />
          <h1 className="text-charcoal-900 font-display text-3xl font-semibold mb-2">
            Bienvenue chez Vocali
          </h1>
          <p className="text-charcoal-500 text-base">
            Remplissez ce formulaire et nous configurerons votre secrétaire IA dans les 24–48h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── VOTRE CLINIQUE ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <h2 className="text-charcoal-900 font-body font-semibold text-base mb-4">Votre clinique</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nom de la clinique">
                  <input className={inputClass} value={clinicName} onChange={(e) => setClinicName(e.target.value)} required placeholder="Clinique Dermavia" />
                </Field>
              </div>
              <Field label="Ville">
                <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Montréal" />
              </Field>
              <Field label="Langue de service">
                <div className="flex gap-2 mt-0.5">
                  {([["fr-CA", "Français"], ["en", "English"], ["bilingual", "Bilingue"]] as const).map(([val, lbl]) => (
                    <label key={val} className={chipClass(language === val)}>
                      <input type="radio" name="language" value={val} checked={language === val} onChange={() => setLanguage(val)} className="sr-only" />
                      {lbl}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── VOS COORDONNÉES ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <h2 className="text-charcoal-900 font-body font-semibold text-base mb-4">Vos coordonnées</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prénom">
                <input className={inputClass} value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} required placeholder="Marie" />
              </Field>
              <Field label="Nom">
                <input className={inputClass} value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} required placeholder="Tremblay" />
              </Field>
              <Field label="Courriel">
                <input className={inputClass} type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required placeholder="marie@cliniquedermavia.ca" />
              </Field>
              <Field label="Téléphone">
                <input className={inputClass} type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(formatPhone(e.target.value))} placeholder="(514) 555-0000" />
              </Field>
            </div>
          </div>

          {/* ── SECRÉTAIRE IA ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <h2 className="text-charcoal-900 font-body font-semibold text-base mb-1">Votre secrétaire IA</h2>
            <p className="text-charcoal-400 text-sm mb-4">Choisissez son prénom et comment elle parlera à vos clients.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Son prénom" hint="Elle se présentera ainsi au téléphone">
                <input className={inputClass} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Sofia" />
              </Field>
              <Field label="Son ton">
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {(["Chaleureuse", "Professionnelle", "Mixte"] as const).map((t) => (
                    <label key={t} className={cn(
                      "flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-body cursor-pointer transition-colors",
                      tone === t
                        ? "bg-gold-50 border-gold-400 text-gold-700 font-medium"
                        : "bg-white border-ivory-300 text-charcoal-500 hover:border-gold-300"
                    )}>
                      <input type="radio" name="tone" value={t} checked={tone === t} onChange={() => setTone(t)} className="sr-only" />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── SERVICES ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <h2 className="text-charcoal-900 font-body font-semibold text-base mb-1">Services offerts</h2>
            <p className="text-charcoal-400 text-sm mb-4">Sélectionnez les services que vous proposez à votre clientèle.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PREDEFINED_SERVICES.map((service) => {
                const checked = selectedServices.includes(service)
                return (
                  <label key={service} className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-body cursor-pointer transition-colors",
                    checked ? "bg-gold-50 border-gold-300 text-gold-700" : "bg-white border-ivory-300 text-charcoal-600 hover:border-gold-200"
                  )}>
                    <input type="checkbox" checked={checked} onChange={() => toggleService(service)} className="w-3.5 h-3.5 accent-amber-600 flex-shrink-0" />
                    {service}
                  </label>
                )
              })}
            </div>
            <Field label="Autres services" hint="Séparés par des virgules">
              <input className={inputClass} value={customServices} onChange={(e) => setCustomServices(e.target.value)} placeholder="Massage, Drainage lymphatique..." />
            </Field>
          </div>

          {/* ── HEURES ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <h2 className="text-charcoal-900 font-body font-semibold text-base mb-1">Heures d'ouverture</h2>
            <p className="text-charcoal-400 text-sm mb-4">Cochez les jours fermés, ajustez les heures pour les autres.</p>
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => {
                const day = hours[key]
                return (
                  <div key={key} className={cn(
                    "grid grid-cols-[110px_1fr] items-center gap-3 px-3 py-2.5 rounded-lg border",
                    day.closed ? "bg-ivory-50 border-ivory-200" : "bg-white border-ivory-300"
                  )}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={day.closed} onChange={(e) => updateHours(key, "closed", e.target.checked)} className="w-3.5 h-3.5 accent-amber-600" />
                      <span className={cn("text-sm font-body font-medium", day.closed ? "text-charcoal-400" : "text-charcoal-700")}>{label}</span>
                    </label>
                    {day.closed ? (
                      <span className="text-charcoal-400 text-sm font-body">Fermé</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="time" value={day.open} onChange={(e) => updateHours(key, "open", e.target.value)} className="bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-1.5 text-charcoal-800 text-sm font-body focus:outline-none focus:border-gold-400" />
                        <span className="text-charcoal-400 text-sm">→</span>
                        <input type="time" value={day.close} onChange={(e) => updateHours(key, "close", e.target.value)} className="bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-1.5 text-charcoal-800 text-sm font-body focus:outline-none focus:border-gold-400" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── RÉSERVATION ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <h2 className="text-charcoal-900 font-body font-semibold text-base mb-1">Logiciel de réservation</h2>
            <p className="text-charcoal-400 text-sm mb-4">Quel outil utilisez-vous pour gérer vos rendez-vous ?</p>
            <div className="flex flex-wrap gap-2">
              {(["Jane App", "Acuity", "Bookly", "Mindbody", "Aucun"] as const).map((s) => (
                <label key={s} className={chipClass(bookingSystem === s)}>
                  <input type="radio" name="bookingSystem" value={s} checked={bookingSystem === s} onChange={() => setBookingSystem(s)} className="sr-only" />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient text-white font-body font-semibold text-base rounded-xl px-6 py-4 hover:opacity-90 disabled:opacity-50 transition-opacity shadow-gold"
          >
            {loading ? "Création de votre secrétaire…" : "Compléter mon inscription →"}
          </button>

          <p className="text-center text-charcoal-400 text-xs pb-8">
            Des questions ? Écrivez-nous à{" "}
            <a href="mailto:support@vocali.ca" className="text-gold-600 hover:text-gold-500 transition-colors">
              support@vocali.ca
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
