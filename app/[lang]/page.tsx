import { getDictionary } from "@/lib/i18n"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Hero } from "@/components/sections/Hero"
import { Problem } from "@/components/sections/Problem"
import { Cost } from "@/components/sections/Cost"
import { Solution } from "@/components/sections/Solution"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Benefits } from "@/components/sections/Benefits"
import { Fit } from "@/components/sections/Fit"
import { Founder } from "@/components/sections/Founder"
import { FAQ } from "@/components/sections/FAQ"
import { FinalCTA } from "@/components/sections/FinalCTA"

type Props = {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  const dict = getDictionary(lang)

  return (
    <>
      <Navbar dict={dict} lang={lang} />
      <main>
        <Hero dict={dict} lang={lang} />
        <Problem dict={dict} />
        <Cost dict={dict} />
        <Solution dict={dict} />
        <HowItWorks dict={dict} />
        <Benefits dict={dict} />
        <Fit dict={dict} />
        <Founder dict={dict} />
        <FAQ dict={dict} />
        <FinalCTA dict={dict} lang={lang} />
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
