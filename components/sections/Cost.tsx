import { Plus } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

export function Cost({ dict }: Props) {
  const c = dict.cost

  return (
    <section id="cout" className="bg-white py-16 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-16">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {c.badge}
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-5">
            {c.title}
          </h2>
          <p className="text-charcoal-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {c.subtitle}
          </p>
        </AnimateOnScroll>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Calcul */}
          <AnimateOnScroll variant="fadeUp" className="h-full">
            <div className="bg-ivory-50 border border-ivory-200 rounded-3xl p-8 shadow-card h-full">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-6">
                {c.exampleLabel}
              </p>
              <div className="mb-6">
                {c.rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-baseline justify-between gap-4 border-b border-ivory-200 py-3 last:border-0"
                  >
                    <span className="text-charcoal-500 text-sm">{r.label}</span>
                    <span className="font-serif text-xl font-bold text-charcoal-900">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-baseline justify-between gap-4 mb-5">
                <span className="text-charcoal-600 text-sm font-medium">{c.resultLabel}</span>
                <span className="font-serif text-2xl font-bold text-charcoal-900">{c.resultValue}</span>
              </div>
              <div className="bg-charcoal-900 rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
                <span className="text-charcoal-300 text-sm">{c.bigLabel}</span>
                <span className="gold-text font-serif text-3xl font-bold">{c.bigValue}</span>
              </div>
              <p className="text-charcoal-400 text-xs mt-4 text-center">{c.note}</p>
            </div>
          </AnimateOnScroll>

          {/* Escalade */}
          <AnimateOnScroll variant="fadeUp" delay={0.15} className="h-full">
            <div className="bg-ivory-50 border border-ivory-200 rounded-3xl p-8 shadow-card h-full">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal-900 mb-8 leading-tight">
                {c.escalateTitle}
              </h3>
              <ul className="mb-8">
                {c.escalateItems.map((it) => (
                  <li key={it} className="flex items-start gap-4 border-b border-ivory-200 py-4">
                    <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Plus size={14} />
                    </span>
                    <span className="text-charcoal-700 text-base">{it}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-charcoal-900 rounded-3xl px-8 py-7 flex items-center justify-between gap-5 mb-5">
                <span className="text-charcoal-300 text-sm leading-snug max-w-[160px]">
                  {c.escalateLead}
                </span>
                <span className="gold-text font-serif text-3xl lg:text-4xl font-bold whitespace-nowrap">
                  {c.escalateValue}
                </span>
              </div>
              <p className="text-charcoal-500 text-sm leading-relaxed">{c.escalateNote}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
