import { ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll"
import { DemoRequestButton } from "@/components/ui/DemoRequestButton"
import type { Dictionary } from "@/lib/i18n"

interface Props {
  dict: Dictionary
  lang?: string
}

export function FinalCTA({ dict, lang = "fr" }: Props) {
  const c = dict.finalCta

  return (
    <section className="py-16 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gold-gradient" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <AnimateOnScroll variant="fadeUp">
          <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 text-balance">
            {c.title}
          </h2>
          <p className="text-white/75 text-lg mb-10">{c.subtitle}</p>

          <DemoRequestButton variant="white" size="lg" lang={lang}>
            {c.cta}
            <ArrowRight size={20} />
          </DemoRequestButton>

          <p className="text-white/50 text-sm mt-6">{c.note}</p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
