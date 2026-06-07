import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { buildReceiptPDF } from "@/lib/pdf/receipt"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: clinic } = await admin
      .from("clinics")
      .select("name, owner_email")
      .eq("owner_email", user.email)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: "Clinique introuvable" }, { status: 404 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const invoice = await stripe.invoices.retrieve(id, { expand: ["lines"] })

    // Verify invoice belongs to this customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    if (!customers.data.length || invoice.customer !== customers.data[0].id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const pdfBuffer = await buildReceiptPDF(
      {
        id: invoice.id,
        number: invoice.number,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        created: invoice.created,
        period_start: invoice.period_start ?? null,
        period_end: invoice.period_end ?? null,
        customer_email: invoice.customer_email,
        lines: (invoice.lines?.data ?? []).map((l) => ({
          description: l.description,
          amount: l.amount,
        })),
      },
      clinic.name
    )

    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vocali-recu-${invoice.number ?? id}.pdf"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
