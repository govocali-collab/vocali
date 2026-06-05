import { Zap, Clock, Globe, MessageCircle, UserCheck, CalendarCheck, MessageSquare } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

const featureIcons = [Zap, Clock, Globe, MessageCircle, UserCheck, CalendarCheck, MessageSquare]

export function Solution({ dict }: Props) {
  const s = dict.solution

  return (
    <section id="solution" className="bg-white py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-16">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {s.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-5">
            {s.title}
          </h2>
          <p className="text-charcoal-500 text-lg max-w-xl mx-auto leading-relaxed">
            {s.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {s.features.slice(0, 6).map((feature, i) => {
            const Icon = featureIcons[i]
            return (
              <AnimateOnScroll key={feature.title} variant="fadeUp" delay={i * 0.08}>
                <div className="group bg-ivory-50 hover:bg-white border border-ivory-300 hover:border-gold-200 hover:shadow-card rounded-2xl p-7 transition-all duration-300 h-full">
                  <div className="w-11 h-11 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-gold-200 group-hover:to-gold-300 transition-all">
                    <Icon size={20} className="text-gold-700" />
                  </div>
                  <h3 className="text-charcoal-900 font-semibold text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-charcoal-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>

        {s.features[6] && (
          <AnimateOnScroll variant="fadeUp" delay={0.5} className="mt-5">
            <div className="group bg-gradient-to-r from-gold-50 to-ivory-100 border border-gold-200 hover:border-gold-300 hover:shadow-gold rounded-2xl p-7 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-11 h-11 bg-gradient-to-br from-gold-200 to-gold-300 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare size={20} className="text-gold-700" />
                </div>
                <div>
                  <h3 className="text-charcoal-900 font-semibold text-base mb-1">
                    {s.features[6].title}
                  </h3>
                  <p className="text-charcoal-500 text-sm leading-relaxed">{s.features[6].desc}</p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  )
}
