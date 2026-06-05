import { PhoneOff, Moon, CalendarX, Users } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

const icons = [PhoneOff, Moon, CalendarX, Users]

export function Problem({ dict }: Props) {
  const p = dict.problem

  return (
    <section id="probleme" className="bg-dark-warm py-16 lg:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-gold-700/50 to-transparent" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #C9A864 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-16">
          <span className="section-badge-dark mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {p.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            {p.title}
          </h2>
          <p className="text-charcoal-400 text-lg max-w-xl mx-auto leading-relaxed">
            {p.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {p.items.map((item, i) => {
            const Icon = icons[i]
            return (
              <AnimateOnScroll key={item.title} variant="fadeUp" delay={i * 0.1}>
                <div className="group bg-charcoal-800/50 border border-charcoal-700/50 hover:border-gold-700/50 rounded-2xl p-6 transition-all duration-300 hover:bg-charcoal-800/80 h-full">
                  <div className="w-10 h-10 bg-gold-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-800/50 transition-colors">
                    <Icon size={20} className="text-gold-400" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>

        <AnimateOnScroll variant="scaleIn" delay={0.2}>
          <div className="relative bg-gradient-to-br from-gold-900/30 to-gold-800/20 border border-gold-700/40 rounded-3xl p-8 lg:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="lg:flex-1">
                <h3 className="font-serif text-xl lg:text-2xl font-bold text-white mb-3">
                  {p.revenueTitle}
                </h3>
                <p className="text-charcoal-300 leading-relaxed text-base">{p.revenueDesc}</p>
              </div>
              <div className="shrink-0 text-center lg:text-right">
                <p className="font-serif text-5xl lg:text-6xl font-bold text-gold-400 leading-none mb-1">
                  {p.revenueHighlight}
                </p>
                <p className="text-charcoal-400 text-sm">par année</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
