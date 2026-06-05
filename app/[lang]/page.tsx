import { getDictionary } from "@/lib/i18n"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Hero } from "@/components/sections/Hero"
import { Problem } from "@/components/sections/Problem"
import { Solution } from "@/components/sections/Solution"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Benefits } from "@/components/sections/Benefits"
import { Franchise } from "@/components/sections/Franchise"
import { Pilot } from "@/components/sections/Pilot"
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
        <Solution dict={dict} />
        <HowItWorks dict={dict} />
        <Benefits dict={dict} />
        <Franchise dict={dict} />
        <Pilot dict={dict} />
        <FAQ dict={dict} />
        <FinalCTA dict={dict} />
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
