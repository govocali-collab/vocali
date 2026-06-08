import { NextRequest, NextResponse } from "next/server"
import { getLeadsBySession } from "@/lib/supabase/scraper"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = req.headers.get("cookie") ?? ""
  if (!cookie.includes("admin_token=vocali_admin_authed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const leads = await getLeadsBySession(id)
  return NextResponse.json({ leads })
}
