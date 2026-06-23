"use client"

import { Fragment } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, BarChart2, UserPlus, FileText, Users, Search, ImagePlay, Map } from "lucide-react"

type NavLink = { href: string; label: string; icon: typeof LayoutGrid }

// Groupes logiques (gauche → droite) : Clients · Croissance · Argent · Référence (Carte, à droite)
const groups: NavLink[][] = [
  [
    { href: "/admin/clinics",    label: "Cliniques",    icon: LayoutGrid },
    { href: "/admin/onboarding", label: "Onboarding",   icon: UserPlus },
  ],
  [
    { href: "/admin/crm",        label: "CRM",          icon: Users },
    { href: "/admin/scraper",    label: "Scraper",      icon: Search },
    { href: "/admin/social",     label: "Posts",        icon: ImagePlay },
  ],
  [
    { href: "/admin/billing",    label: "Facturation",  icon: FileText },
    { href: "/admin/stats",      label: "Statistiques", icon: BarChart2 },
  ],
]
const carte: NavLink = { href: "/admin/carte", label: "Carte", icon: Map }

export default function AdminNav() {
  const pathname = usePathname()

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors whitespace-nowrap",
      pathname.startsWith(href)
        ? "bg-gold-50 text-gold-700 border border-gold-200"
        : "text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-100"
    )

  return (
    <header className="bg-white border-b border-ivory-300 mb-8">
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex items-center gap-3 h-14">
          <Link href="/admin/clinics" className="flex-shrink-0">
            <Image src="/vocali-logo-black.png" alt="Vocali" width={90} height={28} />
          </Link>

          <nav className="flex items-center gap-1 flex-1">
            {groups.map((group, gi) => (
              <Fragment key={gi}>
                {gi > 0 && <span className="w-px h-5 bg-ivory-300 mx-1.5" aria-hidden />}
                {group.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={linkClass(href)}>
                    <Icon size={14} />
                    {label}
                  </Link>
                ))}
              </Fragment>
            ))}

            {/* Carte — tout à droite */}
            <Link href={carte.href} className={cn(linkClass(carte.href), "ml-auto")}>
              <carte.icon size={14} />
              {carte.label}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
