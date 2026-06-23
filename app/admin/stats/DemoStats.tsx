import { getDemoStats, getRecentDemoSessions } from "@/lib/supabase/demo-stats"
import DemoTranscripts from "@/components/admin/DemoTranscripts"
import ResetDemoStatsButton from "../demo-stats/ResetDemoStatsButton"
import { Play, Clock, UserCheck, TrendingUp } from "lucide-react"

function fmtDuration(sec: number): string {
  if (!sec) return "0 s"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m ? `${m} min ${String(s).padStart(2, "0")} s` : `${s} s`
}

export default async function DemoStats() {
  const [stats, sessions] = await Promise.all([getDemoStats(), getRecentDemoSessions(50)])

  const cards = [
    { label: "Démos utilisées", value: String(stats.total), icon: Play },
    { label: "Durée moyenne", value: fmtDuration(stats.avg_duration_sec), icon: Clock },
    { label: "Prospects captés", value: String(stats.prospects), icon: UserCheck },
    { label: "Taux de conversion", value: `${stats.conversion_rate}%`, icon: TrendingUp },
  ]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <p className="text-charcoal-400 text-sm font-body">
          Utilisation de la démo vocale et provenance des visiteurs
        </p>
        <ResetDemoStatsButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-ivory-300 p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-gold-600" />
              <span className="text-charcoal-400 text-xs font-body uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-charcoal-900 font-display text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-xl border border-ivory-300 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-ivory-300">
          <h2 className="text-charcoal-700 text-sm font-body font-semibold">Par source (?src=…)</h2>
          <p className="text-charcoal-400 text-xs font-body mt-0.5">Quel groupe/post amène les meilleurs prospects</p>
        </div>

        {stats.by_source.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-charcoal-400 text-sm font-body">
              Aucune donnée pour l&apos;instant. Partage des liens taggés pour suivre la provenance :
            </p>
            <code className="inline-block mt-3 text-xs bg-ivory-100 border border-ivory-300 rounded-lg px-3 py-2 text-charcoal-600">
              vocali.ca/demo?src=nom-du-groupe
            </code>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ivory-200">
                <th className="text-left px-5 py-2.5 text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">Source</th>
                <th className="text-right px-3 py-2.5 text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">Démos</th>
                <th className="text-right px-3 py-2.5 text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">Durée moy.</th>
                <th className="text-right px-3 py-2.5 text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">Prospects</th>
                <th className="text-right px-5 py-2.5 text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {stats.by_source.map((s, i) => (
                <tr key={s.src} className="border-b border-ivory-200 last:border-0">
                  <td className="px-5 py-3 text-charcoal-800 text-sm font-body font-medium">
                    {i === 0 && s.prospects > 0 && <span className="mr-1">⭐</span>}
                    {s.src}
                  </td>
                  <td className="px-3 py-3 text-right text-charcoal-700 text-sm font-body">{s.demos}</td>
                  <td className="px-3 py-3 text-right text-charcoal-600 text-sm font-body">{fmtDuration(s.avg_duration_sec)}</td>
                  <td className="px-3 py-3 text-right text-charcoal-700 text-sm font-body">{s.prospects}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={s.conversion_rate >= 15 ? "text-green-700 text-sm font-body font-semibold" : "text-charcoal-500 text-sm font-body"}>
                      {s.conversion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-white rounded-xl border border-ivory-300 shadow-card overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-ivory-300">
          <h2 className="text-charcoal-700 text-sm font-body font-semibold">Conversations</h2>
          <p className="text-charcoal-400 text-xs font-body mt-0.5">Clique sur une conversation pour lire la transcription</p>
        </div>
        <DemoTranscripts sessions={sessions} />
      </section>
    </div>
  )
}
