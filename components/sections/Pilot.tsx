import { ArrowRight, Quote } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import { CalPopupButton } from "@/components/ui/CalPopupButton"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

export function Pilot({ dict }: Props) {
  const p = dict.pilot

  return (
    <section id="pilote" className="bg-ivory-100 py-16 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-16">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {p.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-5">
            {p.title}
          </h2>
          <p className="text-charcoal-500 text-lg max-w-xl mx-auto leading-relaxed">
            {p.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="grid lg:grid-cols-3 gap-5 mb-12">
          {[0, 1, 2].map((i) => (
            <AnimateOnScroll key={i} variant="fadeUp" delay={i * 0.1}>
              <div className="bg-white border border-dashed border-ivory-400 rounded-3xl p-8 h-48 flex flex-col items-center justify-center text-center group hover:border-gold-300 hover:bg-ivory-50 transition-all duration-300">
                <Quote size={28} className="text-ivory-400 group-hover:text-gold-300 transition-colors mb-3" />
                <p className="text-charcoal-300 text-sm italic group-hover:text-charcoal-400 transition-colors">
                  {p.testimonialPlaceholder}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll variant="scaleIn" delay={0.3}>
          <div className="bg-white border border-gold-200 rounded-3xl p-10 lg:p-14 text-center shadow-card">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {p.spotsLeft}
            </div>
            <h3 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal-900 mb-3">
              {p.ctaTitle}
            </h3>
            <p className="text-charcoal-500 mb-8">{p.ctaSubtitle}</p>
            <CalPopupButton size="lg">
              {p.cta}
              <ArrowRight size={18} />
            </CalPopupButton>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
