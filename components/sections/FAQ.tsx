"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface Props {
  dict: Dictionary
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <AnimateOnScroll variant="fadeUp" delay={index * 0.06}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full text-left border rounded-2xl px-7 py-6 transition-all duration-200 group",
          open
            ? "bg-ivory-50 border-gold-300 shadow-card"
            : "bg-white border-ivory-300 hover:border-gold-200 hover:bg-ivory-50"
        )}
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-4">
          <h3
            className={cn(
              "text-base font-semibold leading-snug transition-colors",
              open ? "text-charcoal-900" : "text-charcoal-800 group-hover:text-charcoal-900"
            )}
          >
            {q}
          </h3>
          <div
            className={cn(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              open
                ? "bg-gold-500 text-white"
                : "bg-ivory-200 text-charcoal-500 group-hover:bg-gold-100 group-hover:text-gold-600"
            )}
          >
            {open ? <Minus size={16} /> : <Plus size={16} />}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="text-charcoal-500 text-sm leading-relaxed mt-4 pr-12">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </AnimateOnScroll>
  )
}

export function FAQ({ dict }: Props) {
  const f = dict.faq

  return (
    <section id="faq" className="bg-ivory-100 py-16 lg:py-36">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-14">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {f.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
            {f.title}
          </h2>
        </AnimateOnScroll>

        <div className="space-y-3">
          {f.items.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
