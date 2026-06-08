"use client"

import { useTransition } from "react"
import { STATUS_CONFIG, STATUSES } from "@/lib/supabase/prospects"
import type { ProspectStatus } from "@/lib/supabase/prospects"
import { updateStatusAction } from "./actions"
import { cn } from "@/lib/utils"

export default function StatusDropdown({ id, status }: { id: string; status: ProspectStatus }) {
  const [isPending, startTransition] = useTransition()
  const cfg = STATUS_CONFIG[status]

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        startTransition(() => updateStatusAction(id, e.target.value as ProspectStatus))
      }}
      className={cn(
        "text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none focus:outline-none",
        cfg.badge,
        isPending && "opacity-50 cursor-wait"
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
      ))}
    </select>
  )
}
