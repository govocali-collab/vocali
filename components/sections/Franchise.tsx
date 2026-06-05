import { LayoutGrid, Shield, BarChart3, Rocket, ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import { Button } from "@/components/ui/Button"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

const icons = [LayoutGrid, Shield, BarChart3, Rocket]

export function Franchise({ dict }: Props) {
  const f = dict.franchise

  return (
    <section id="franchises" className="bg-dark-warm py-28 lg:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-700/50 to-transparent" />

      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimateOnScroll variant="fadeLeft">
            <span className="section-badge-dark mb-6 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              {f.badge}
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {f.title}
            </h2>
            <p className="text-charcoal-400 text-lg leading-relaxed mb-10">
              {f.subtitle}
            </p>
            <Button variant="outline-gold" size="lg">
              {f.cta}
              <ArrowRight size={18} />
            </Button>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 gap-4">
            {f.features.map((feature, i) => {
              const Icon = icons[i]
              return (
                <AnimateOnScroll key={feature.title} variant="fadeUp" delay={i * 0.1}>
                  <div className="bg-charcoal-800/60 border border-charcoal-700/50 hover:border-gold-700/50 rounded-2xl p-6 transition-all duration-300 group h-full">
                    <div className="w-10 h-10 bg-gold-900/50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-800/60 transition-colors">
                      <Icon size={18} className="text-gold-400" />
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-2">{feature.title}</h3>
                    <p className="text-charcoal-400 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
