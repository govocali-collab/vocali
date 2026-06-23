export const dynamic = "force-dynamic"

import Link from "next/link"
import { cn } from "@/lib/utils"
import MainStats from "./MainStats"
import DemoStats from "./DemoStats"

export default async function AdminStatsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab === "demo" ? "demo" : "general"

  const tabs = [
    { key: "general", label: "Général", href: "/admin/stats" },
    { key: "demo", label: "Démo", href: "/admin/stats?tab=demo" },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Statistiques</h1>
      </div>

      <div className="flex items-center bg-ivory-200 rounded-lg p-0.5 w-fit mb-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              tab === t.key ? "bg-white text-charcoal-900 shadow-sm" : "text-charcoal-500 hover:text-charcoal-700"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "demo" ? <DemoStats /> : <MainStats />}
    </div>
  )
}
