import { Check, X } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

export function Fit({ dict }: Props) {
  const f = dict.fit

  return (
    <section id="pour-qui" className="bg-ivory-100 py-16 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-16">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {f.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-5">
            {f.title}
          </h2>
          <p className="text-charcoal-500 text-lg max-w-xl mx-auto leading-relaxed">
            {f.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Pour vous */}
          <AnimateOnScroll variant="fadeUp">
            <div className="bg-white border border-ivory-200 rounded-3xl p-8 shadow-card h-full">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-6">
                {f.forTitle}
              </p>
              <ul className="space-y-4">
                {f.forItems.map((it) => (
                  <li key={it} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="text-charcoal-700 text-[15px] leading-snug">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>

          {/* Pas pour vous */}
          <AnimateOnScroll variant="fadeUp" delay={0.12}>
            <div className="bg-ivory-50 border border-ivory-200 rounded-3xl p-8 h-full">
              <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-400 mb-6">
                {f.notTitle}
              </p>
              <ul className="space-y-4">
                {f.notItems.map((it) => (
                  <li key={it} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-charcoal-100 text-charcoal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X size={13} strokeWidth={3} />
                    </span>
                    <span className="text-charcoal-500 text-[15px] leading-snug">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Offre fondatrice */}
        <AnimateOnScroll variant="scaleIn" delay={0.1}>
          <div className="relative bg-charcoal-900 rounded-3xl p-8 lg:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                {f.offerBadge}
              </span>
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4 max-w-2xl">
                {f.offerTitle}
              </h3>
              <p className="text-charcoal-300 text-base leading-relaxed max-w-2xl">
                {f.offerDesc}
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
