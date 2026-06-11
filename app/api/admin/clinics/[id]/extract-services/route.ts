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

    const sample = content

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analyse ce contenu de site web et liste TOUS les produits, services, soins, traitements, formations et cours mentionnés. Retourne UNIQUEMENT du JSON valide sans markdown:
[{"name":"Nom exact","description":"1 phrase ou vide","price_range":"","duration":""}]

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
  } catch (e) {
    console.error("[extract-services] error:", e)
    return []
  }
}
