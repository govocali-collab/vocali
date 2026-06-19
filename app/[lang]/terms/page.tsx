import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { getDictionary } from "@/lib/i18n"
import Link from "next/link"

interface Props {
  params: Promise<{ lang: string }>
}

const content = {
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : 7 juin 2025",
    intro: "Les présentes conditions d'utilisation régissent l'accès et l'utilisation des services offerts par Vocali (« nous », « notre »). En utilisant nos services, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.",
    sections: [
      {
        title: "1. Description du service",
        body: "Vocali fournit un service de réceptionniste IA pour les cliniques esthétiques et médico-esthétiques au Québec. Le service comprend la réponse automatisée aux appels téléphoniques, la qualification des demandes des clients, la capture de leads et un tableau de bord de gestion accessible aux cliniques abonnées."
      },
      {
        title: "2. Admissibilité",
        body: "Le service Vocali est destiné exclusivement aux entreprises légalement constituées opérant au Canada. En vous inscrivant, vous déclarez être autorisé à lier votre entreprise par contrat et avoir au moins 18 ans."
      },
      {
        title: "3. Inscription et compte",
        body: "Pour accéder au service, vous devez créer un compte avec des informations exactes et complètes. Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte. Veuillez nous notifier immédiatement de toute utilisation non autorisée à contact@vocali.ca."
      },
      {
        title: "4. Abonnement et facturation",
        body: "Le service est offert sur abonnement mensuel ou annuel selon les tarifs en vigueur. Le paiement est traité via Stripe. L'abonnement se renouvelle automatiquement à moins d'être annulé avant la date de renouvellement. Aucun remboursement n'est accordé pour les périodes partielles, sauf si requis par la loi applicable."
      },
      {
        title: "5. Utilisation acceptable",
        body: `Vous vous engagez à utiliser le service uniquement à des fins légales et conformément à ces conditions. Il est interdit de :\n\n• Utiliser le service pour des activités frauduleuses ou illégales.\n• Tenter d'accéder aux systèmes ou données d'autres cliniques.\n• Reproduire, redistribuer ou revendre le service sans autorisation écrite.\n• Utiliser le service d'une manière qui pourrait nuire à l'infrastructure de Vocali.\n• Contourner les mécanismes de sécurité ou d'authentification.`
      },
      {
        title: "6. Enregistrement des appels et consentement",
        body: "En utilisant le service Vocali, vous acceptez que les appels traités par l'agent IA soient enregistrés. Il vous incombe de vous assurer que vos clients sont informés de l'enregistrement conformément aux lois applicables. Vocali informe automatiquement les appelants au début de chaque appel."
      },
      {
        title: "7. Propriété intellectuelle",
        body: "Vocali et ses concédants détiennent tous les droits de propriété intellectuelle relatifs au service, incluant les logiciels, algorithmes, interfaces et contenus. Ces conditions ne vous accordent aucun droit de propriété sur le service, seulement un droit d'accès limité et non exclusif."
      },
      {
        title: "8. Confidentialité des données",
        body: "Notre collecte et utilisation de vos données personnelles sont régies par notre Politique de confidentialité, disponible à vocali.ca/fr/privacy. En utilisant le service, vous consentez à ces pratiques."
      },
      {
        title: "9. Disponibilité du service",
        body: "Nous nous efforçons de maintenir le service disponible 24h/24, 7j/7. Cependant, nous ne garantissons pas une disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mises à jour ou raisons indépendantes de notre volonté. Vocali ne sera pas tenu responsable des pertes résultant d'interruptions de service."
      },
      {
        title: "10. Limitation de responsabilité",
        body: "Dans toute la mesure permise par la loi, Vocali ne sera pas responsable des dommages indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser le service. La responsabilité totale de Vocali envers vous ne dépassera pas le montant payé pour le service au cours des trois (3) derniers mois."
      },
      {
        title: "11. Résiliation",
        body: "Vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord ou en contactant contact@vocali.ca. Vocali se réserve le droit de suspendre ou résilier votre accès en cas de violation de ces conditions, sans remboursement. Les clauses relatives à la propriété intellectuelle, la limitation de responsabilité et le droit applicable survivront à la résiliation."
      },
      {
        title: "12. Modifications des conditions",
        body: "Nous pouvons modifier ces conditions en tout temps. Les modifications entreront en vigueur 30 jours après leur publication sur cette page. Votre utilisation continue du service après cette période constitue votre acceptation des nouvelles conditions."
      },
      {
        title: "13. Droit applicable",
        body: "Ces conditions sont régies par les lois de la province de Québec et les lois fédérales canadiennes applicables. Tout litige sera soumis à la compétence exclusive des tribunaux du Québec."
      },
      {
        title: "14. Contact",
        body: "Pour toute question relative à ces conditions :\n\nVocali\nJonathan Hébert\nCourriel : contact@vocali.ca\nSite : vocali.ca"
      },
    ]
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: June 7, 2025",
    intro: "These Terms of Use govern your access to and use of services provided by Vocali (\"we\", \"our\", \"us\"). By using our services, you agree to be bound by these terms. If you do not agree, please do not use our services.",
    sections: [
      {
        title: "1. Service Description",
        body: "Vocali provides an AI receptionist service for aesthetic and medico-aesthetic clinics in Quebec. The service includes automated phone call answering, client request qualification, lead capture, and a management dashboard accessible to subscribed clinics."
      },
      {
        title: "2. Eligibility",
        body: "The Vocali service is intended exclusively for legally incorporated businesses operating in Canada. By registering, you represent that you are authorized to bind your business by contract and are at least 18 years of age."
      },
      {
        title: "3. Account Registration",
        body: "To access the service, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your login credentials and all activities conducted under your account. Please notify us immediately of any unauthorized use at contact@vocali.ca."
      },
      {
        title: "4. Subscription and Billing",
        body: "The service is offered on a monthly or annual subscription basis at current rates. Payment is processed via Stripe. The subscription renews automatically unless cancelled before the renewal date. No refunds are granted for partial periods, except as required by applicable law."
      },
      {
        title: "5. Acceptable Use",
        body: `You agree to use the service only for lawful purposes and in accordance with these terms. You may not:\n\n• Use the service for fraudulent or illegal activities.\n• Attempt to access the systems or data of other clinics.\n• Reproduce, redistribute, or resell the service without written authorization.\n• Use the service in a way that could harm Vocali's infrastructure.\n• Bypass security or authentication mechanisms.`
      },
      {
        title: "6. Call Recording and Consent",
        body: "By using the Vocali service, you agree that calls handled by the AI agent will be recorded. It is your responsibility to ensure that your clients are informed of the recording in accordance with applicable laws. Vocali automatically notifies callers at the beginning of each call."
      },
      {
        title: "7. Intellectual Property",
        body: "Vocali and its licensors own all intellectual property rights relating to the service, including software, algorithms, interfaces, and content. These terms grant you no ownership rights in the service, only a limited, non-exclusive right of access."
      },
      {
        title: "8. Data Privacy",
        body: "Our collection and use of your personal information is governed by our Privacy Policy, available at vocali.ca/en/privacy. By using the service, you consent to these practices."
      },
      {
        title: "9. Service Availability",
        body: "We strive to keep the service available 24/7. However, we do not guarantee uninterrupted availability. Interruptions may occur for maintenance, updates, or reasons beyond our control. Vocali will not be held liable for losses resulting from service interruptions."
      },
      {
        title: "10. Limitation of Liability",
        body: "To the fullest extent permitted by law, Vocali will not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the service. Vocali's total liability to you will not exceed the amount paid for the service during the last three (3) months."
      },
      {
        title: "11. Termination",
        body: "You may cancel your subscription at any time from your dashboard or by contacting contact@vocali.ca. Vocali reserves the right to suspend or terminate your access for violation of these terms, without refund. Clauses relating to intellectual property, limitation of liability, and governing law will survive termination."
      },
      {
        title: "12. Changes to Terms",
        body: "We may modify these terms at any time. Changes will take effect 30 days after publication on this page. Your continued use of the service after that period constitutes your acceptance of the new terms."
      },
      {
        title: "13. Governing Law",
        body: "These terms are governed by the laws of the Province of Quebec and applicable federal Canadian laws. Any dispute shall be subject to the exclusive jurisdiction of the courts of Quebec."
      },
      {
        title: "14. Contact",
        body: "For any questions regarding these terms:\n\nVocali\nJonathan Hébert\nEmail: contact@vocali.ca\nWebsite: vocali.ca"
      },
    ]
  }
}

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <br key={i} />
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} className={line.startsWith("•") ? "pl-4" : ""}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-charcoal-800">{part}</strong> : part
        )}
      </p>
    )
  })
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params
  const dict = getDictionary(lang)
  const c = lang === "en" ? content.en : content.fr

  return (
    <>
      <Navbar dict={dict} lang={lang} />
      <main className="min-h-screen bg-ivory-100 font-body pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">

          <div className="mb-10">
            <Link
              href={`/${lang}`}
              className="text-charcoal-400 text-sm hover:text-gold-600 transition-colors"
            >
              ← {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
            </Link>
          </div>

          <div className="mb-12">
            <h1 className="font-serif text-4xl font-bold text-charcoal-900 mb-3">{c.title}</h1>
            <p className="text-charcoal-400 text-sm">{c.updated}</p>
          </div>

          <div className="bg-ink-card rounded-2xl border border-ivory-300 p-8 shadow-card mb-6">
            <p className="text-charcoal-600 leading-relaxed">{c.intro}</p>
          </div>

          <div className="space-y-6">
            {c.sections.map((section) => (
              <div key={section.title} className="bg-ink-card rounded-2xl border border-ivory-300 p-8 shadow-card">
                <h2 className="font-display text-lg font-semibold text-charcoal-900 mb-4 pb-3 border-b border-ivory-200">
                  {section.title}
                </h2>
                <div className="text-charcoal-600 leading-relaxed space-y-1.5 text-sm">
                  {renderBody(section.body)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
