import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

export function HowItWorks({ dict }: Props) {
  const h = dict.howItWorks

  return (
    <section id="fonctionnement" className="bg-ivory-100 py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-20">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {h.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-5">
            {h.title}
          </h2>
          <p className="text-charcoal-500 text-lg max-w-lg mx-auto leading-relaxed">
            {h.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="relative">
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {h.steps.map((step, i) => (
              <AnimateOnScroll key={step.number} variant="fadeUp" delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center lg:items-center">
                  <div className="relative mb-8">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-gold-300 shadow-gold flex items-center justify-center z-10 relative">
                      <span className="font-serif text-xl font-bold text-gold-600">
                        {step.number}
                      </span>
                    </div>
                    {i < h.steps.length - 1 && (
                      <div className="lg:hidden absolute left-1/2 top-full w-px h-8 bg-gradient-to-b from-gold-300 to-transparent -translate-x-1/2 mt-2" />
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-charcoal-500 text-base leading-relaxed max-w-[280px]">
                    {step.desc}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
