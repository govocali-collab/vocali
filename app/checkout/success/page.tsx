import Stripe from "stripe"
import { redirect } from "next/navigation"

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) redirect("/")

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const session = await stripe.checkout.sessions.retrieve(session_id)

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
