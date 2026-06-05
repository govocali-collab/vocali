import { fr } from "./fr"
import { en } from "./en"
import type { Dictionary } from "./types"

export type Lang = "fr" | "en"

const dictionaries: Record<Lang, Dictionary> = { fr, en }

export function getDictionary(lang: string): Dictionary {
  return dictionaries[(lang as Lang) in dictionaries ? (lang as Lang) : "fr"]
}

export type { Dictionary }
