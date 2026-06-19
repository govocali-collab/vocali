import Image from "next/image"
import { CheckCircle } from "lucide-react"

interface Props {
  searchParams: Promise<{ agent?: string; clinic?: string }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams
  const agentName = params.agent ?? "Sarah"
  const clinicName = params.clinic ?? "votre clinique"

  return (
    <div className="min-h-screen bg-ivory-100 font-body flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <Image src="/vocali-logo-black.png" alt="Vocali" width={115} height={37} className="mx-auto mb-8" />

        <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-8 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle size={28} className="text-green-500" />
            </div>
          </div>

          <h1 className="text-charcoal-900 font-display text-2xl font-semibold mb-2">
            Merci, {clinicName} !
          </h1>
          <p className="text-charcoal-500 text-base leading-relaxed">
            <span className="text-gold-700 font-semibold">{agentName}</span> sera configurée
            et prête à répondre à vos appels dans les <strong>24–48h</strong>.
          </p>
        </div>

        <div className="bg-gold-50 rounded-xl border border-gold-200 p-5 text-left space-y-3 mb-6">
          <p className="text-charcoal-700 text-sm font-body font-semibold">Prochaines étapes</p>
          {[
            "Vous recevrez un courriel avec vos accès au tableau de bord d'ici quelques minutes.",
            "Nous vous contacterons pour planifier votre appel d'embarquement.",
            `Lors de cet appel, nous activerons ${agentName} ensemble.`,
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-gold-200 text-gold-800 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-charcoal-600 text-sm font-body leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <p className="text-charcoal-400 text-xs">
          Une question ?{" "}
          <a href="mailto:support@vocali.ca" className="text-gold-600 hover:text-gold-500 transition-colors">
            support@vocali.ca
          </a>
        </p>
      </div>
    </div>
  )
}
