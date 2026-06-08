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
    content: `Recherche les posts Instagram les plus viraux et tendances actuelles pour les cliniques esthétiques sur le sujet "${topic}".
Identifie: les hooks/accroches qui fonctionnent, les formats qui performent (éducatif, avant/après, témoignage, conseil), les émotions qui engagent, et les angles créatifs populaires pour ce type de clinique.
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

function buildPrompt(topic: string, postType: PostType, trends: string, customContent?: string): string {
  const slideCount =
    postType === "single"    ? 1 :
    postType === "story"     ? 1 :
    postType === "carousel3" ? 3 : 6

  const format = postType === "story" ? "story Instagram vertical" : "post Instagram"

  return `Tu es un expert en marketing pour cliniques esthétiques au Québec. Crée du contenu pour un ${format}.

SUJET : "${topic}"
NOMBRE DE SLIDES : ${slideCount}

${customContent ? `TEXTE / CONTENU FOURNI (utilise ce contenu comme base principale, reformule et adapte au format):\n${customContent}\n` : ""}
${trends ? `TENDANCES ACTUELLES (basées sur recherche) :\n${trends}\n` : ""}

Instructions de création :
${slideCount === 1 ? "- 1 slide : titre accrocheur basé sur une tendance + texte percutant (2-3 phrases)" : ""}
${slideCount === 3 ? "- Slide 1 : hook viral en titre (couverture, pas de body)\n- Slide 2 : contenu principal qui répond à une question ou pain point (2-3 phrases)\n- Slide 3 : call-to-action fort" : ""}
${slideCount === 6 ? "- Slide 1 : hook viral en titre (couverture, pas de body)\n- Slides 2-5 : contenu éducatif/valeur développé (1-2 phrases chacune)\n- Slide 6 : call-to-action fort" : ""}
${customContent ? "- Respecte les idées et le sens du texte fourni, mais adapte le format et le ton" : "- Applique les formats et angles viraux identifiés dans les tendances"}
- Tone : professionnel, chaleureux, luxueux mais accessible
- Langue : français québécois naturel et authentique
- Titres courts et impactants (max 8 mots)
- Contenu des slides : 1-3 phrases max
- INTERDIT : n'utilise JAMAIS le tiret long « — » (em dash) dans les titres, corps de texte, captions ou hashtags. Remplace-le par une virgule, un point, ou reformule la phrase.

Génère aussi :
- Une caption Instagram engageante qui crée de l'engagement (question, émotion, ou valeur — 2-3 phrases + emoji)
- 5 hashtags pertinents et trending pour clinique esthétique Québec (sans #)

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "slides": [
    {"headline": "...", "body": "..."},
    ...
  ],
  "caption": "...",
  "hashtags": ["...", "...", "...", "...", "..."]
}

Pour les slides sans body (couverture), mets body à "".`
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
