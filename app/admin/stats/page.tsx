export const dynamic = "force-dynamic"

import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function formatCAD(cents: number) {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(cents / 100)
}

function formatPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`
}

async function fetchStripeStats(startOfMonth: Date, startOfLastMonth: Date, endOfLastMonth: Date) {
  if (!process.env.STRIPE_SECRET_KEY) return null
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const activeSubs = await stripe.subscriptions.list({ status: "active", limit: 100 })
    const mrr = activeSubs.data.reduce((sum, sub) => {
      for (const item of sub.items.data) {
        const amount = item.price.unit_amount ?? 0
        const interval = item.price.recurring?.interval
        const count = item.price.recurring?.interval_count ?? 1
        if (interval === "month") sum += amount * item.quantity! / count
        if (interval === "year") sum += Math.round((amount * item.quantity!) / 12 / count)
      }
      return sum
    }, 0)

    const invoicesThisMonth = await stripe.invoices.list({ status: "paid", created: { gte: Math.floor(startOfMonth.getTime() / 1000) }, limit: 100 })
    const revenueThisMonth = invoicesThisMonth.data.reduce((s, i) => s + (i.amount_paid ?? 0), 0)

    const invoicesLastMonth = await stripe.invoices.list({ status: "paid", created: { gte: Math.floor(startOfLastMonth.getTime() / 1000), lte: Math.floor(endOfLastMonth.getTime() / 1000) }, limit: 100 })
    const revenueLastMonth = invoicesLastMonth.data.reduce((s, i) => s + (i.amount_paid ?? 0), 0)

    const cancelledSubs = await stripe.subscriptions.list({ status: "canceled", created: { gte: Math.floor(startOfMonth.getTime() / 1000) }, limit: 100 })
    const churnThisMonth = cancelledSubs.data.length

    const failedInvoices = await stripe.invoices.list({ status: "open", created: { gte: Math.floor(startOfMonth.getTime() / 1000) }, limit: 100 })
    const failedPayments = failedInvoices.data.filter((i) => (i.attempt_count ?? 0) > 0).length

    return { mrr, revenueThisMonth, revenueLastMonth, churnThisMonth, failedPayments }
  } catch {
    return null
  }
}

async function fetchStats() {
  const admin = getAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // ── Stripe ──────────────────────────────────────────────
  const stripeStats = await fetchStripeStats(startOfMonth, startOfLastMonth, endOfLastMonth)
  const mrr = stripeStats?.mrr ?? 0
  const revenueThisMonth = stripeStats?.revenueThisMonth ?? 0
  const revenueLastMonth = stripeStats?.revenueLastMonth ?? 0
  const churnThisMonth = stripeStats?.churnThisMonth ?? 0
  const failedPayments = stripeStats?.failedPayments ?? 0

  // ── Supabase ─────────────────────────────────────────────

  const [
    { count: totalClinics },
    { count: activeClinics },
    { count: pausedClinics },
    { count: newClinicsThisMonth },
    { count: newClinicsLastMonth },
  ] = await Promise.all([
    admin.from("clinics").select("id", { count: "exact", head: true }),
    admin.from("clinics").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("clinics").select("id", { count: "exact", head: true }).eq("is_active", false).not("paused_at", "is", null),
    admin.from("clinics").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    admin.from("clinics").select("id", { count: "exact", head: true })
      .gte("created_at", startOfLastMonth.toISOString())
      .lte("created_at", endOfLastMonth.toISOString()),
  ])

  // Calls & leads this month across all locations
  const { count: callsThisMonthCount } = await admin
    .from("call_sessions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const { count: leadsThisMonthCount } = await admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // Calls last month
  const { count: callsLastMonthCount } = await admin
    .from("call_sessions")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const callsThisMonth = callsThisMonthCount ?? 0
  const callsLastMonthTotal = callsLastMonthCount ?? 0
  const leadsThisMonth = leadsThisMonthCount ?? 0

  const revenueGrowth = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
    : null

  const callsGrowth = callsLastMonthTotal > 0
    ? ((callsThisMonth - callsLastMonthTotal) / callsLastMonthTotal) * 100
    : null

  const activeClinicsRate = totalClinics ? Math.round(((activeClinics ?? 0) / totalClinics) * 100) : 0

  return {
    mrr,
    revenueThisMonth,
    revenueLastMonth,
    revenueGrowth,
    churnThisMonth,
    failedPayments,
    totalClinics: totalClinics ?? 0,
    activeClinics: activeClinics ?? 0,
    pausedClinics: pausedClinics ?? 0,
    activeClinicsRate,
    newClinicsThisMonth: newClinicsThisMonth ?? 0,
    newClinicsLastMonth: newClinicsLastMonth ?? 0,
    callsThisMonth,
    callsGrowth,
    leadsThisMonth,
  }
}

export default async function AdminStatsPage() {
  const s = await fetchStats()
  const monthLabel = new Date().toLocaleDateString("fr-CA", { month: "long", year: "numeric" })

  return (
    <div>
        <div className="mb-8">
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Statistiques</h1>
          <p className="text-charcoal-500 text-sm mt-1 capitalize">{monthLabel}</p>
        </div>

        {/* Revenus */}
        <Section title="Revenus">
          <MetricCard
            label="MRR"
            value={formatCAD(s.mrr)}
            sub="revenu mensuel récurrent"
            accent
          />
          <MetricCard
            label={`Revenus — ${new Date().toLocaleDateString("fr-CA", { month: "short" })}`}
            value={formatCAD(s.revenueThisMonth)}
            sub={s.revenueGrowth !== null
              ? `${formatPct(s.revenueGrowth)} vs mois dernier (${formatCAD(s.revenueLastMonth)})`
              : `Mois dernier : ${formatCAD(s.revenueLastMonth)}`}
            trend={s.revenueGrowth}
          />
          <MetricCard
            label="Paiements échoués"
            value={String(s.failedPayments)}
            sub="ce mois"
            alert={s.failedPayments > 0}
          />
          <MetricCard
            label="Désabonnements"
            value={String(s.churnThisMonth)}
            sub="ce mois"
            alert={s.churnThisMonth > 0}
          />
        </Section>

        {/* Cliniques */}
        <Section title="Cliniques">
          <MetricCard
            label="Total"
            value={String(s.totalClinics)}
            sub="cliniques inscrites"
          />
          <MetricCard
            label="Actives"
            value={String(s.activeClinics)}
            sub={`${s.activeClinicsRate}% du total`}
            positive
          />
          <MetricCard
            label="En pause"
            value={String(s.pausedClinics)}
            sub="à suivre"
            alert={s.pausedClinics > 0}
          />
          <MetricCard
            label="Nouvelles ce mois"
            value={String(s.newClinicsThisMonth)}
            sub={`${s.newClinicsLastMonth} le mois dernier`}
            trend={s.newClinicsLastMonth > 0
              ? ((s.newClinicsThisMonth - s.newClinicsLastMonth) / s.newClinicsLastMonth) * 100
              : null}
          />
        </Section>

        {/* Activité agent */}
        <Section title="Activité agent">
          <MetricCard
            label="Appels ce mois"
            value={String(s.callsThisMonth)}
            sub={s.callsGrowth !== null ? `${formatPct(s.callsGrowth)} vs mois dernier` : "ce mois"}
            trend={s.callsGrowth}
          />
          <MetricCard
            label="Leads capturés"
            value={String(s.leadsThisMonth)}
            sub="ce mois"
            positive={s.leadsThisMonth > 0}
          />
          <MetricCard
            label="Taux de conversion"
            value={s.callsThisMonth > 0
              ? `${Math.round((s.leadsThisMonth / s.callsThisMonth) * 100)}%`
              : "—"}
            sub="leads / appels"
          />
        </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-charcoal-400 text-xs font-semibold uppercase tracking-widest mb-3">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  )
}

function MetricCard({
  label, value, sub, accent, positive, alert, trend,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
  positive?: boolean
  alert?: boolean
  trend?: number | null
}) {
  const trendPositive = trend !== null && trend !== undefined && trend > 0
  const trendNegative = trend !== null && trend !== undefined && trend < 0

  return (
    <div className={cn(
      "bg-ink-card rounded-xl border p-4 shadow-card",
      accent ? "border-gold-300 bg-gold-50/30" : "border-ivory-300",
      alert ? "border-red-200 bg-red-50/20" : "",
    )}>
      <p className="text-charcoal-400 text-[11px] font-body uppercase tracking-wider mb-2">{label}</p>
      <p className={cn(
        "text-2xl font-display font-semibold mb-1",
        accent ? "text-gold-700" :
        positive ? "text-green-700" :
        alert ? "text-red-600" :
        "text-charcoal-900"
      )}>
        {value}
      </p>
      {sub && (
        <p className={cn(
          "text-xs font-body",
          trendPositive ? "text-green-600" :
          trendNegative ? "text-red-500" :
          "text-charcoal-400"
        )}>
          {sub}
        </p>
      )}
    </div>
  )
}
