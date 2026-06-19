import Image from "next/image"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
}

export function Founder({ dict }: Props) {
  const f = dict.founder

  return (
    <section id="fondateur" className="bg-white py-16 lg:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-gold-300/60 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll variant="fadeUp" className="text-center mb-12">
          <span className="section-badge mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {f.badge}
          </span>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-charcoal-900 leading-tight">
            {f.headline}
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll variant="fadeUp" delay={0.15}>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-14">
            {/* Photo placeholder */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <Image
                src="/photo-moi.png"
                alt={f.photoAlt}
                width={120}
                height={120}
                className="w-[120px] h-[120px] rounded-full object-cover border-2 border-gold-200"
              />
              <div className="text-center">
                <p className="font-semibold text-charcoal-900 text-sm">{f.name}</p>
                <p className="text-charcoal-400 text-xs">{f.title}</p>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-charcoal-600 text-lg leading-relaxed mb-8">
                {f.body}
              </p>
              <p className="text-charcoal-400 text-sm font-medium">{f.madeIn}</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
