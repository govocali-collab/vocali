import { NextResponse } from "next/server"
import Stripe from "stripe"
import { sendPaymentLinkEmail } from "@/lib/email/resend"

// Produits Stripe des forfaits (le coupon fondateur ne s'applique qu'à eux,
// pas au frais d'installation — qui est, lui, déjà au bon montant).
const PLAN_PRODUCTS = ["prod_UkfmoPOlzPxMIJ", "prod_UkfmaJt73lcY47"]

// Coupon « tarif fondateur » : 50 % pendant 3 mois, UNIQUEMENT sur l'abonnement.
async function getFounderCoupon(stripe: Stripe): Promise<string> {
  const id = "fondateur-50-3mois-abo"
  try {
    await stripe.coupons.retrieve(id)
  } catch {
    await stripe.coupons.create({
      id,
      percent_off: 50,
      duration: "repeating",
      duration_in_months: 3,
      applies_to: { products: PLAN_PRODUCTS },
      name: "Tarif fondateur — 50 % (3 mois)",
    })
  }
  return id
}

export async function POST(req: Request) {
  try {
    const { clinicName, firstName, lastName, email, price, description, billing, trial, founderRate, productId, setupFee } = await req.json()

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // Frais d'installation unique : montant direct (250 $ fondateur / 500 $ régulier).
    // Le coupon ne s'y applique pas, donc le montant est déjà le bon et s'affiche tel quel.
    const SETUP_PRODUCT = "prod_Ukft7xpIH4rttV"
    const setupAmount = founderRate ? 25000 : 50000

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            unit_amount: Math.round(price * 100),
            recurring: { interval: billing as "month" | "year" },
            // Si un produit Stripe est fourni (forfait sélectionné), on l'utilise
            // pour un reporting propre ; sinon produit ad-hoc (rétrocompat).
            ...(productId
              ? { product: productId as string }
              : { product_data: { name: "Vocali — Secrétaire IA", description } }),
          },
          quantity: 1,
        },
        ...(setupFee
          ? [{ price_data: { currency: "cad", product: SETUP_PRODUCT, unit_amount: setupAmount }, quantity: 1 }]
          : []),
      ],
      subscription_data: trial ? { trial_period_days: 30 } : undefined,
      discounts: founderRate ? [{ coupon: await getFounderCoupon(stripe) }] : undefined,
      metadata: { clinicName, firstName, lastName, email, founderRate: founderRate ? "oui" : "non", setupFee: setupFee ? "oui" : "non" },
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
      setupFee: Boolean(setupFee),
      checkoutUrl: session.url!,
    })

    return NextResponse.json({ success: true, url: session.url, id: session.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("Stripe quote error:", message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
