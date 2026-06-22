"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Props {
  lang?: string
  onClose: () => void
}

const STR = {
  fr: {
    title: "Réserver une démonstration",
    subtitle: "Laissez-nous vos coordonnées, nous vous recontactons sous 24 h.",
    fullName: "Prénom et nom",
    company: "Entreprise",
    email: "Courriel",
    phone: "Téléphone",
    message: "Votre besoin (optionnel)",
    messagePh: "En quelques mots, votre situation…",
    submit: "Envoyer ma demande",
    sending: "Envoi en cours…",
    successTitle: "Merci !",
    successBody:
      "Votre demande a bien été reçue. Nous vous recontactons dans les prochaines 24 heures.",
    close: "Fermer",
    error: "Une erreur est survenue. Réessayez ou écrivez-nous à contact@vocali.ca.",
    required: "Champs obligatoires",
  },
  en: {
    title: "Book a demo",
    subtitle: "Leave us your details, we'll get back to you within 24 hours.",
    fullName: "Full name",
    company: "Business",
    email: "Email",
    phone: "Phone",
    message: "What you need (optional)",
    messagePh: "In a few words, your situation…",
    submit: "Send my request",
    sending: "Sending…",
    successTitle: "Thank you!",
    successBody:
      "Your request has been received. We'll get back to you within the next 24 hours.",
    close: "Close",
    error: "Something went wrong. Please try again or email us at contact@vocali.ca.",
    required: "Required fields",
  },
}

type Status = "idle" | "submitting" | "success" | "error"

export default function DemoRequestModal({ lang = "fr", onClose }: Props) {
  const t = STR[lang === "en" ? "en" : "fr"]
  const [form, setForm] = useState({ fullName: "", company: "", email: "", phone: "", message: "" })
  const [status, setStatus] = useState<Status>("idle")

  // Fermer avec Échap + verrouiller le défilement du fond.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      if (typeof window !== "undefined") {
        const w = window as unknown as { gtag?: (...a: unknown[]) => void }
        if (typeof w.gtag === "function") {
          w.gtag("event", "generate_lead", { event_category: "demo_request", event_label: form.company })
        }
      }
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  const inputCls =
    "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-2.5 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"
  const labelCls = "block text-charcoal-500 text-xs font-medium mb-1.5"

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-0 sm:p-4 font-body"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full sm:max-w-md sm:w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-luxury p-6 sm:p-8 relative animate-[slideUp_.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 transition-colors"
        >
          <X size={20} />
        </button>

        {status === "success" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">{t.successTitle}</h2>
            <p className="text-charcoal-500 text-sm leading-relaxed mb-6">{t.successBody}</p>
            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold text-sm rounded-full px-6 py-2.5 hover:from-gold-600 hover:to-gold-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-1 pr-8">{t.title}</h2>
            <p className="text-charcoal-500 text-sm mb-6">{t.subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>
                  {t.fullName} <span className="text-gold-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t.company}</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {t.email} <span className="text-gold-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {t.phone} <span className="text-gold-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.message}</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder={t.messagePh}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {t.error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 disabled:opacity-60 text-white font-semibold text-sm rounded-full px-5 py-3 hover:from-gold-600 hover:to-gold-700 hover:-translate-y-0.5 transition-all duration-200 shadow-gold"
              >
                {status === "submitting" ? t.sending : t.submit}
              </button>
              <p className="text-center text-charcoal-300 text-xs">* {t.required}</p>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  )
}
