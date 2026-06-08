import { headers } from "next/headers"
import { redirect } from "next/navigation"
import AdminNav from "@/components/admin/AdminNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const cookie = headersList.get("cookie") ?? ""
  const isAuthed = cookie.includes("admin_token=vocali_admin_authed")

  if (!isAuthed) {
    redirect("/admin-login")
  }

  return (
    <div className="min-h-screen bg-ivory-100 font-body">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-5 pb-10">
        {children}
      </div>
    </div>
  )
}
