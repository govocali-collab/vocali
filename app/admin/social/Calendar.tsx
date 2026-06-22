"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Check, Clock, X, CalendarDays, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SocialPost, PostStatus } from "@/lib/supabase/social"
import PostCard from "./PostCard"

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function labelOf(p: SocialPost): string {
  const raw = p.topic?.trim() || p.slides?.[0]?.headline || "Post"
  return raw.replace(/<[^>]+>/g, "").trim().slice(0, 60) || "Post"
}

export default function Calendar({
  posts,
  onUpdate,
}: {
  posts: SocialPost[]
  onUpdate: (p: SocialPost) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [busy, setBusy] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const scheduled = posts.filter((p) => p.scheduled_date)
  const unscheduled = posts.filter((p) => !p.scheduled_date)

  const byDate: Record<string, SocialPost[]> = {}
  for (const p of scheduled) {
    const key = p.scheduled_date as string
    ;(byDate[key] ??= []).push(p)
  }

  // Grille du mois (lundi → dimanche)
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) } else setMonth((m) => m + 1)
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  async function patch(id: string, body: { scheduled_date?: string | null; status?: PostStatus }) {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/social/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Erreur"); return }
      if (data.post) onUpdate(data.post)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur")
    } finally {
      setBusy(null)
    }
  }

  const selected = selectedId ? posts.find((p) => p.id === selectedId) ?? null : null

  return (
    <div className="space-y-5">
      {/* À planifier */}
      {unscheduled.length > 0 && (
        <section className="bg-white border border-ivory-300 rounded-xl p-4 shadow-card">
          <p className="text-charcoal-700 font-body font-semibold text-sm mb-3">
            À planifier <span className="text-charcoal-300 font-normal">· {unscheduled.length}</span>
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unscheduled.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-1.5 border-b border-ivory-100 last:border-0">
                <span className="flex-1 min-w-0 truncate text-sm text-charcoal-700 font-body">{labelOf(p)}</span>
                <input
                  type="date"
                  disabled={busy === p.id}
                  onChange={(e) => e.target.value && patch(p.id, { scheduled_date: e.target.value })}
                  className="bg-ivory-50 border border-ivory-300 rounded-lg px-2.5 py-1.5 text-sm text-charcoal-800 font-body focus:outline-none focus:border-gold-400"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Calendrier */}
      <section className="bg-white border border-ivory-300 rounded-xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-charcoal-900 font-display text-lg font-semibold w-44 text-center">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-body text-charcoal-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Prévu</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Publié</span>
            </div>
            <button onClick={goToday} className="text-xs font-body font-medium text-gold-700 bg-gold-50 border border-gold-200 hover:bg-gold-100 rounded-lg px-3 py-1.5 transition-colors">
              Aujourd'hui
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-body font-medium text-charcoal-400 uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="min-h-[88px] rounded-lg bg-ivory-50/40" />
            const key = ymd(date)
            const dayPosts = byDate[key] ?? []
            const isToday = key === ymd(today)
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[88px] rounded-lg border p-1.5 flex flex-col gap-1",
                  isToday ? "border-gold-400 bg-gold-50/40" : "border-ivory-200 bg-white"
                )}
              >
                <span className={cn("text-[11px] font-body", isToday ? "text-gold-700 font-semibold" : "text-charcoal-400")}>
                  {date.getDate()}
                </span>
                {dayPosts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    title={labelOf(p)}
                    className={cn(
                      "text-left text-[11px] font-body rounded px-1.5 py-1 leading-tight truncate border transition-colors",
                      p.status === "publie"
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
                      selectedId === p.id && "ring-2 ring-gold-400"
                    )}
                  >
                    {labelOf(p)}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </section>

      {/* Panneau du post sélectionné */}
      {selected && (
        <section className="bg-white border border-ivory-300 rounded-xl p-4 shadow-card">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-charcoal-900 font-body font-semibold text-sm truncate">{labelOf(selected)}</p>
              <p className="text-charcoal-400 text-xs font-body mt-0.5">
                {selected.status === "publie" ? "Publié" : "Prévu"} le {selected.scheduled_date}
              </p>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-charcoal-300 hover:text-charcoal-600 p-0.5">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-body text-charcoal-500">
              <CalendarDays size={14} /> Date :
              <input
                type="date"
                value={selected.scheduled_date ?? ""}
                disabled={busy === selected.id}
                onChange={(e) => patch(selected.id, { scheduled_date: e.target.value })}
                className="bg-ivory-50 border border-ivory-300 rounded-lg px-2.5 py-1.5 text-sm text-charcoal-800 font-body focus:outline-none focus:border-gold-400"
              />
            </label>

            <button
              type="button"
              disabled={busy === selected.id}
              onClick={() => patch(selected.id, { status: selected.status === "publie" ? "prevu" : "publie" })}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-body font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50",
                selected.status === "publie"
                  ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-green-600 text-white hover:bg-green-700"
              )}
            >
              {busy === selected.id ? <Loader2 size={14} className="animate-spin" /> : selected.status === "publie" ? <Clock size={14} /> : <Check size={14} />}
              {selected.status === "publie" ? "Marquer prévu" : "Marquer publié"}
            </button>

            <button
              type="button"
              disabled={busy === selected.id}
              onClick={() => { patch(selected.id, { scheduled_date: null }); setSelectedId(null) }}
              className="inline-flex items-center gap-1.5 text-sm font-body text-charcoal-400 hover:text-red-600 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              <X size={14} /> Retirer du calendrier
            </button>
          </div>

          {/* Aperçu du post */}
          <div className="mt-4 pt-4 border-t border-ivory-200 max-w-sm">
            <PostCard post={selected} />
          </div>
        </section>
      )}

      {scheduled.length === 0 && unscheduled.length === 0 && (
        <p className="text-center text-charcoal-400 text-sm font-body py-8">
          Aucun post enregistré. Créez et enregistrez un post, puis planifiez-le ici.
        </p>
      )}
    </div>
  )
}
