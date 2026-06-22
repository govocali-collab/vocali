import type { Metadata } from "next"
import DemoClient from "./DemoClient"

// Page de démonstration accessible uniquement par URL (/demo) : non liée depuis
// le site et non indexée par les moteurs de recherche.
const DEMO_TITLE = "Démo : parlez en direct à notre réceptionniste virtuelle"
const DEMO_DESC =
  "Posez vos questions et prenez rendez-vous, elle vous répond instantanément, comme une vraie réceptionniste."

export const metadata: Metadata = {
  title: DEMO_TITLE,
  description: DEMO_DESC,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    url: "https://vocali.ca/demo",
    siteName: "Salon Élégance",
    title: DEMO_TITLE,
    description: DEMO_DESC,
    images: [{ url: "/og-demo.png", width: 1200, height: 630, alt: "Salon Élégance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEMO_TITLE,
    description: DEMO_DESC,
    images: ["/og-demo.png"],
  },
}

export default function DemoPage() {
  return <DemoClient />
}
