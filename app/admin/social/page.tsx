export const dynamic = "force-dynamic"

import SocialView from "./SocialView"
import { getRecentSocialPosts } from "@/lib/supabase/social"

export default async function SocialPage() {
  let posts: Awaited<ReturnType<typeof getRecentSocialPosts>> = []
  try {
    posts = await getRecentSocialPosts(30)
  } catch {
    // table not yet created
  }

  return <SocialView initialPosts={posts} />
}
