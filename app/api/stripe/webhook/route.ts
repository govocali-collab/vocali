import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import {
  sendPaymentFailedNotification,
  sendSubscriptionCancelledNotification,
} from "@/lib/email/resend"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function findClinicByStripeEmail(email: string) {
  const admin = getAdminClient()
  const { data } = await admin
    .from("clinics")
    .select("id, name, owner_email, clinic_config, twilio_phone_number")
    .eq("owner_email", email)
    .single()
  return data
}

async function setClinicActive(clinic: { id: string; twilio_phone_number: string | null }, active: boolean) {
  const admin = getAdminClient()
  const pauseFields = active
    ? { is_active: true, paused_at: null, pause_reminder_sent: false }
    : { is_active: false, paused_at: new Date().toISOString(), pause_reminder_sent: false }

  await admin.from("clinics").update(pauseFields).eq("id", clinic.id)

  const { data: byClinicId } = await admin
    .from("locations")
    .update({ is_active: active, clinic_id: clinic.id })
    .eq("clinic_id", clinic.id)
    .select("id")

  if ((!byClinicId || byClinicId.length === 0) && clinic.twilio_phone_number) {
    await admin
      .from("locations")
      .update({ is_active: active, clinic_id: clinic.id })
      .eq("twilio_phone_number", clinic.twilio_phone_number)
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[Stripe webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerEmail = invoice.customer_email
        if (!customerEmail) break

        const clinic = await findClinicByStripeEmail(customerEmail)
        if (!clinic) break

        const attemptCount = invoice.attempt_count ?? 1
        const nextRetry = invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleString("fr-CA", {
              timeZone: "America/Toronto", dateStyle: "long", timeStyle: "short",
            })
          : null

        await sendPaymentFailedNotification({
          clinicName: clinic.name,
          ownerEmail: clinic.owner_email,
          clinicId: clinic.id,
          attemptCount,
          nextRetry,
        }).catch((e) => console.error("[Stripe webhook] Email error:", e))

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        if (customer.deleted || !("email" in customer) || !customer.email) break

        const clinic = await findClinicByStripeEmail(customer.email)
        if (!clinic) break

        await setClinicActive(clinic, false)

        await sendSubscriptionCancelledNotification({
          clinicName: clinic.name,
          ownerEmail: clinic.owner_email,
          clinicId: clinic.id,
        }).catch((e) => console.error("[Stripe webhook] Email error:", e))

        break
      }

      case "invoice.paid": {
        // Reactivate agent if it was paused due to billing
        const invoice = event.data.object as Stripe.Invoice
        const customerEmail = invoice.customer_email
        if (!customerEmail) break

        const admin = getAdminClient()
        const { data: clinic } = await admin
          .from("clinics")
          .select("id, twilio_phone_number, paused_at")
          .eq("owner_email", customerEmail)
          .eq("is_active", false)
          .single()

        // Only reactivate if paused_at exists (paused due to billing, not manually)
        // We can't distinguish reliably, so we skip auto-reactivation here.
        // Jonathan manually reactivates after confirming with the clinic.
        if (clinic) {
          console.log(`[Stripe webhook] invoice.paid for ${customerEmail} — clinic is paused, manual review needed`)
        }

        break
      }

      default:
        console.log(`[Stripe webhook] Unhandled event: ${event.type}`)
    }
  } catch (err) {
    console.error("[Stripe webhook] Handler error:", err)
    return NextResponse.json({ error: "Handler error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
