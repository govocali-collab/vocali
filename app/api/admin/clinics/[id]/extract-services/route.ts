import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"
import { listCatalog, bulkCreateCatalogItems, type CatalogKind } from "@/lib/supabase/catalog"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Extracted = { kind: CatalogKind; name: string; description: string; price: string; duration: string }

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // = clinic_id
  const supabase = getAdminClient()

  const { data: location } = await supabase
    .from("locations")
    .select("id, website_content")
    .eq("clinic_id", id)
    .single()

  if (!location?.website_content) {
    return Response.json({ error: "Aucun contenu scrappé" }, { status: 400 })
  }

  const items = await extractItems(location.website_content)
  if (items.length === 0) return Response.json({ servicesFound: 0 })

  // Écrit dans le catalogue éditable (catalog_items). Dédoublonnage par nom
  // (insensible à la casse) pour ne pas créer de doublons à un re-scrape et
  // préserver les items ajoutés manuellement.
  const existing = await listCatalog(id).catch(() => [])
  const existingNames = new Set(existing.map((i) => i.name.trim().toLowerCase()))
  const toInsert = items
    .filter((i) => i.name.trim() && !existingNames.has(i.name.trim().toLowerCase()))
    .map((i) => ({
      kind: i.kind,
      name: i.name.trim(),
      description: i.description || null,
      price: i.price || null,
      duration: i.duration || null,
    }))
  const inserted = await bulkCreateCatalogItems(id, toInsert).catch(() => 0)

  // Garde aussi l'ancienne liste à jour (repli de l'agent si le catalogue est vide).
  await supabase
    .from("locations")
    .update({
      services: items.map((i) => ({
        name: i.name,
        description: i.description,
        price_range: i.price,
        duration: i.duration,
      })),
    })
    .eq("id", location.id)

  return Response.json({ servicesFound: inserted })
}

const KINDS: CatalogKind[] = ["service", "formation", "produit"]

async function extractItems(content: string): Promise<Extracted[]> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `Tu analyses le contenu du site web d'une clinique d'esthétique au Québec. Liste TOUS les soins/traitements/services, les formations/cours, et les produits mentionnés.

Pour chaque élément, classe-le dans "kind" :
- "service" : un soin, traitement ou service offert (ex: Botox, facial, épilation laser)
- "formation" : une formation ou un cours donné par la clinique
- "produit" : un produit physique vendu

Retourne UNIQUEMENT du JSON valide, sans markdown :
[{"kind":"service","name":"Nom exact","description":"1 phrase ou vide","price":"prix si mentionné sinon vide","duration":"durée si mentionnée sinon vide"}]

Règles : maximum 60 éléments. N'invente RIEN — laisse "price" et "duration" vides s'ils ne sont pas écrits sur le site.

CONTENU:
${content}`,
        },
      ],
    })

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((s: unknown) => s && typeof s === "object" && "name" in (s as object))
      .map((s: Record<string, unknown>) => {
        const kind = KINDS.includes(s.kind as CatalogKind) ? (s.kind as CatalogKind) : "service"
        return {
          kind,
          name: String(s.name ?? "").trim(),
          description: String(s.description ?? "").trim(),
          price: String(s.price ?? "").trim(),
          duration: String(s.duration ?? "").trim(),
        }
      })
      .filter((i: Extracted) => i.name)
  } catch (e) {
    console.error("[extract-services] error:", e)
    return []
  }
}
