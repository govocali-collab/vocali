import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const cookie = headersList.get("cookie") ?? ""
  const isAuthed = cookie.includes("admin_token=vocali_admin_authed")

  if (!isAuthed) {
    redirect("/admin/login")
  }

  return <>{children}</>
}
