import { NextResponse } from "next/server"
import Stripe from "stripe"
import { sendPaymentLinkEmail } from "@/lib/email/resend"

// Coupon « tarif fondateur » : 50 % de rabais pendant les 3 premiers mois.
// Créé une seule fois puis réutilisé (id fixe).
async function getFounderCoupon(stripe: Stripe): Promise<string> {
  const id = "fondateur-50-3mois"
  try {
    await stripe.coupons.retrieve(id)
  } catch {
    await stripe.coupons.create({
      id,
      percent_off: 50,
      duration: "repeating",
      duration_in_months: 3,
      name: "Tarif fondateur — 50 % (3 mois)",
    })
  }
  return id
}

export async function POST(req: Request) {
  try {
    const { clinicName, firstName, lastName, email, price, description, billing, trial, founderRate } = await req.json()

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            unit_amount: Math.round(price * 100),
            recurring: { interval: billing as "month" | "year" },
            product_data: {
              name: "Vocali — Secrétaire IA",
              description,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: trial ? { trial_period_days: 30 } : undefined,
      discounts: founderRate ? [{ coupon: await getFounderCoupon(stripe) }] : undefined,
      metadata: { clinicName, firstName, lastName, email, founderRate: founderRate ? "oui" : "non" },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancelled`,
      locale: "fr",
      payment_method_types: ["card"],
    })

    await sendPaymentLinkEmail({
      clinicName,
      firstName,
      email,
      price,
      billing,
      trial,
      founderRate: Boolean(founderRate),
      checkoutUrl: session.url!,
    })

    return NextResponse.json({ success: true, url: session.url, id: session.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("Stripe quote error:", message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
