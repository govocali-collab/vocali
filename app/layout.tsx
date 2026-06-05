import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
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

export const metadata: Metadata = {
  metadataBase: new URL("https://vocali.ai"),
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
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
