"use server"

import { revalidatePath } from "next/cache"
import { getClinic } from "@/lib/supabase/dashboard"
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  type CatalogItem,
  type CatalogItemInput,
  type CatalogKind,
} from "@/lib/supabase/catalog"

// Résout la clinique de l'utilisateur connecté (cliente, ou admin via magic link).
async function requireClinicId(): Promise<string> {
  const clinic = await getClinic()
  if (!clinic) throw new Error("Non autorisé")
  return clinic.id as string
}

export async function addCatalogItem(kind: CatalogKind): Promise<CatalogItem> {
  const clinicId = await requireClinicId()
  const item = await createCatalogItem(clinicId, { kind, name: "" })
  revalidatePath("/dashboard/settings")
  return item
}

export async function saveCatalogItem(id: string, patch: CatalogItemInput): Promise<void> {
  const clinicId = await requireClinicId()
  await updateCatalogItem(clinicId, id, patch)
  revalidatePath("/dashboard/settings")
}

export async function removeCatalogItem(id: string): Promise<void> {
  const clinicId = await requireClinicId()
  await deleteCatalogItem(clinicId, id)
  revalidatePath("/dashboard/settings")
}
