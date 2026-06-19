import type { Metadata } from "next"
import { Playfair_Display, Inter, Cormorant_Garamond, DM_Sans } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const SITE_TITLE = "Vocali — Réceptionniste virtuelle IA pour cliniques esthétiques"
const SITE_DESC =
  "Votre réceptionniste virtuelle, disponible 24/7. Elle répond aux appels, renseigne vos clientes et prend les rendez-vous — même quand vous êtes occupée."

export const metadata: Metadata = {
  metadataBase: new URL("https://vocali.ca"),
  title: SITE_TITLE,
  description: SITE_DESC,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "https://vocali.ca",
    siteName: "Vocali",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vocali — Réceptionniste virtuelle IA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/og-image.png"],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? "/"
  const lang = pathname.startsWith("/en") ? "en" : "fr"

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${dmSans.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
