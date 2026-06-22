import { redirect } from "next/navigation"

// Les reçus sont désormais un onglet de la page Paramètres.
export default function BillingPage() {
  redirect("/dashboard/settings")
}
