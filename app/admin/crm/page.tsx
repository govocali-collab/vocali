export const dynamic = "force-dynamic"

import { getAllProspects } from "@/lib/supabase/prospects"
import CRMView from "./CRMView"

export default async function AdminCRMPage() {
  const allProspects = await getAllProspects()
  return <CRMView allProspects={allProspects} />
}
