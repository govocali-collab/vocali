import type { Metadata } from "next"
import DemoClient from "./DemoClient"

// Page de démonstration accessible uniquement par URL (/demo) : non liée depuis
// le site et non indexée par les moteurs de recherche.
export const metadata: Metadata = {
  title: "Démo — Réceptionniste virtuelle Vocali",
  robots: { index: false, follow: false },
}

export default function DemoPage() {
  return <DemoClient />
}
