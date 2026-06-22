import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import ContactForm from "./ContactForm"

const PAGE_TITLE = "Contactez-nous — Vocali"
const PAGE_DESC =
  "Laissez-nous vos coordonnées et notre équipe vous recontacte dans les 24 heures pour une démonstration de Vocali."

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: { canonical: "https://vocali.ca/contact" },
  openGraph: {
    type: "website",
    url: "https://vocali.ca/contact",
    siteName: "Vocali",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vocali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: ["/og-image.png"],
  },
}

const COPY = {
  fr: {
    badge: "Programme fondateur",
    title: "Contactez-nous",
    subtitle: "Laissez-nous vos coordonnées, nous vous recontactons dans les 24 heures.",
    back: "← Retour",
  },
  en: {
    badge: "Founder program",
    title: "Contact us",
    subtitle: "Leave us your details and we'll get back to you within 24 hours.",
    back: "← Back",
  },
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang } = await searchParams
  const l = lang === "en" ? "en" : "fr"
  const c = COPY[l]

  return (
    <div className="min-h-screen bg-ivory-100 font-body flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto w-full">
        <Link href="/">
          <Image src="/vocali-logo-black.png" alt="Vocali" width={120} height={37} priority />
        </Link>
        <Link href="/" className="text-charcoal-400 text-sm hover:text-gold-600 transition-colors">
          {c.back}
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <span className="section-badge mb-5 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              {c.badge}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight mb-3">
              {c.title}
            </h1>
            <p className="text-charcoal-500 leading-relaxed">{c.subtitle}</p>
          </div>

          <div className="bg-white border border-ivory-300 rounded-2xl shadow-card p-6 sm:p-8">
            <ContactForm lang={l} />
          </div>
        </div>
      </main>
    </div>
  )
}
