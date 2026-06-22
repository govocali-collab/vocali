"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  publishCatalogDrafts,
} from "@/lib/supabase/catalog"
import type { CatalogItem, CatalogItemInput, CatalogKind } from "@/lib/supabase/catalog"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Catalogue (admin) : items créés en BROUILLON (published=false) jusqu'au Push ──

export async function adminAddCatalogItem(clinicId: string, kind: CatalogKind): Promise<CatalogItem> {
  return createCatalogItem(clinicId, { kind, name: "", published: false })
}

export async function adminSaveCatalogItem(clinicId: string, id: string, patch: CatalogItemInput): Promise<void> {
  await updateCatalogItem(clinicId, id, patch)
}

export async function adminRemoveCatalogItem(clinicId: string, id: string): Promise<void> {
  await deleteCatalogItem(clinicId, id)
}

/** Publie les brouillons (rend visibles à la cliente + l'agent). Retourne le nombre publié. */
export async function adminPublishCatalog(clinicId: string, kind: CatalogKind): Promise<number> {
  const n = await publishCatalogDrafts(clinicId, kind)
  revalidatePath(`/admin/clinics/${clinicId}`)
  return n
}

export async function updateClinicNotes(clinicId: string, notes: string) {
  const admin = getAdminClient()
  const { error } = await admin
    .from("clinics")
    .update({ internal_notes: notes })
    .eq("id", clinicId)
  if (error) throw new Error(error.message)
}
