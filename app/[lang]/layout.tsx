import type { Metadata } from "next"
import { getDictionary, type Lang } from "@/lib/i18n"

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return [{ lang: "fr" }, { lang: "en" }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = getDictionary(lang)

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${lang}`,
      siteName: "Vocali",
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const validLang = (lang as Lang) === "en" ? "en" : "fr"
  void validLang
  return <>{children}</>
}
