"use server"

import { createProspect, updateProspect, deleteProspect } from "@/lib/supabase/prospects"
import type { ProspectStatus } from "@/lib/supabase/prospects"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addProspectAction(formData: FormData) {
  const prospect = await createProspect({
    clinic_name: formData.get("clinic_name") as string,
    owner_name:  (formData.get("owner_name") as string) || null,
    phone:       (formData.get("phone") as string) || null,
    email:       (formData.get("email") as string) || null,
    city:        (formData.get("city") as string) || null,
    source:      (formData.get("source") as string) || null,
    status:      "nouveau",
  })
  revalidatePath("/admin/crm")
  redirect(`/admin/crm/${prospect.id}`)
}

export async function updateProspectAction(id: string, formData: FormData) {
  await updateProspect(id, {
    clinic_name:     formData.get("clinic_name") as string,
    owner_name:      (formData.get("owner_name") as string) || null,
    phone:           (formData.get("phone") as string) || null,
    email:           (formData.get("email") as string) || null,
    city:            (formData.get("city") as string) || null,
    source:          (formData.get("source") as string) || null,
    status:          formData.get("status") as ProspectStatus,
    notes:           (formData.get("notes") as string) || null,
    last_contact_at: formData.get("last_contact_at")
      ? new Date(formData.get("last_contact_at") as string).toISOString()
      : null,
  })
  revalidatePath("/admin/crm")
  revalidatePath(`/admin/crm/${id}`)
}

export async function updateStatusAction(id: string, status: ProspectStatus) {
  await updateProspect(id, { status })
  revalidatePath("/admin/crm")
  revalidatePath(`/admin/crm/${id}`)
}

export async function deleteProspectAction(id: string) {
  await deleteProspect(id)
  revalidatePath("/admin/crm")
  redirect("/admin/crm")
}
