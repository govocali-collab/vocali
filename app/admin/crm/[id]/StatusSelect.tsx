"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { STATUS_CONFIG, STATUSES } from "@/lib/supabase/prospects"
import type { ProspectStatus } from "@/lib/supabase/prospects"
import { cn } from "@/lib/utils"

export default function StatusSelect({ defaultValue }: { defaultValue: ProspectStatus }) {
  const [value, setValue] = useState<ProspectStatus>(defaultValue)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const cfg = STATUS_CONFIG[value]

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name="status" value={value} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between w-full gap-2 px-3 py-2 rounded-lg text-sm font-medium font-body transition-colors",
          cfg.badge
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
          {cfg.label}
        </div>
        <ChevronDown
          size={13}
          className={cn("transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-ivory-300 rounded-xl shadow-lg z-50 overflow-hidden">
          {STATUSES.map((s) => {
            const c = STATUS_CONFIG[s]
            const selected = s === value
            return (
              <button
                key={s}
                type="button"
                onClick={() => { setValue(s); setOpen(false) }}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-left transition-colors",
                  selected ? "bg-ivory-50" : "hover:bg-ivory-50"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium font-body px-2.5 py-1 rounded-full flex items-center gap-1.5",
                    c.badge
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.dot)} />
                  {c.label}
                </span>
                {selected && <Check size={13} className="text-charcoal-500 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
