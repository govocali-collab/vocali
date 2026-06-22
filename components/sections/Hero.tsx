"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, FileText } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { DemoRequestButton } from "@/components/ui/DemoRequestButton"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
  lang: string
}

export function Hero({ dict, lang }: Props) {
  const h = dict.hero

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient"
    >
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #C9A864 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-radial from-gold-100/30 to-transparent rounded-full -translate-y-1/3 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <span className="section-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            {h.badge}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-5xl lg:text-6xl xl:text-7xl font-bold text-charcoal-900 leading-[1.08] tracking-tight mb-6 text-balance"
        >
          {lang === "fr" ? (
            <>
              Arrêtez de perdre des{" "}
              <span className="gold-text">clientes</span>
              {" "}à cause des appels manqués.
            </>
          ) : (
            <>
              Stop losing{" "}
              <span className="gold-text">clients</span>
              {" "}to missed calls.
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg lg:text-xl text-charcoal-500 leading-relaxed mb-10 max-w-xl mx-auto"
        >
          {h.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-10 justify-center"
        >
          <DemoRequestButton size="lg" lang={lang}>
            {h.ctaPrimary}
            <ArrowRight size={18} />
          </DemoRequestButton>
          <Button variant="secondary" size="lg" href="/demo">
            <Play size={16} className="shrink-0" />
            {h.ctaSecondary}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Link
            href={lang === "en" ? "/guide?lang=en" : "/guide"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors"
          >
            <FileText size={16} />
            {lang === "fr"
              ? "Télécharger le guide complet (tarifs inclus)"
              : "Download the full guide (pricing included)"}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm text-charcoal-400"
        >
          {h.trustedBy}
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
