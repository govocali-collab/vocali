import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminClient()

  const { data: location } = await supabase
    .from("locations")
    .select("id, website_content")
    .eq("clinic_id", id)
    .single()

  if (!location?.website_content) {
    return Response.json({ error: "Aucun contenu scrappé" }, { status: 400 })
  }

  const services = await extractServices(location.website_content)

  if (services.length > 0) {
    await supabase
      .from("locations")
      .update({ services })
      .eq("id", location.id)
  }

  return Response.json({ servicesFound: services.length })
}

async function extractServices(content: string): Promise<{ name: string; description: string; price_range: string; duration: string }[]> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const serviceKeywords = /service|formation|soin|traitement|massage|épilation|manucure|pédicure|botox|filler|laser|microbla|extension|lash|maquillage|facial|peeling|hydra|dermato|cours|atelier|produit/i
    const pages = content.split(/\n(?==== )/)
    const relevant = pages.filter(p => serviceKeywords.test(p))
    const sample = (relevant.length > 0 ? relevant.join("\n") : content).slice(0, 6_000)

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Extrait tous les services, soins, traitements, formations et produits de ce contenu. Retourne UNIQUEMENT du JSON valide, sans markdown:
[{"name":"Nom","description":"1 phrase","price_range":"","duration":""}]

Inclure: services esthétiques, soins, formations, cours, produits vendus.
Maximum 40 éléments. Ne rien inventer.

CONTENU:
${sample}`
      }]
    })

    const text = msg.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("")
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s: unknown) => s && typeof s === "object" && "name" in (s as object))
  } catch {
    return []
  }
}
