export const dynamic = "force-dynamic"

import Stripe from "stripe"
import { getClinic } from "@/lib/supabase/dashboard"
import BillingTable from "@/components/dashboard/BillingTable"

async function getInvoices(email: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const customers = await stripe.customers.list({ email, limit: 1 })
  if (!customers.data.length) return []
  const invoices = await stripe.invoices.list({
    customer: customers.data[0].id,
    limit: 24,
    status: "paid",
  })
  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number ?? inv.id.slice(-8).toUpperCase(),
    amount: inv.amount_paid,
    currency: inv.currency,
    created: inv.created,
    period_start: inv.period_start,
    period_end: inv.period_end,
    hosted_invoice_url: inv.hosted_invoice_url ?? null,
  }))
}

export default async function BillingPage() {
  const clinic = await getClinic()
  if (!clinic?.owner_email) return null

  const invoices = await getInvoices(clinic.owner_email)

  return (
    <div className="px-5 py-6 lg:px-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Reçus</h1>
        <p className="text-charcoal-400 text-sm font-body mt-0.5">
          Historique de paiement et reçus téléchargeables
        </p>
      </div>
      <BillingTable invoices={invoices} />
    </div>
  )
}
