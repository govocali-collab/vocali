import { createClient } from "@supabase/supabase-js"

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export interface DemoAttribution {
  conversation_id: string
  src?: string | null
  referrer?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
}

/** Au démarrage de la démo : enregistre la provenance (upsert par conversation_id). */
export async function upsertDemoAttribution(a: DemoAttribution): Promise<void> {
  if (!a.conversation_id) return
  const supabase = admin()
  await supabase.from("demo_sessions").upsert(
    {
      conversation_id: a.conversation_id,
      src: a.src || null,
      referrer: a.referrer || null,
      utm_source: a.utm_source || null,
      utm_medium: a.utm_medium || null,
      utm_campaign: a.utm_campaign || null,
    },
    { onConflict: "conversation_id" },
  )
}

export type TranscriptTurn = { role: string; content: string }

/** En fin d'appel (webhook) : enregistre la durée, le statut prospect, la transcription. */
export async function upsertDemoOutcome(o: {
  conversation_id: string
  duration_sec?: number | null
  is_prospect?: boolean
  transcript?: TranscriptTurn[] | null
}): Promise<void> {
  if (!o.conversation_id) return
  const supabase = admin()
  await supabase.from("demo_sessions").upsert(
    {
      conversation_id: o.conversation_id,
      duration_sec: o.duration_sec ?? null,
      is_prospect: Boolean(o.is_prospect),
      ...(o.transcript ? { transcript: o.transcript } : {}),
    },
    { onConflict: "conversation_id" },
  )
}

export interface DemoSession {
  id: string
  created_at: string
  src: string | null
  duration_sec: number | null
  is_prospect: boolean
  transcript: TranscriptTurn[] | null
}

/** Sessions de démo récentes (avec transcription) pour l'affichage admin. */
export async function getRecentDemoSessions(limit = 50): Promise<DemoSession[]> {
  try {
    const supabase = admin()
    const { data, error } = await supabase
      .from("demo_sessions")
      .select("id, created_at, src, duration_sec, is_prospect, transcript")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return data as DemoSession[]
  } catch {
    return []
  }
}

/** Réinitialise les stats démo : supprime TOUTES les sessions enregistrées. */
export async function resetDemoStats(): Promise<void> {
  const supabase = admin()
  const { error } = await supabase
    .from("demo_sessions")
    .delete()
    .gte("created_at", "1970-01-01T00:00:00Z")
  if (error) throw error
}

export interface DemoSourceStat {
  src: string
  demos: number
  avg_duration_sec: number
  prospects: number
  conversion_rate: number
}

export interface DemoStats {
  total: number
  avg_duration_sec: number
  prospects: number
  conversion_rate: number
  by_source: DemoSourceStat[]
}

/** Agrège les sessions de démo par source. Résilient si la table n'existe pas. */
export async function getDemoStats(): Promise<DemoStats> {
  const empty: DemoStats = { total: 0, avg_duration_sec: 0, prospects: 0, conversion_rate: 0, by_source: [] }
  try {
    const supabase = admin()
    const { data, error } = await supabase
      .from("demo_sessions")
      .select("src, duration_sec, is_prospect")
      .order("created_at", { ascending: false })
      .limit(5000)
    if (error || !data) return empty

    const rows = data as Array<{ src: string | null; duration_sec: number | null; is_prospect: boolean | null }>
    const total = rows.length
    const durs = rows.map((r) => r.duration_sec ?? 0)
    const prospects = rows.filter((r) => r.is_prospect).length
    const avg = total ? Math.round(durs.reduce((a, b) => a + b, 0) / total) : 0

    const groups = new Map<string, { demos: number; dur: number; prospects: number }>()
    for (const r of rows) {
      const key = (r.src && r.src.trim()) || "(direct / inconnu)"
      const g = groups.get(key) ?? { demos: 0, dur: 0, prospects: 0 }
      g.demos += 1
      g.dur += r.duration_sec ?? 0
      if (r.is_prospect) g.prospects += 1
      groups.set(key, g)
    }
    const by_source: DemoSourceStat[] = [...groups.entries()]
      .map(([src, g]) => ({
        src,
        demos: g.demos,
        avg_duration_sec: g.demos ? Math.round(g.dur / g.demos) : 0,
        prospects: g.prospects,
        conversion_rate: g.demos ? Math.round((g.prospects / g.demos) * 100) : 0,
      }))
      .sort((a, b) => b.prospects - a.prospects || b.demos - a.demos)

    return {
      total,
      avg_duration_sec: avg,
      prospects,
      conversion_rate: total ? Math.round((prospects / total) * 100) : 0,
      by_source,
    }
  } catch {
    return empty
  }
}
