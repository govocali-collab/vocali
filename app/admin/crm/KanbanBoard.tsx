"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import { GripVertical } from "lucide-react"
import { STATUSES, STATUS_CONFIG } from "@/lib/supabase/prospects"
import type { Prospect, ProspectStatus } from "@/lib/supabase/prospects"
import { cn } from "@/lib/utils"
import StatusDropdown from "./StatusDropdown"
import { updateStatusAction } from "./actions"

const COLUMN_STYLE: Record<ProspectStatus, { header: string; body: string }> = {
  nouveau:     { header: "bg-slate-50 border-slate-200",    body: "bg-slate-50/60 border-slate-200" },
  contacte:    { header: "bg-blue-50 border-blue-200",      body: "bg-blue-50/40 border-blue-200" },
  demo:        { header: "bg-purple-50 border-purple-200",  body: "bg-purple-50/40 border-purple-200" },
  proposition: { header: "bg-amber-50 border-amber-200",    body: "bg-amber-50/40 border-amber-200" },
  signe:       { header: "bg-green-50 border-green-200",    body: "bg-green-50/40 border-green-200" },
  declin:      { header: "bg-red-50 border-red-100",        body: "bg-red-50/30 border-red-100" },
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })
}

// ── Card content (shared between draggable card and overlay) ─────────────────

function CardContent({ p, dimmed = false }: { p: Prospect; dimmed?: boolean }) {
  const lastContact = formatDate(p.last_contact_at)
  return (
    <div className={cn("transition-opacity", dimmed && "opacity-40")}>
      <p className="text-charcoal-900 font-body font-semibold text-[13px] leading-snug mb-0.5 pr-5">
        {p.clinic_name}
      </p>
      {p.owner_name && (
        <p className="text-charcoal-500 text-[11px] font-body mb-1">{p.owner_name}</p>
      )}
      <div className="flex flex-col gap-0.5 text-[11px] text-charcoal-400 font-body mb-2">
        {p.city && <span>{p.city}</span>}
        {p.phone && <span>{p.phone}</span>}
        {lastContact && <span>Contact: {lastContact}</span>}
      </div>
      {p.source && (
        <span className="inline-block bg-ivory-100 text-charcoal-500 text-[10px] font-body px-2 py-0.5 rounded-full mb-2">
          {p.source}
        </span>
      )}
      {!dimmed && (
        <div className="flex items-center justify-between pt-1.5 border-t border-ivory-200">
          <StatusDropdown id={p.id} status={p.status} />
          <Link
            href={`/admin/crm/${p.id}`}
            className="text-charcoal-300 hover:text-gold-600 transition-colors text-sm"
          >
            →
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Draggable card ────────────────────────────────────────────────────────────

function DraggableCard({ p }: { p: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: p.id,
    data: { status: p.status },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-ivory-300 p-3 shadow-sm relative"
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="absolute top-2.5 right-2.5 cursor-grab active:cursor-grabbing text-charcoal-200 hover:text-charcoal-400 transition-colors touch-none p-0.5"
        aria-label="Déplacer"
        tabIndex={-1}
      >
        <GripVertical size={13} />
      </button>
      <CardContent p={p} dimmed={isDragging} />
    </div>
  )
}

// ── Drag overlay (floating card while dragging) ───────────────────────────────

function CardOverlay({ p }: { p: Prospect }) {
  const lastContact = formatDate(p.last_contact_at)
  return (
    <div className="bg-white rounded-xl border border-gold-300 p-3 shadow-2xl w-52 rotate-1 scale-105">
      <p className="text-charcoal-900 font-body font-semibold text-[13px] leading-snug mb-0.5">
        {p.clinic_name}
      </p>
      {p.owner_name && (
        <p className="text-charcoal-500 text-[11px] font-body">{p.owner_name}</p>
      )}
      {p.city && <p className="text-charcoal-400 text-[11px] font-body">{p.city}</p>}
      {lastContact && (
        <p className="text-charcoal-400 text-[11px] font-body">Contact: {lastContact}</p>
      )}
      {p.source && (
        <span className="inline-block bg-ivory-100 text-charcoal-500 text-[10px] font-body px-2 py-0.5 rounded-full mt-1.5">
          {p.source}
        </span>
      )}
    </div>
  )
}

// ── Droppable column ──────────────────────────────────────────────────────────

function DroppableColumn({
  status,
  prospects,
}: {
  status: ProspectStatus
  prospects: Prospect[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const cfg = STATUS_CONFIG[status]
  const col = COLUMN_STYLE[status]

  return (
    <div className="flex-shrink-0 w-52">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-t-xl border border-b-0",
          col.header
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
          <span className="text-xs font-semibold font-body text-charcoal-700">{cfg.label}</span>
        </div>
        <span className="text-[10px] font-medium text-charcoal-400 bg-white/70 px-1.5 py-0.5 rounded-full">
          {prospects.length}
        </span>
      </div>

      {/* Body */}
      <div
        ref={setNodeRef}
        className={cn(
          "rounded-b-xl border p-2 min-h-[160px] space-y-2 transition-colors duration-150",
          col.body,
          isOver && "ring-2 ring-inset ring-gold-400 bg-gold-50/20"
        )}
      >
        {prospects.map((p) => (
          <DraggableCard key={p.id} p={p} />
        ))}
        {prospects.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center h-20 text-[11px] font-body rounded-lg transition-colors",
              isOver ? "text-gold-600" : "text-charcoal-300"
            )}
          >
            {isOver ? "Déposer ici" : "Vide"}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function KanbanBoard({ allProspects }: { allProspects: Prospect[] }) {
  const [prospects, setProspects] = useState(allProspects)
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null)
  const [, startTransition] = useTransition()

  // Sync when server re-renders with fresh data
  useEffect(() => {
    setProspects(allProspects)
  }, [allProspects])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveProspect(prospects.find((p) => p.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveProspect(null)
    if (!over) return

    const prospectId = active.id as string
    const newStatus = over.id as ProspectStatus
    const current = prospects.find((p) => p.id === prospectId)
    if (!current || current.status === newStatus) return

    // Optimistic update — card moves instantly
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, status: newStatus } : p))
    )

    startTransition(() => updateStatusAction(prospectId, newStatus))
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5">
        {STATUSES.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            prospects={prospects.filter((p) => p.status === status)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeProspect && <CardOverlay p={activeProspect} />}
      </DragOverlay>
    </DndContext>
  )
}
