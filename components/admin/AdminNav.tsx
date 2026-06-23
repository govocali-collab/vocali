"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, BarChart2, UserPlus, FileText, Users, Search, ImagePlay, MonitorPlay, Map } from "lucide-react"

const links = [
  { href: "/admin/carte",      label: "Carte",        icon: Map },
  { href: "/admin/clinics",    label: "Cliniques",    icon: LayoutGrid },
  { href: "/admin/stats",      label: "Statistiques", icon: BarChart2 },
  { href: "/admin/demo-stats", label: "Stats démo",   icon: MonitorPlay },
  { href: "/admin/crm",        label: "CRM",          icon: Users },
  { href: "/admin/scraper",    label: "Scraper",      icon: Search },
  { href: "/admin/social",     label: "Posts",        icon: ImagePlay },
  { href: "/admin/onboarding", label: "Onboarding",   icon: UserPlus },
  { href: "/admin/billing",    label: "Facturation",  icon: FileText },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-ivory-300 mb-8">
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex items-center justify-between h-14">
          <Link href="/admin/clinics">
            <Image src="/vocali-logo-black.png" alt="Vocali" width={90} height={28} />
          </Link>
          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors",
                    active
                      ? "bg-gold-50 text-gold-700 border border-gold-200"
                      : "text-charcoal-500 hover:text-charcoal-800 hover:bg-ivory-100"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
