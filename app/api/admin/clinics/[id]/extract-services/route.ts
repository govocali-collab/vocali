import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"
import { listCatalog, bulkCreateCatalogItems, type CatalogKind } from "@/lib/supabase/catalog"

// L'extraction (gros contenu + génération JSON) peut prendre du temps.
export const maxDuration = 60

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

async function extractItems(content: string): Promise<Extracted[]> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `Tu analyses le contenu du site web d'une clinique d'esthétique au Québec. Liste de façon EXHAUSTIVE absolument TOUS les soins/traitements/services, TOUTES les formations/cours, et tous les produits.

⚠️ IMPORTANT : la section « LISTE COMPLÈTE DES PRODUITS / SERVICES / FORMATIONS (depuis le sitemap) » contient TOUS les éléments du site — n'en OUBLIE AUCUN de cette liste. Nettoie juste le nom pour qu'il soit lisible (ex: "Formation Tiny Tattoo 100 Elearning Avec Prerequis Trousse Incluse" → "Formation Tiny Tattoo 100% e-learning (avec prérequis, trousse incluse)").

Pour chaque élément, classe-le dans "kind" :
- "service" : un soin/traitement offert en clinique (ex: facial, épilation, microblading, microneedling, maquillage permanent)
- "formation" : une formation ou un cours (tout nom contenant "formation" ou "cours" → formation)
- "produit" : un produit physique vendu (crèmes, sérums, trousses, outils, accessoires…)

Pour "description"/"price"/"duration" : reprends-les du site quand ils sont présents, sinon laisse VIDE. N'invente RIEN.

Retourne UNIQUEMENT du JSON compact, sans markdown. Pour CHAQUE élément : "k" = "s" (service), "f" (formation) ou "p" (produit) ; "n" = nom propre. Ajoute "pr" (prix), "dr" (durée), "ds" (description) UNIQUEMENT si l'info est écrite sur le site (sinon omets-les) :
[{"k":"f","n":"Formation Microblading"},{"k":"s","n":"Soin du visage PAYOT","pr":"95 $"}]

Sois COMPLET : inclus jusqu'à 300 éléments si la liste en contient autant.

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

    const kindMap: Record<string, CatalogKind> = { s: "service", f: "formation", p: "produit" }
    return parsed
      .filter((s: unknown) => s && typeof s === "object" && "n" in (s as object))
      .map((s: Record<string, unknown>) => ({
        kind: kindMap[String(s.k)] ?? "service",
        name: String(s.n ?? "").trim(),
        description: String(s.ds ?? "").trim(),
        price: String(s.pr ?? "").trim(),
        duration: String(s.dr ?? "").trim(),
      }))
      .filter((i: Extracted) => i.name)
  } catch (e) {
    console.error("[extract-services] error:", e)
    return []
  }
}
