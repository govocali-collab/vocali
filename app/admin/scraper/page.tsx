export const dynamic = "force-dynamic"

import { getRecentSessions } from "@/lib/supabase/scraper"
import ScraperView from "./ScraperView"

export default async function AdminScraperPage() {
  const initialSessions = await getRecentSessions(15)
  return <ScraperView initialSessions={initialSessions} />
}
