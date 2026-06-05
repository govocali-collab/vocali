import { forwardRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "outline-gold" | "white"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  href?: string
  external?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-gold hover:from-gold-600 hover:to-gold-700 hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-transparent border-2 border-charcoal-800 text-charcoal-800 hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900",
  ghost:
    "bg-transparent text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200",
  "outline-gold":
    "bg-transparent border-2 border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white",
  white:
    "bg-white text-charcoal-900 hover:bg-ivory-100 shadow-card hover:shadow-card-hover",
}

const sizes: Record<Size, string> = {
  sm: "px-5 py-2.5 text-sm gap-1.5",
  md: "px-7 py-3.5 text-base gap-2",
  lg: "px-9 py-4 text-lg gap-2.5",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", href, external, className, children, ...props },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer select-none",
      variants[variant],
      sizes[size],
      className
    )

    if (href) {
      return (
        <Link
          href={href}
          className={classes}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
