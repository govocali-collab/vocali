"use client"

import { useState } from "react"
import Link from "next/link"

const STR = {
  fr: {
    fullName: "Prénom et nom",
    email: "Courriel",
    phone: "Téléphone",
    submit: "Recevoir le guide",
    sending: "Envoi en cours…",
    successTitle: "C'est envoyé ! ✉️",
    successBody:
      "Le guide vient d'être envoyé à votre courriel. Vérifiez votre boîte de réception (et vos indésirables au besoin).",
    home: "Retour à l'accueil",
    error: "Une erreur est survenue. Réessayez ou écrivez-nous à contact@vocali.ca.",
    required: "Champs obligatoires",
  },
  en: {
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    submit: "Get the guide",
    sending: "Sending…",
    successTitle: "It's on its way! ✉️",
    successBody:
      "The guide has just been sent to your email. Check your inbox (and your spam folder if needed).",
    home: "Back to home",
    error: "Something went wrong. Please try again or email us at contact@vocali.ca.",
    required: "Required fields",
  },
}

type Status = "idle" | "submitting" | "success" | "error"

export default function GuideForm({ lang = "fr" }: { lang?: string }) {
  const t = STR[lang === "en" ? "en" : "fr"]
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" })
  const [status, setStatus] = useState<Status>("idle")

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    try {
      const src =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("src")
          : null
      const res = await fetch("/api/guide-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, src }),
      })
      if (!res.ok) throw new Error()
      if (typeof window !== "undefined") {
        const w = window as unknown as { gtag?: (...a: unknown[]) => void }
        if (typeof w.gtag === "function") {
          w.gtag("event", "generate_lead", { event_category: "guide_download" })
        }
      }
      setStatus("success")
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setStatus("error")
    }
  }

  const inputCls =
    "w-full bg-ivory-50 border border-ivory-300 rounded-lg px-4 py-3 text-charcoal-900 text-sm placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors"
  const labelCls = "block text-charcoal-500 text-xs font-medium mb-1.5"

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-serif text-3xl font-bold text-charcoal-900 mb-3">{t.successTitle}</h2>
        <p className="text-charcoal-500 leading-relaxed mb-8 max-w-md mx-auto">{t.successBody}</p>
        <Link
          href="/"
          className="inline-flex bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-full px-7 py-3 hover:from-gold-600 hover:to-gold-700 hover:-translate-y-0.5 transition-all duration-200 shadow-gold"
        >
          {t.home}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className={labelCls}>{t.fullName}</label>
        <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{t.email} <span className="text-gold-600">*</span></label>
        <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{t.phone} <span className="text-gold-600">*</span></label>
        <input type="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{t.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-gradient-to-r from-gold-500 to-gold-600 disabled:opacity-60 text-white font-semibold rounded-full px-5 py-3.5 hover:from-gold-600 hover:to-gold-700 hover:-translate-y-0.5 transition-all duration-200 shadow-gold"
      >
        {status === "submitting" ? t.sending : t.submit}
      </button>
      <p className="text-center text-charcoal-300 text-xs">* {t.required}</p>
    </form>
  )
}
