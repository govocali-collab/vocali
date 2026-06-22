import { NextResponse } from "next/server"
import Stripe from "stripe"
import { sendPaymentLinkEmail } from "@/lib/email/resend"

// Produits Stripe selon le mode (Test et Live sont des environnements séparés).
// Le bon jeu de produits est choisi automatiquement selon la clé secrète.
function getProducts(testMode: boolean) {
  return testMode
    ? { essentiel: "prod_UkgjdAxg1DWweN", illimite: "prod_UkgjkJMSVwgyw8", setup: "prod_UkgjANSgf8rYmH" }
    : { essentiel: "prod_UkfmoPOlzPxMIJ", illimite: "prod_UkfmaJt73lcY47", setup: "prod_Ukft7xpIH4rttV" }
}

// Coupon « tarif fondateur » : 50 % pendant 3 mois, UNIQUEMENT sur l'abonnement.
// Créé une fois par mode (test/live) puis réutilisé.
async function getFounderCoupon(stripe: Stripe, planProducts: string[]): Promise<string> {
  const id = "fondateur-50-3mois-abo"
  try {
    await stripe.coupons.retrieve(id)
  } catch {
    await stripe.coupons.create({
      id,
      percent_off: 50,
      duration: "repeating",
      duration_in_months: 3,
      applies_to: { products: planProducts },
      name: "Tarif fondateur — 50 % (3 mois)",
    })
  }
  return id
}

export async function POST(req: Request) {
  try {
    const { clinicName, firstName, lastName, email, price, description, billing, trial, founderRate, plan, setupFee } = await req.json()

    const secretKey = process.env.STRIPE_SECRET_KEY!
    const stripe = new Stripe(secretKey)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const testMode = secretKey.startsWith("sk_test")
    const PRODUCTS = getProducts(testMode)
    const planProduct =
      plan === "illimite" ? PRODUCTS.illimite : plan === "essentiel" ? PRODUCTS.essentiel : undefined

    // Frais d'installation : montant direct (250 $ fondateur / 500 $ régulier).
    const setupAmount = founderRate ? 25000 : 50000

    // Récapitulatif clair affiché au-dessus du bouton de paiement (aujourd'hui vs récurrent).
    const fmt = (n: number) => new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n)
    const interval = billing === "year" ? "an" : "mois"
    const monthlyNow = founderRate ? price / 2 : price
    const setup = founderRate ? 250 : 500
    let recap: string
    if (trial) {
      recap = `Essai gratuit de 30 jours. ${setupFee ? `Frais d'installation unique de ${fmt(setup)} payés aujourd'hui. ` : "Aucun montant aujourd'hui. "}Ensuite ${fmt(price)}/${interval}.`
    } else {
      const todayTotal = monthlyNow + (setupFee ? setup : 0)
      recap =
        `À payer aujourd'hui : ${fmt(todayTotal)} — 1er ${interval} ${fmt(monthlyNow)}` +
        `${founderRate ? " (tarif fondateur -50 %)" : ""}${setupFee ? ` + installation unique ${fmt(setup)}` : ""}. ` +
        (founderRate
          ? `Puis ${fmt(monthlyNow)}/${interval} pendant 3 mois, ensuite ${fmt(price)}/${interval}.`
          : `Puis ${fmt(price)}/${interval}.`)
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            unit_amount: Math.round(price * 100),
            recurring: { interval: billing as "month" | "year" },
            // Forfait sélectionné → vrai produit Stripe (reporting propre).
            // Sinon (prix custom) → produit ad-hoc.
            ...(planProduct
              ? { product: planProduct }
              : { product_data: { name: "Vocali — Secrétaire IA", description } }),
          },
          quantity: 1,
        },
        ...(setupFee
          ? [{ price_data: { currency: "cad", product: PRODUCTS.setup, unit_amount: setupAmount }, quantity: 1 }]
          : []),
      ],
      subscription_data: trial ? { trial_period_days: 30 } : undefined,
      discounts: founderRate
        ? [{ coupon: await getFounderCoupon(stripe, [PRODUCTS.essentiel, PRODUCTS.illimite]) }]
        : undefined,
      metadata: { clinicName, firstName, lastName, email, founderRate: founderRate ? "oui" : "non", setupFee: setupFee ? "oui" : "non" },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancelled`,
      locale: "fr",
      payment_method_types: ["card"],
      custom_text: { submit: { message: recap } },
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
