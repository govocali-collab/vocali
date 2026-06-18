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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-charcoal-400 text-xs font-body font-semibold uppercase tracking-widest mb-4 pt-2">
      {children}
    </h2>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-charcoal-600 text-sm font-body font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-charcoal-400 text-xs font-body mt-1">{hint}</p>}
    </div>
  )
}

const inputClass =
  "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"

const radioClass = (active: boolean) =>
  cn(
    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-body cursor-pointer transition-colors",
    active
      ? "bg-gold-50 border-gold-400 text-gold-700 font-medium"
      : "bg-white border-ivory-300 text-charcoal-500 hover:border-gold-300"
  )

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [twilioWarning, setTwilioWarning] = useState("")

  // Clinic info
  const [clinicName, setClinicName] = useState("")
  const [ownerFirstName, setOwnerFirstName] = useState("")
  const [ownerLastName, setOwnerLastName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [city, setCity] = useState("")
  const [language, setLanguage] = useState<"fr-CA" | "en" | "bilingual">("fr-CA")

  // Agent config
  const [agentName, setAgentName] = useState("Alexandra")
  const [tone, setTone] = useState<"Chaleureuse" | "Professionnelle" | "Mixte">("Chaleureuse")
  const [systemPromptOverride, setSystemPromptOverride] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Services
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customServices, setCustomServices] = useState("")

  // Hours
  const [hours, setHours] = useState<Record<string, HoursEntry>>(DEFAULT_HOURS)

  // Booking
  const [bookingSystem, setBookingSystem] = useState<"Jane App" | "Acuity" | "Bookly" | "Mindbody" | "Aucun">("Aucun")
  const [bookingCreds, setBookingCreds] = useState("")

  // Numéro Twilio (choix avant création)
  const [numberCountry, setNumberCountry] = useState("CA")
  const [numberAreaCode, setNumberAreaCode] = useState("")
  const [numberResults, setNumberResults] = useState<{ phoneNumber: string; friendlyName: string; region: string; locality: string }[]>([])
  const [searchingNumbers, setSearchingNumbers] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState("")
  const [numberError, setNumberError] = useState("")

  async function searchNumbers() {
    setSearchingNumbers(true)
    setNumberError("")
    setNumberResults([])
    try {
      const params = new URLSearchParams({ country: numberCountry })
      if (numberAreaCode) params.set("areaCode", numberAreaCode)
      const res = await fetch(`/api/admin/available-numbers?${params}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setNumberResults(data.numbers)
    } catch (err) {
      setNumberError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSearchingNumbers(false)
    }
  }

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  const updateHours = (day: string, field: keyof HoursEntry, value: string | boolean) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName, ownerFirstName, ownerLastName, ownerEmail, ownerPhone,
          city, language, agentName, tone, systemPromptOverride, websiteUrl,
          selectedServices, customServices, hours, bookingSystem, bookingCreds,
          phoneNumber: selectedNumber,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      if (data.twilioError) {
        setTwilioWarning(`Compte créé, mais numéro Twilio non assigné : ${data.twilioError}`)
        setLoading(false)
        return
      }
      router.push("/admin/clinics")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Image src="/vocali-logo-black.png" alt="Vocali" width={104} height={32} className="mb-3" />
            <h1 className="text-charcoal-900 font-display text-2xl font-semibold">
              Nouvelle clinique
            </h1>
            <p className="text-charcoal-500 text-sm mt-1">
              Remplissez ce formulaire et nous configurerons votre secrétaire IA dans les 24–48h.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── CLINIC INFO ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <SectionTitle>Informations de la clinique</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom de la clinique">
                <input className={inputClass} value={clinicName} onChange={(e) => setClinicName(e.target.value)} required placeholder="Clinique Dermavia" />
              </Field>
              <Field label="Ville">
                <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Montréal" />
              </Field>
              <Field label="Prénom du propriétaire">
                <input className={inputClass} value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} required placeholder="Marie" />
              </Field>
              <Field label="Nom du propriétaire">
                <input className={inputClass} value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} required placeholder="Tremblay" />
              </Field>
              <Field label="Courriel">
                <input className={inputClass} type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required placeholder="marie@cliniquelumiere.ca" />
              </Field>
              <Field label="Téléphone">
                <input className={inputClass} type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(formatPhone(e.target.value))} placeholder="(514) 555-0000" />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Langue préférée">
                <div className="flex gap-2 mt-1">
                  {(["fr-CA", "en", "bilingual"] as const).map((l) => (
                    <label key={l} className={radioClass(language === l)}>
                      <input type="radio" name="language" value={l} checked={language === l} onChange={() => setLanguage(l)} className="sr-only" />
                      {l === "fr-CA" ? "Français" : l === "en" ? "English" : "Bilingue"}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── NUMÉRO DE TÉLÉPHONE ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <SectionTitle>Numéro de téléphone</SectionTitle>
            <p className="text-charcoal-500 text-sm mb-4">
              Cherche et choisis le numéro Twilio de la clinique. Laisse vide pour qu'un numéro soit choisi automatiquement selon la ville.
            </p>

            {selectedNumber ? (
              <div className="flex items-center gap-3">
                <span className="flex-1 bg-gold-50 border border-gold-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm font-body font-mono">
                  {selectedNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNumber("")}
                  className="text-charcoal-400 text-xs font-body hover:text-red-500 transition-colors whitespace-nowrap"
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    className={cn(inputClass, "w-24 flex-shrink-0")}
                    value={numberCountry}
                    onChange={(e) => setNumberCountry(e.target.value)}
                  >
                    <option value="CA">🇨🇦 CA</option>
                    <option value="US">🇺🇸 US</option>
                  </select>
                  <input
                    className={cn(inputClass, "flex-1")}
                    value={numberAreaCode}
                    onChange={(e) => setNumberAreaCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Indicatif régional (ex: 514)"
                    maxLength={3}
                  />
                  <button
                    type="button"
                    onClick={searchNumbers}
                    disabled={searchingNumbers}
                    className="bg-charcoal-800 hover:bg-charcoal-900 text-white font-body font-medium text-sm rounded-lg px-4 py-2.5 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {searchingNumbers ? "…" : "Rechercher"}
                  </button>
                </div>

                {numberError && <p className="text-red-500 text-xs font-body">{numberError}</p>}

                {numberResults.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {numberResults.map((n) => (
                      <button
                        key={n.phoneNumber}
                        type="button"
                        onClick={() => { setSelectedNumber(n.phoneNumber); setNumberResults([]) }}
                        className="w-full flex items-center justify-between bg-white border border-ivory-200 rounded-lg px-3 py-2 hover:border-gold-300 transition-colors text-left"
                      >
                        <span className="text-charcoal-900 text-sm font-body font-mono">{n.friendlyName}</span>
                        {(n.locality || n.region) && (
                          <span className="text-charcoal-400 text-xs font-body ml-2">{[n.locality, n.region].filter(Boolean).join(", ")}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── AGENT CONFIG ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <SectionTitle>Configuration de l'agent</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Nom de l'agent" hint="Affiché dans les emails et le dashboard">
                <input className={inputClass} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Alexandra" />
              </Field>
              <Field label="Ton de l'agent">
                <div className="flex gap-2 mt-1">
                  {(["Chaleureuse", "Professionnelle", "Mixte"] as const).map((t) => (
                    <label key={t} className={radioClass(tone === t)}>
                      <input type="radio" name="tone" value={t} checked={tone === t} onChange={() => setTone(t)} className="sr-only" />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div className="space-y-4 mt-4">
              <Field label="Site web de la clinique" hint="L'agent IA scrappera ce site pour enrichir ses réponses (services, produits, équipe, politiques…)">
                <input
                  className={inputClass}
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://macliniqueesthetique.com"
                />
              </Field>
              <Field label="Instructions spéciales (system prompt override)" hint="Instructions supplémentaires pour personnaliser le comportement de l'agent.">
                <textarea
                  className={cn(inputClass, "min-h-[100px] resize-y")}
                  value={systemPromptOverride}
                  onChange={(e) => setSystemPromptOverride(e.target.value)}
                  placeholder="Ex : Toujours mentionner la promotion du mois. Ne jamais confirmer de prix sans consulter la grille tarifaire..."
                />
              </Field>
            </div>
          </div>

          {/* ── SERVICES ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <SectionTitle>Services offerts</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PREDEFINED_SERVICES.map((service) => {
                const checked = selectedServices.includes(service)
                return (
                  <label
                    key={service}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-body cursor-pointer transition-colors",
                      checked
                        ? "bg-gold-50 border-gold-300 text-gold-700"
                        : "bg-white border-ivory-300 text-charcoal-600 hover:border-gold-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service)}
                      className="w-3.5 h-3.5 accent-amber-600 flex-shrink-0"
                    />
                    {service}
                  </label>
                )
              })}
            </div>
            <Field label="Services personnalisés" hint="Séparés par des virgules">
              <input
                className={inputClass}
                value={customServices}
                onChange={(e) => setCustomServices(e.target.value)}
                placeholder="Massage, Drainage lymphatique, Cryothérapie..."
              />
            </Field>
          </div>

          {/* ── HOURS ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <SectionTitle>Heures d'opération</SectionTitle>
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => {
                const day = hours[key]
                return (
                  <div key={key} className={cn(
                    "grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center gap-3 px-3 py-2.5 rounded-lg border",
                    day.closed ? "bg-ivory-50 border-ivory-200" : "bg-white border-ivory-300"
                  )}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.closed}
                        onChange={(e) => updateHours(key, "closed", e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-600"
                      />
                      <span className={cn("text-sm font-body font-medium", day.closed ? "text-charcoal-400" : "text-charcoal-700")}>
                        {label}
                      </span>
                    </label>

                    {day.closed ? (
                      <span className="text-charcoal-400 text-sm font-body">Fermé</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={day.open}
                          onChange={(e) => updateHours(key, "open", e.target.value)}
                          className="bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-1.5 text-charcoal-800 text-sm font-body focus:outline-none focus:border-gold-400"
                        />
                        <span className="text-charcoal-400 text-sm">→</span>
                        <input
                          type="time"
                          value={day.close}
                          onChange={(e) => updateHours(key, "close", e.target.value)}
                          className="bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-1.5 text-charcoal-800 text-sm font-body focus:outline-none focus:border-gold-400"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── BOOKING ── */}
          <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-card">
            <SectionTitle>Système de réservation</SectionTitle>
            <Field label="Logiciel utilisé">
              <select
                value={bookingSystem}
                onChange={(e) => setBookingSystem(e.target.value as typeof bookingSystem)}
                className={inputClass}
              >
                {["Jane App", "Acuity", "Bookly", "Mindbody", "Aucun"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            {bookingSystem !== "Aucun" && (
              <div className="mt-4">
                <Field label="Identifiants / Accès" hint="Stocké de façon sécurisée dans clinic_config.booking_creds">
                  <textarea
                    className={cn(inputClass, "min-h-[80px] resize-y font-mono text-xs")}
                    value={bookingCreds}
                    onChange={(e) => setBookingCreds(e.target.value)}
                    placeholder="URL du portail, identifiant, mot de passe..."
                  />
                </Field>
              </div>
            )}
          </div>

          {/* ── SUBMIT ── */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
              {error}
            </div>
          )}

          {twilioWarning && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-body space-y-2">
              <p className="font-semibold">Compte créé — numéro Twilio manquant</p>
              <p>{twilioWarning}</p>
              <p>Assigne un numéro manuellement depuis la fiche de la clinique, puis clique «&nbsp;Activer&nbsp;».</p>
              <button
                type="button"
                onClick={() => router.push("/admin/clinics")}
                className="mt-1 text-amber-800 underline underline-offset-2 text-xs"
              >
                Voir les cliniques →
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 pb-8">
            <p className="text-charcoal-400 text-xs font-body">
              Crée la clinique, achète un numéro Twilio, envoie l'email de bienvenue.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="bg-gold-gradient text-white font-body font-semibold text-sm rounded-lg px-6 py-3 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Création en cours…" : "Créer la clinique →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
