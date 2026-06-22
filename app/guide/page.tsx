import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import GuideForm from "./GuideForm"

const PAGE_TITLE = "Guide Vocali (tarifs inclus) — téléchargement"
const PAGE_DESC =
  "Recevez le guide complet de Vocali par courriel : fonctionnement, bénéfices et tous les tarifs. Entrez vos coordonnées et on vous l'envoie."

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: { canonical: "https://vocali.ca/guide" },
  openGraph: {
    type: "website",
    url: "https://vocali.ca/guide",
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
    badge: "Guide complet · Tarifs inclus",
    title: "Téléchargez le guide Vocali",
    subtitle:
      "Tout sur le Système Vocali 24/7 : fonctionnement, bénéfices et tarifs. Laissez vos coordonnées, on vous l'envoie par courriel.",
    back: "← Retour",
  },
  en: {
    badge: "Full guide · Pricing included",
    title: "Download the Vocali guide",
    subtitle:
      "Everything about the Vocali 24/7 System: how it works, benefits and pricing. Leave your details and we'll email it to you.",
    back: "← Back",
  },
}

export default async function GuidePage({
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
            <GuideForm lang={l} />
          </div>
        </div>
      </main>
    </div>
  )
}
