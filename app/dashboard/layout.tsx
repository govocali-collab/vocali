import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getClinic } from "@/lib/supabase/dashboard"
import Sidebar from "@/components/dashboard/Sidebar"
import AuthRefresh from "@/components/dashboard/AuthRefresh"
import ForcePasswordChange from "@/components/dashboard/ForcePasswordChange"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center font-body">
        <div className="text-center px-4">
          <AuthRefresh />
          <p className="text-charcoal-600 text-base mb-2">Connexion en cours…</p>
        </div>
      </div>
    )
  }

  const clinic = await getClinic()
  if (!clinic) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center font-body">
        <div className="text-center px-4">
          <AuthRefresh />
          <p className="text-charcoal-600 text-base mb-2">Aucune clinique associée à ce compte.</p>
          <p className="text-charcoal-400 text-sm">
            Contactez{" "}
            <a href="mailto:support@vocali.ca" className="text-gold-600 underline">
              support@vocali.ca
            </a>
          </p>
        </div>
      </div>
    )
  }

  const mustChangePassword = user.user_metadata?.must_change_password === true

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col lg:flex-row font-body">
      <Sidebar clinic={clinic} />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
      {mustChangePassword && <ForcePasswordChange />}
    </div>
  )
}
