import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const invoices = await stripe.invoices.list({
      limit: 100,
      expand: ["data.customer", "data.subscription"],
    })

    const results = invoices.data.map((invoice) => {
      const customer = invoice.customer as Stripe.Customer | null
      const subscription = (invoice as unknown as { subscription: Stripe.Subscription | null }).subscription

      return {
        id: invoice.id,
        number: invoice.number,
        clinicName: subscription?.metadata?.clinicName ?? customer?.name ?? "—",
        email: invoice.customer_email ?? customer?.email ?? "—",
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: invoice.status,
        created: invoice.created,
        hostedUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
      }
    })

    return NextResponse.json({ success: true, invoices: results })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
