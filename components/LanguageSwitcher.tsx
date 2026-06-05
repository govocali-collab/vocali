"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  currentLang: string
}

export function LanguageSwitcher({ currentLang }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  function switchLang(lang: string) {
    const newPath = pathname.replace(/^\/(fr|en)/, `/${lang}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-0.5 bg-charcoal-100/60 rounded-full p-0.5">
      {(["fr", "en"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => switchLang(lang)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200",
            currentLang === lang
              ? "bg-charcoal-900 text-white shadow-sm"
              : "text-charcoal-500 hover:text-charcoal-800"
          )}
          aria-label={lang === "fr" ? "Version française" : "English version"}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
