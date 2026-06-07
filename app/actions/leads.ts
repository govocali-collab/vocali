"use server"

import { revalidatePath } from "next/cache"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { LeadStatus } from "@/lib/supabase/dashboard"

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = getServiceClient()
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/leads")
  revalidatePath("/dashboard")
}
