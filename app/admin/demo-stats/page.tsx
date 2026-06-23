import { redirect } from "next/navigation"

// Les stats démo sont désormais un onglet de Statistiques.
export default function DemoStatsPage() {
  redirect("/admin/stats?tab=demo")
}
