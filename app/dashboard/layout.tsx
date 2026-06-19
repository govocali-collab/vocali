import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getClinic } from "@/lib/supabase/dashboard"
import Sidebar from "@/components/dashboard/Sidebar"
import AuthRefresh from "@/components/dashboard/AuthRefresh"

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

  return (
    <div className="vk-dash min-h-screen bg-ivory-100 flex flex-col lg:flex-row font-body">
      <style>{DARK_SKIN}</style>
      <Sidebar clinic={clinic} />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  )
}

// Peau sombre « vocali2 » appliquée à tout le dashboard (scopée à .vk-dash).
const DARK_SKIN = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
.vk-dash { background:#161221 !important; color:#FAFAFB; font-family:'Inter',-apple-system,sans-serif; }
.vk-dash .font-display, .vk-dash .font-serif { font-family:'Space Grotesk','Inter',sans-serif !important; letter-spacing:-0.02em; }
.vk-dash .bg-white { background:linear-gradient(180deg,#1E1830 0%,#191325 100%) !important; }
.vk-dash .bg-ivory-50 { background:#211B33 !important; }
.vk-dash .bg-ivory-100 { background:#161221 !important; }
.vk-dash .bg-ivory-200 { background:#1B1629 !important; }
.vk-dash .bg-ivory-300 { background:#241D38 !important; }
.vk-dash .text-charcoal-900 { color:#FAFAFB !important; }
.vk-dash .text-charcoal-800 { color:#F0F0F2 !important; }
.vk-dash .text-charcoal-700 { color:#E2E2E6 !important; }
.vk-dash .text-charcoal-600 { color:#C7C7CD !important; }
.vk-dash .text-charcoal-500 { color:#A5A3AD !important; }
.vk-dash .text-charcoal-400 { color:#8F8D99 !important; }
.vk-dash .text-charcoal-300 { color:#6F6C7E !important; }
.vk-dash .border-ivory-100, .vk-dash .border-ivory-200, .vk-dash .border-ivory-300, .vk-dash .border-ivory-400 { border-color:rgba(255,255,255,0.09) !important; }
.vk-dash .text-gold-500, .vk-dash .text-gold-600, .vk-dash .text-gold-700 { color:#A78BFA !important; }
.vk-dash .bg-gold-50, .vk-dash .bg-gold-100 { background:rgba(139,92,246,0.14) !important; }
.vk-dash .border-gold-200, .vk-dash .border-gold-300 { border-color:rgba(139,92,246,0.35) !important; }
.vk-dash .border-gold-500 { border-color:#8B5CF6 !important; }
.vk-dash .bg-gold-gradient { background:linear-gradient(135deg,#6B21A8 0%,#8B5CF6 100%) !important; }
.vk-dash input, .vk-dash textarea, .vk-dash select { background:#211B33 !important; border-color:rgba(255,255,255,0.10) !important; color:#FAFAFB !important; }
.vk-dash input::placeholder, .vk-dash textarea::placeholder { color:#6F6C7E !important; }
.vk-dash input:focus, .vk-dash textarea:focus, .vk-dash select:focus { border-color:#8B5CF6 !important; }
.vk-dash .hover\\:bg-ivory-200:hover, .vk-dash .hover\\:bg-ivory-100:hover { background:#221C34 !important; }
.vk-dash .shadow-card, .vk-dash .shadow-luxury { box-shadow:0 8px 24px -12px rgba(0,0,0,0.6) !important; }
`

