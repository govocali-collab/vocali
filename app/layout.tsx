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

export const metadata: Metadata = {
  metadataBase: new URL("https://vocali.ca"),
  icons: { icon: "/favicon.svg" },
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
