"use server"

import { resetDemoStats } from "@/lib/supabase/demo-stats"
import { revalidatePath } from "next/cache"

export async function resetDemoStatsAction() {
  await resetDemoStats()
  revalidatePath("/admin/demo-stats")
}
