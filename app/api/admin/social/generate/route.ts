import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages"
import { createSocialPost } from "@/lib/supabase/social"
import type { PostType, PostStyle, Slide } from "@/lib/supabase/social"

const client = new Anthropic()

// Step 1 — Research trending content for the topic using web search
async function researchTrends(topic: string): Promise<string> {
  const messages: MessageParam[] = [{
    role: "user",
    content: `Recherche les posts et formats les plus viraux pour promouvoir un service ou un outil aux PROPRIÉTAIRES de cliniques et salons (esthétique, beauté) sur le sujet "${topic}".
Identifie: les hooks/accroches qui fonctionnent, les formats qui performent (éducatif, problème/solution, témoignage, statistique, conseil business), les émotions et pain points qui engagent les propriétaires (appels manqués, manque de temps, perte de revenus), et les angles créatifs populaires.
Résume tes découvertes en 5-6 points concrets.`
  }]

  let response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    tools: [{ type: "web_search_20250305" as "web_search_20250305", name: "web_search" }],
    messages,
  })

  // Agentic loop — let Claude search as many times as it needs
  while (response.stop_reason === "tool_use") {
    const assistantContent = response.content
    messages.push({ role: "assistant", content: assistantContent })

    const toolResults = assistantContent
      .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
      .map((b) => ({
        type: "tool_result" as const,
        tool_use_id: b.id,
        content: (b as unknown as { output?: string }).output ?? "",
      }))

    messages.push({ role: "user", content: toolResults })

    response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      tools: [{ type: "web_search_20250305" as "web_search_20250305", name: "web_search" }],
      messages,
    })
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")
  return textBlock?.text ?? ""
}

const VOCALI_BRIEF = `À PROPOS DE VOCALI (le produit à promouvoir) :
Vocali (vocali.ca) est le « Système Vocali 24/7 » : une réceptionniste virtuelle IA qui répond aux appels entrants des cliniques et salons (médico-esthétique, beauté, esthétique, écoles de formation). Elle informe les clientes, présente les services et les tarifs, répond aux questions fréquentes et aide à prendre rendez-vous, même lorsque l'équipe est en soin ou que l'établissement est fermé.
Bénéfice clé : ne plus jamais perdre de clientes à cause des appels manqués.
Public cible des posts : les PROPRIÉTAIRES de cliniques et de salons au Québec (pas les clientes finales).`

function buildPrompt(topic: string, postType: PostType, trends: string, customContent?: string): string {
  const slideCount =
    postType === "single"    ? 1 :
    postType === "story"     ? 1 :
    postType === "carousel3" ? 3 : 6

  const format = postType === "story" ? "story Instagram vertical" : "post Instagram"

  return `Tu es un expert en marketing de contenu pour VOCALI au Québec. Crée un ${format} pour les réseaux sociaux de Vocali.

${VOCALI_BRIEF}

RÈGLE PRINCIPALE — TOUJOURS PROMOUVOIR VOCALI :
Par défaut, CHAQUE post doit faire la promotion de Vocali et de son service (réceptionniste IA 24/7), s'adresser aux propriétaires de cliniques et de salons, et les ramener vers vocali.ca. Relie TOUJOURS le sujet ci-dessous à la valeur de Vocali (ex. « appels manqués = clientes perdues que Vocali récupère »). Ne crée pas de contenu beauté générique destiné aux clientes finales.
EXCEPTION : uniquement si le SUJET ou le TEXTE FOURNI demande EXPLICITEMENT un autre type de post (clairement non lié à Vocali), alors produis plutôt ce qui est demandé.

SUJET : "${topic}"
NOMBRE DE SLIDES : ${slideCount}

${customContent ? `TEXTE / CONTENU FOURNI (utilise ce contenu comme base principale, reformule et adapte au format):\n${customContent}\n` : ""}
${trends ? `TENDANCES ACTUELLES (basées sur recherche) :\n${trends}\n` : ""}

Instructions de création :
${slideCount === 1 ? "- 1 slide : titre accrocheur lié à Vocali (ex. appels manqués) + texte percutant (2-3 phrases)" : ""}
${slideCount === 3 ? "- Slide 1 : hook viral en titre (couverture, pas de body)\n- Slide 2 : le pain point du propriétaire et comment Vocali le règle (2-3 phrases)\n- Slide 3 : call-to-action vers Vocali" : ""}
${slideCount === 6 ? "- Slide 1 : hook viral en titre (couverture, pas de body)\n- Slides 2-5 : valeur de Vocali développée (bénéfices, comment ça marche, 1-2 phrases chacune)\n- Slide 6 : call-to-action vers Vocali" : ""}
${customContent ? "- Respecte les idées et le sens du texte fourni, mais ramène-le vers Vocali et adapte le format" : "- Applique les formats et angles viraux identifiés dans les tendances, au service du message Vocali"}
- Tone : professionnel, chaleureux, crédible (B2B mais humain)
- Langue : français québécois naturel et authentique
- Titres courts et impactants (max 8 mots)
- Contenu des slides : 1-3 phrases max
- Le call-to-action ramène TOUJOURS vers Vocali (ex. « Réservez une démo → », « Découvrez Vocali », « vocali.ca »)
- INTERDIT : n'utilise JAMAIS le tiret long « — » (em dash) dans les titres, corps de texte, captions ou hashtags. Remplace-le par une virgule, un point, ou reformule la phrase.

Génère aussi :
- Une caption Instagram engageante destinée aux propriétaires de cliniques/salons (question, émotion ou valeur, 2-3 phrases + emoji) qui mène vers vocali.ca
- 5 hashtags pertinents pour Vocali et son audience (ex. réceptionniste IA, clinique, salon, automatisation, Québec) sans #

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "slides": [
    {"headline": "...", "body": "...", "cta": ""},
    ...
  ],
  "caption": "...",
  "hashtags": ["...", "...", "...", "...", "..."]
}

- Pour les slides sans body (couverture), mets body à "".
- Pour la DERNIÈRE slide d'un carousel (slide call-to-action), mets un texte CTA court dans "cta" (ex: "Prendre rendez-vous →"). Pour toutes les autres slides, mets cta à "".`
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json() as { topic?: string; postType?: PostType; style?: PostStyle; useTrends?: boolean; customContent?: string }
    const { topic = "", postType = "single", style = "light", useTrends = true, customContent } = body

    if (!topic.trim() && !customContent?.trim()) {
      return NextResponse.json({ error: "Un sujet ou un texte est requis" }, { status: 400 })
    }
    const effectiveTopic = topic.trim() || customContent!.slice(0, 60)

    const trends = useTrends ? await researchTrends(effectiveTopic) : ""

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(effectiveTopic, postType, trends, customContent) }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Erreur de génération — réponse inattendue" }, { status: 500 })
    }

    let parsed: { slides: Slide[]; caption: string; hashtags: string[] }
    try {
      parsed = JSON.parse(jsonMatch[0]) as { slides: Slide[]; caption: string; hashtags: string[] }
    } catch {
      return NextResponse.json({ error: "Erreur de parsing JSON" }, { status: 500 })
    }

    const post = await createSocialPost({
      topic: effectiveTopic,
      post_type: postType,
      style,
      slides: parsed.slides,
      caption: parsed.caption,
      hashtags: parsed.hashtags,
    })

    return NextResponse.json({ post })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("[social/generate]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
