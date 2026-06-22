"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "white" | "outline-gold"
type Size = "sm" | "md" | "lg"

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-gold hover:from-gold-600 hover:to-gold-700 hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-transparent border-2 border-charcoal-800 text-charcoal-800 hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900",
  white:
    "bg-white text-gold-700 font-bold shadow-luxury hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:-translate-y-1",
  "outline-gold":
    "bg-transparent border-2 border-gold-500 text-gold-400 hover:bg-gold-500/10 hover:-translate-y-0.5 active:translate-y-0",
}

const sizes: Record<Size, string> = {
  sm: "px-5 py-2.5 text-sm gap-1.5",
  md: "px-7 py-3.5 text-base gap-2",
  lg: "px-9 py-4 text-lg gap-2.5",
}

interface Props {
  variant?: Variant
  size?: Size
  className?: string
  lang?: string
  children: React.ReactNode
}

export function DemoRequestButton({ variant = "primary", size = "md", className, lang = "fr", children }: Props) {
  const href = lang === "en" ? "/contact?lang=en" : "/contact"
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  )
}
