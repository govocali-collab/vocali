"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Button } from "./ui/Button"
import { CalPopupButton } from "./ui/CalPopupButton"
import type { Dictionary } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface Props {
  dict: Dictionary
  lang: string
}

const navLinks = (dict: Dictionary, lang: string) => [
  { label: dict.nav.solution, href: `/${lang}#solution` },
  { label: dict.nav.howItWorks, href: `/${lang}#fonctionnement` },
  { label: dict.nav.franchise, href: `/${lang}#franchises` },
  { label: dict.nav.faq, href: `/${lang}#faq` },
]

export function Navbar({ dict, lang }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const links = navLinks(dict, lang)

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-ink-card/90 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.08)] border-b border-ivory-300"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-18 py-4">
          <Link
            href={`/${lang}`}
            className="font-serif text-[1.984rem] font-bold tracking-tight text-charcoal-900"
          >
            {dict.nav.logo}
            <span className="text-gold-500">.</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} />
            <CalPopupButton size="sm" lang={lang}>
              {dict.nav.cta}
            </CalPopupButton>
          </div>

          <button
            className="lg:hidden p-2 rounded-xl text-charcoal-700 hover:bg-ivory-200 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink-card pt-20 px-6 pb-10 flex flex-col lg:hidden"
          >
            <nav className="flex flex-col gap-1 mb-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-4 text-lg font-medium text-charcoal-800 hover:bg-ivory-100 rounded-2xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 px-4">
              <LanguageSwitcher currentLang={lang} />
            </div>
            <div className="mt-6 px-4">
              <CalPopupButton size="lg" className="w-full" lang={lang}>
                {dict.nav.cta}
              </CalPopupButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
