import Image from "next/image"
import Link from "next/link"

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-ivory-100 font-body flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <Image src="/vocali-logo-black.png" alt="Vocali" width={115} height={37} className="mx-auto mb-8" />
        <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-8">
          <p className="text-3xl mb-4">↩</p>
          <h1 className="text-charcoal-900 font-display text-2xl font-semibold mb-2">Paiement annulé</h1>
          <p className="text-charcoal-500 text-base leading-relaxed mb-6">
            Votre paiement n'a pas été complété. Aucun montant n'a été débité.
          </p>
          <p className="text-charcoal-400 text-sm">
            Des questions ?{" "}
            <a href="mailto:support@vocali.ca" className="text-gold-600 hover:text-gold-500 transition-colors">
              support@vocali.ca
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
