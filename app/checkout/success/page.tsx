import Stripe from "stripe"
import { redirect } from "next/navigation"

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) redirect("/")

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch (err) {
    // Session introuvable (ex. session de test ouverte sur l'environnement Live).
    console.error("[checkout.success] session introuvable:", err instanceof Error ? err.message : err)
    redirect("/")
  }

  if (session.payment_status !== "paid") {
    redirect("/checkout/cancelled")
  }

  const { clinicName, firstName, lastName, email } = session.metadata ?? {}

  const params = new URLSearchParams()
  if (clinicName) params.set("clinicName", clinicName)
  if (firstName) params.set("firstName", firstName)
  if (lastName) params.set("lastName", lastName)
  if (email) params.set("email", email)

  redirect(`/onboarding?${params.toString()}`)
}
