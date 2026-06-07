"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, Phone, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { CalPopupButton } from "@/components/ui/CalPopupButton"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
  lang: string
}

function CallCard({ c }: { c: Dictionary["hero"]["callCard"] }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-gold-300/40"
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-3xl border border-gold-200/30"
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      <motion.div
        className="relative bg-white rounded-3xl shadow-luxury border border-ivory-300/80 p-7 w-[360px]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs text-charcoal-500 font-medium">{c.live}</span>
          </div>
          <span className="text-xs text-charcoal-400">Maintenant</span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-ivory-100 rounded-2xl mb-5">
          <div className="relative shrink-0">
            <div className="w-11 h-11 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full flex items-center justify-center">
              <User size={18} className="text-gold-700" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-gold-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal-900 truncate">{c.newClient}</p>
            <p className="text-xs text-charcoal-400">{c.phone}</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-semibold px-2 py-1 rounded-full">
              <Phone size={10} />
              {c.online}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gold-600">{c.aiName}</span>
          </div>
          <motion.div
            className="bg-ivory-100 rounded-2xl rounded-tl-sm px-4 py-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <p className="text-sm text-charcoal-700 leading-relaxed italic">
              &ldquo;{c.message}&rdquo;
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-ivory-300">
          {[
            { label: c.stat1Label, value: c.stat1Value },
            { label: c.stat2Label, value: c.stat2Value },
            { label: c.stat3Label, value: c.stat3Value },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center py-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 + i * 0.15 }}
            >
              <p className="text-base font-bold text-charcoal-900">{stat.value}</p>
              <p className="text-xs text-charcoal-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-3 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.2, type: "spring", stiffness: 250, damping: 20 }}
      >
        {c.captured}
      </motion.div>
    </div>
  )
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
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-gold-100/30 to-transparent rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-[minmax(0,560px)_auto] gap-16 items-center justify-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
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
                  Ne manquez{" "}
                  <span className="gold-text">plus jamais</span>
                  {" "}un appel client.
                </>
              ) : (
                <>
                  Never Miss{" "}
                  <span className="gold-text">Another</span>
                  {" "}Client Call.
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg lg:text-xl text-charcoal-500 leading-relaxed mb-10 max-w-lg"
            >
              {h.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col gap-4 mb-10 max-w-sm"
            >
              <CalPopupButton size="lg">
                {h.ctaPrimary}
                <ArrowRight size={18} />
              </CalPopupButton>
              <Button variant="secondary" size="lg">
                <Play size={16} className="shrink-0" />
                {h.ctaSecondary}
              </Button>
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <CallCard c={h.callCard} />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
