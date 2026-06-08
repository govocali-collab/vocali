import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Asstastic,77!"

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set("admin_token", "vocali_admin_authed", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })
  return response
}
