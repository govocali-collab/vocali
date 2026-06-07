import Link from "next/link"
import { MapPin } from "lucide-react"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
  lang: string
}

export function Footer({ dict, lang }: Props) {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <div className="font-serif text-[1.725rem] font-bold text-white mb-3">
              {dict.nav.logo}
              <span className="text-gold-500">.</span>
            </div>
            <p className="text-charcoal-400 text-sm leading-relaxed">
              {dict.footer.tagline}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
                {lang === "fr" ? "Navigation" : "Navigation"}
              </p>
              <ul className="space-y-2.5">
                {[dict.nav.solution, dict.nav.howItWorks, dict.nav.franchise, dict.nav.faq].map(
                  (item) => (
                    <li key={item}>
                      <span className="text-charcoal-400 text-sm hover:text-gold-400 transition-colors cursor-pointer">
                        {item}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <p className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
                {lang === "fr" ? "Légal" : "Legal"}
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href={`/${lang}/privacy`} className="text-charcoal-400 text-sm hover:text-gold-400 transition-colors">
                    {dict.footer.links.privacy}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/terms`} className="text-charcoal-400 text-sm hover:text-gold-400 transition-colors">
                    {dict.footer.links.terms}
                  </Link>
                </li>
                <li>
                  <Link href="mailto:contact@vocali.ca" className="text-charcoal-400 text-sm hover:text-gold-400 transition-colors">
                    {dict.footer.links.contact}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-charcoal-500 text-sm">{dict.footer.copyright}</p>
          <div className="flex items-center gap-1.5 text-charcoal-500 text-sm">
            <MapPin size={12} className="text-gold-600" />
            <span>{dict.footer.madeIn}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
