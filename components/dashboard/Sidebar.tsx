"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Phone, Settings, Menu, X, Zap, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Clinic } from "@/lib/supabase/dashboard"

const NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/calls", label: "Appels", icon: Phone },
  { href: "/dashboard/billing", label: "Facturation", icon: Receipt },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
]

export default function Sidebar({ clinic }: { clinic: Clinic }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const agentName = (clinic.clinic_config?.agent_name as string | undefined) ?? "Sarah"

  const navItems = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors",
              active
                ? "bg-gold-50 text-gold-700 border-l-2 border-gold-500 pl-[10px]"
                : "text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200"
            )}
          >
            <Icon size={16} className={active ? "text-gold-600" : ""} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-ivory-300">
        <Image
          src="/vocali-logo-black.png"
          alt="Vocali"
          width={104}
          height={32}
          className="mb-4"
        />
        <p className="text-charcoal-800 text-sm font-body font-semibold truncate">{clinic.name}</p>
        {!clinic.is_active && (
          <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            En configuration
          </span>
        )}
      </div>

      <div className="flex-1 py-4 overflow-y-auto">{navItems}</div>

      <div className="px-5 py-4 border-t border-ivory-300">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center flex-shrink-0">
            <Zap size={12} className="text-gold-600" />
          </div>
          <div className="min-w-0">
            <p className="text-charcoal-700 text-xs font-body font-medium truncate">{agentName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-green-600 text-[10px] font-body">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-white border-r border-ivory-300 flex-col">
        {sidebarContent}
      </aside>

      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-ivory-300">
        <Image src="/vocali-logo-black.png" alt="Vocali" width={81} height={25} />
        <button onClick={() => setOpen(true)} className="text-charcoal-500 hover:text-charcoal-800 p-1">
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-60 bg-white border-r border-ivory-300 flex flex-col">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-700"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
