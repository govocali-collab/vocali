import { createClient } from "@supabase/supabase-js"

export type CatalogKind = "service" | "formation" | "produit"

export type CatalogItem = {
  id: string
  clinic_id: string
  kind: CatalogKind
  name: string
  description: string | null
  price: string | null
  promotion: string | null
  duration: string | null
  active: boolean
  sort_order: number
}

export type CatalogItemInput = {
  kind?: CatalogKind
  name?: string
  description?: string | null
  price?: string | null
  promotion?: string | null
  duration?: string | null
  active?: boolean
  sort_order?: number
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const COLS = "id, clinic_id, kind, name, description, price, promotion, duration, active, sort_order"

export async function listCatalog(clinicId: string, kind?: CatalogKind): Promise<CatalogItem[]> {
  let query = admin()
    .from("catalog_items")
    .select(COLS)
    .eq("clinic_id", clinicId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (kind) query = query.eq("kind", kind)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as CatalogItem[]
}

export async function createCatalogItem(clinicId: string, item: CatalogItemInput): Promise<CatalogItem> {
  const { data, error } = await admin()
    .from("catalog_items")
    .insert({
      clinic_id: clinicId,
      kind: item.kind ?? "service",
      name: item.name ?? "",
      description: item.description ?? null,
      price: item.price ?? null,
      promotion: item.promotion ?? null,
      duration: item.duration ?? null,
      active: item.active ?? true,
      sort_order: item.sort_order ?? 0,
    })
    .select(COLS)
    .single()
  if (error) throw new Error(error.message)
  return data as CatalogItem
}

// Mise à jour scopée par clinic_id ET id (empêche d'éditer l'item d'une autre clinique).
export async function updateCatalogItem(clinicId: string, id: string, patch: CatalogItemInput): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of ["kind", "name", "description", "price", "promotion", "duration", "active", "sort_order"] as const) {
    if (patch[k] !== undefined) update[k] = patch[k]
  }
  const { error } = await admin()
    .from("catalog_items")
    .update(update)
    .eq("id", id)
    .eq("clinic_id", clinicId)
  if (error) throw new Error(error.message)
}

export async function deleteCatalogItem(clinicId: string, id: string): Promise<void> {
  const { error } = await admin()
    .from("catalog_items")
    .delete()
    .eq("id", id)
    .eq("clinic_id", clinicId)
  if (error) throw new Error(error.message)
}

// Insertion en masse (scraper, import CSV). Ignore les noms vides.
export async function bulkCreateCatalogItems(clinicId: string, items: CatalogItemInput[]): Promise<number> {
  const rows = items
    .filter((i) => (i.name ?? "").trim())
    .map((i, idx) => ({
      clinic_id: clinicId,
      kind: i.kind ?? "service",
      name: (i.name ?? "").trim(),
      description: i.description ?? null,
      price: i.price ?? null,
      promotion: i.promotion ?? null,
      duration: i.duration ?? null,
      active: i.active ?? true,
      sort_order: i.sort_order ?? idx,
    }))
  if (rows.length === 0) return 0
  const { error } = await admin().from("catalog_items").insert(rows)
  if (error) throw new Error(error.message)
  return rows.length
}

// Import (CSV) : pour chaque item, met à jour l'item existant du même nom
// (insensible à la casse) — pratique pour ajouter les prix sur des items déjà
// scrappés — sinon l'insère. Ne touche qu'aux champs fournis non vides.
export async function upsertCatalogByName(
  clinicId: string,
  items: CatalogItemInput[],
): Promise<{ inserted: number; updated: number }> {
  const existing = await listCatalog(clinicId)
  const byName = new Map(existing.map((i) => [i.name.trim().toLowerCase(), i]))

  let updated = 0
  const toInsert: CatalogItemInput[] = []

  for (const it of items) {
    const name = (it.name ?? "").trim()
    if (!name) continue
    const match = byName.get(name.toLowerCase())
    if (match) {
      const patch: CatalogItemInput = {}
      if (it.price) patch.price = it.price
      if (it.description) patch.description = it.description
      if (it.duration) patch.duration = it.duration
      if (it.promotion) patch.promotion = it.promotion
      if (it.kind) patch.kind = it.kind
      if (Object.keys(patch).length > 0) {
        await updateCatalogItem(clinicId, match.id, patch)
        updated++
      }
    } else {
      toInsert.push(it)
    }
  }

  const inserted = toInsert.length > 0 ? await bulkCreateCatalogItems(clinicId, toInsert) : 0
  return { inserted, updated }
}
