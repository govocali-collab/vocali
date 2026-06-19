"use client"

import { useState } from "react"
import { LayoutList, Columns } from "lucide-react"
import { STATUSES, STATUS_CONFIG } from "@/lib/supabase/prospects"
import type { Prospect, ProspectStatus } from "@/lib/supabase/prospects"
import { cn } from "@/lib/utils"
import NewProspectForm from "./NewProspectForm"
import ListView from "./ListView"
import KanbanBoard from "./KanbanBoard"

type View = "list" | "kanban"

export default function CRMView({ allProspects }: { allProspects: Prospect[] }) {
  const [view, setView] = useState<View>("list")
  const [filter, setFilter] = useState<ProspectStatus | "all">("all")

  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: allProspects.filter((p) => p.status === s).length }),
    {} as Record<ProspectStatus, number>
  )

  const filteredProspects =
    filter === "all" ? allProspects : allProspects.filter((p) => p.status === filter)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Prospection CRM</h1>
          <p className="text-charcoal-500 text-sm mt-1">
            {allProspects.length} prospect{allProspects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-ivory-200 rounded-lg p-0.5">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-body transition-colors",
                view === "list"
                  ? "bg-white text-charcoal-800 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-700"
              )}
            >
              <LayoutList size={13} /> Liste
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-body transition-colors",
                view === "kanban"
                  ? "bg-white text-charcoal-800 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-700"
              )}
            >
              <Columns size={13} /> Tableau
            </button>
          </div>
          <NewProspectForm />
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <span
            key={s}
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5",
              STATUS_CONFIG[s].badge
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", STATUS_CONFIG[s].dot)} />
            {STATUS_CONFIG[s].label}: {counts[s]}
          </span>
        ))}
      </div>

      {/* View */}
      {view === "list" ? (
        <ListView
          prospects={filteredProspects}
          allProspects={allProspects}
          filter={filter}
          onFilterChange={setFilter}
        />
      ) : (
        <KanbanBoard allProspects={allProspects} />
      )}
    </div>
  )
}
