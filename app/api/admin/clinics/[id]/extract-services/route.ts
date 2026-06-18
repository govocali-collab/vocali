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
          content: `Tu analyses le contenu du site web d'une clinique d'esthétique au Québec. Liste UNIQUEMENT les SOINS/TRAITEMENTS/SERVICES offerts en clinique, et les FORMATIONS/COURS.

🚫 N'INCLUS PAS les produits de revente / la boutique (crèmes, sérums, lotions, masques, trousses, kits, outils, accessoires, aiguilles, encres, dermographes, coffrets, suppléments, etc.). On NE veut QUE des services et des formations.

⚠️ Une section « LISTE COMPLÈTE … (depuis le sitemap) » peut être présente : utilise-la pour n'oublier aucun service ni aucune formation, mais ignore tout ce qui est un produit physique. Nettoie le nom pour qu'il soit lisible.

Pour chaque élément, classe-le dans "k" :
- "s" : un soin/traitement offert en clinique (ex: facial, épilation, microblading, microneedling, maquillage permanent, B-Pulse)
- "f" : une formation ou un cours (tout nom contenant "formation" ou "cours" → formation)

Pour "description"/"price"/"duration" : reprends-les du site quand ils sont présents, sinon laisse VIDE. N'invente RIEN.

Retourne UNIQUEMENT du JSON compact, sans markdown. "n" = nom propre ; ajoute "pr" (prix), "dr" (durée), "ds" (description) seulement si écrits sur le site :
[{"k":"f","n":"Formation Microblading"},{"k":"s","n":"Soin du visage PAYOT","pr":"95 $"}]

Sois COMPLET pour les services et formations.

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

    const kindMap: Record<string, CatalogKind> = { s: "service", f: "formation" }
    return parsed
      // On ne garde QUE services + formations (on ignore les produits "p").
      .filter((s: unknown) => s && typeof s === "object" && "n" in (s as object) && String((s as Record<string, unknown>).k ?? "s") !== "p")
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
