import { NextRequest, NextResponse } from "next/server"
import { updateSocialPost, type PostStatus, type Slide } from "@/lib/supabase/social"

type PatchBody = {
  scheduled_date?: string | null
  status?: PostStatus
  slides?: Slide[]
  caption?: string
  topic?: string
  hashtags?: string[]
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = (await req.json()) as PatchBody

    const patch: PatchBody = {}
    if ("scheduled_date" in body) patch.scheduled_date = body.scheduled_date || null
    if (body.status === "prevu" || body.status === "publie") patch.status = body.status
    if (Array.isArray(body.slides)) patch.slides = body.slides
    if (typeof body.caption === "string") patch.caption = body.caption
    if (typeof body.topic === "string") patch.topic = body.topic
    if (Array.isArray(body.hashtags)) patch.hashtags = body.hashtags

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 })
    }

    const post = await updateSocialPost(id, patch)
    return NextResponse.json({ post })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error("[social/[id] PATCH]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
