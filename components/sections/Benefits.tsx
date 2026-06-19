import { TrendingUp, PhoneCall, Star, Heart, Clock, Zap } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

const icons = [TrendingUp, PhoneCall, Star, Heart, Clock, Zap]
const colors = [
  "from-emerald-100 to-emerald-200 text-emerald-700",
  "from-blue-100 to-blue-200 text-blue-700",
  "from-gold-100 to-gold-200 text-gold-700",
  "from-rose-100 to-rose-200 text-rose-700",
  "from-purple-100 to-purple-200 text-purple-700",
  "from-amber-100 to-amber-200 text-amber-700",
]

export function Benefits({ dict }: Props) {
  const b = dict.benefits

  return (
    <section id="benefices" className="bg-ink-card py-16 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-16">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {b.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-5">
            {b.title}
          </h2>
          <p className="text-charcoal-500 text-lg max-w-xl mx-auto leading-relaxed">
            {b.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {b.items.map((item, i) => {
            const Icon = icons[i]
            const colorClass = colors[i]
            return (
              <AnimateOnScroll key={item.title} variant="fadeUp" delay={i * 0.1}>
                <div className="group relative rounded-3xl p-8 h-full transition-all duration-300 hover:shadow-card-hover bg-ivory-50 border border-ivory-200 hover:border-gold-200">
                  <div
                    className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} items-center justify-center mb-5`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-500 text-sm leading-relaxed">{item.desc}</p>
                  <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full border border-gold-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
