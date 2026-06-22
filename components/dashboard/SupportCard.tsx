import { Mail } from "lucide-react"
import SupportContact from "@/components/dashboard/SupportContact"

export default function SupportCard() {
  return (
    <section className="bg-gold-50 rounded-xl border border-gold-200 p-5">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-gold-100 border border-gold-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Mail size={13} className="text-gold-600" />
        </div>
        <p className="text-charcoal-600 text-sm font-body leading-relaxed">
          Une question ou une modification à demander ?{" "}
          <SupportContact>Cliquez ici</SupportContact>{" "}
          pour nous écrire — on vous répond par courriel.
        </p>
      </div>
    </section>
  )
}
