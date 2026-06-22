import { NextRequest, NextResponse } from "next/server"
import { createSocialPost } from "@/lib/supabase/social"
import type { PostType, PostStyle, Slide } from "@/lib/supabase/social"

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as {
      topic?: string
      post_type?: PostType
      style?: PostStyle
      slides?: Slide[]
      caption?: string
      hashtags?: string[]
    }

    if (!body.slides || body.slides.length === 0) {
      return NextResponse.json({ error: "Aucun contenu à enregistrer" }, { status: 400 })
    }

    // Titre du post = première ligne (titre de la 1re slide), sans balisage HTML.
    const firstLine = (body.slides[0]?.headline ?? "").replace(/<[^>]+>/g, "").trim()
    const topic = firstLine ? firstLine.slice(0, 120) : (body.topic ?? "")

    const post = await createSocialPost({
      topic,
      post_type: body.post_type ?? "single",
      style: body.style ?? "light",
      slides: body.slides,
      caption: body.caption ?? "",
      hashtags: body.hashtags ?? [],
    })

    return NextResponse.json({ post })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("[social/save]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
