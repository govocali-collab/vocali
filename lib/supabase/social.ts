import { createClient } from "@supabase/supabase-js"

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type PostType = "single" | "carousel3" | "carousel6" | "story"
export type PostStyle = "light" | "dark"

export interface Slide {
  headline: string
  body: string
  cta?: string
}

export interface SocialPost {
  id: string
  created_at: string
  topic: string
  post_type: PostType
  style: PostStyle
  slides: Slide[]
  caption: string
  hashtags: string[]
}

export async function createSocialPost(data: Omit<SocialPost, "id" | "created_at">): Promise<SocialPost> {
  const supabase = getClient()
  const { data: row, error } = await supabase
    .from("social_posts")
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return row as SocialPost
}

export async function getRecentSocialPosts(limit = 30): Promise<SocialPost[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as SocialPost[]
}

export async function deleteSocialPost(id: string): Promise<void> {
  const supabase = getClient()
  await supabase.from("social_posts").delete().eq("id", id)
}
