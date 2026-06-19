import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { getDictionary } from "@/lib/i18n"
import Link from "next/link"

interface Props {
  params: Promise<{ lang: string }>
}

const content = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 7 juin 2025",
    intro: "Chez Vocali, nous prenons la protection de vos renseignements personnels au sérieux. La présente politique explique comment nous collectons, utilisons et protégeons vos données, conformément à la Loi 25 (Loi modernisant des dispositions législatives en matière de protection des renseignements personnels) et aux lois canadiennes applicables.",
    sections: [
      {
        title: "1. Qui nous sommes",
        body: "Vocali est une entreprise québécoise qui fournit un service de réceptionniste IA aux cliniques esthétiques et médico-esthétiques. Le responsable de la protection des renseignements personnels est Jonathan Hébert, joignable à contact@vocali.ca."
      },
      {
        title: "2. Renseignements collectés",
        body: `Nous collectons les renseignements suivants :\n\n• **Clients des cliniques** : nom, prénom, numéro de téléphone, service demandé, langue de communication et enregistrement audio de l'appel.\n• **Propriétaires de cliniques** : nom, prénom, adresse courriel, numéro de téléphone, nom de la clinique et informations de facturation.\n• **Données techniques** : durée des appels, horodatage, langue détectée.`
      },
      {
        title: "3. Utilisation des renseignements",
        body: `Vos renseignements sont utilisés pour :\n\n• Fournir le service de réceptionniste IA (répondre aux appels, qualifier les demandes).\n• Transmettre les informations de contact aux cliniques clientes.\n• Améliorer la qualité et la précision du service.\n• Traiter les paiements et gérer les abonnements.\n• Respecter nos obligations légales.`
      },
      {
        title: "4. Enregistrements d'appels",
        body: "Les appels traités par l'agent IA peuvent être enregistrés à des fins de qualité et de transcription. Les enregistrements sont accessibles uniquement par la clinique concernée et par Vocali. Les appelants sont informés de l'enregistrement au début de l'appel."
      },
      {
        title: "5. Sous-traitants et tiers",
        body: `Nous faisons appel aux sous-traitants suivants, qui traitent des données en notre nom :\n\n• **Twilio Inc.** — Télécommunications et enregistrement d'appels (États-Unis)\n• **Supabase Inc.** — Stockage sécurisé des données (États-Unis)\n• **Resend Inc.** — Envoi de courriels transactionnels (États-Unis)\n• **Stripe Inc.** — Traitement des paiements (États-Unis)\n\nCes fournisseurs sont liés par des ententes de confidentialité et ne peuvent utiliser vos données qu'aux fins prévues.`
      },
      {
        title: "6. Conservation des données",
        body: "Les données des appels et des leads sont conservées pendant 24 mois suivant la dernière interaction, puis supprimées. Les données de facturation sont conservées conformément aux exigences fiscales applicables (7 ans)."
      },
      {
        title: "7. Vos droits",
        body: `En vertu de la Loi 25, vous avez le droit de :\n\n• Accéder à vos renseignements personnels.\n• Demander la correction de renseignements inexacts.\n• Demander la suppression de vos données (sous réserve des obligations légales).\n• Retirer votre consentement en tout temps.\n• Déposer une plainte auprès de la Commission d'accès à l'information du Québec.\n\nPour exercer ces droits, contactez-nous à contact@vocali.ca.`
      },
      {
        title: "8. Sécurité",
        body: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos renseignements contre tout accès non autorisé, perte ou divulgation, incluant le chiffrement des données en transit et au repos."
      },
      {
        title: "9. Transferts hors Québec",
        body: "Certains de nos sous-traitants sont établis aux États-Unis. Avant tout transfert, nous effectuons une évaluation des facteurs relatifs à la vie privée (EFVP) pour nous assurer d'un niveau de protection adéquat."
      },
      {
        title: "10. Modifications",
        body: "Nous pouvons modifier cette politique en tout temps. La version mise à jour sera publiée sur cette page avec la date de révision. Pour les modifications importantes, nous vous en informerons par courriel."
      },
      {
        title: "11. Contact",
        body: "Pour toute question relative à cette politique ou à vos renseignements personnels :\n\nVocali\nResponsable : Jonathan Hébert\nCourriel : contact@vocali.ca\nSite : vocali.ca"
      },
    ]
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: June 7, 2025",
    intro: "At Vocali, we take the protection of your personal information seriously. This policy explains how we collect, use, and protect your data, in compliance with Quebec's Law 25 (Act to modernize legislative provisions as regards the protection of personal information) and applicable Canadian laws.",
    sections: [
      {
        title: "1. Who We Are",
        body: "Vocali is a Quebec-based company providing AI receptionist services to aesthetic and medico-aesthetic clinics. The person responsible for the protection of personal information is Jonathan Hébert, reachable at contact@vocali.ca."
      },
      {
        title: "2. Information We Collect",
        body: `We collect the following information:\n\n• **Clinic clients**: first name, last name, phone number, requested service, language, and audio recording of the call.\n• **Clinic owners**: first name, last name, email address, phone number, clinic name, and billing information.\n• **Technical data**: call duration, timestamps, detected language.`
      },
      {
        title: "3. How We Use Your Information",
        body: `Your information is used to:\n\n• Provide the AI receptionist service (answering calls, qualifying requests).\n• Forward contact details to the relevant clinic.\n• Improve the quality and accuracy of the service.\n• Process payments and manage subscriptions.\n• Comply with our legal obligations.`
      },
      {
        title: "4. Call Recordings",
        body: "Calls handled by the AI agent may be recorded for quality and transcription purposes. Recordings are accessible only by the relevant clinic and by Vocali. Callers are informed of the recording at the beginning of the call."
      },
      {
        title: "5. Sub-processors and Third Parties",
        body: `We use the following sub-processors who handle data on our behalf:\n\n• **Twilio Inc.** — Telecommunications and call recording (United States)\n• **Supabase Inc.** — Secure data storage (United States)\n• **Resend Inc.** — Transactional email delivery (United States)\n• **Stripe Inc.** — Payment processing (United States)\n\nThese providers are bound by confidentiality agreements and may only use your data for the intended purposes.`
      },
      {
        title: "6. Data Retention",
        body: "Call and lead data is retained for 24 months following the last interaction, then deleted. Billing data is retained in accordance with applicable tax requirements (7 years)."
      },
      {
        title: "7. Your Rights",
        body: `Under Quebec's Law 25, you have the right to:\n\n• Access your personal information.\n• Request correction of inaccurate information.\n• Request deletion of your data (subject to legal obligations).\n• Withdraw your consent at any time.\n• File a complaint with the Commission d'accès à l'information du Québec.\n\nTo exercise these rights, contact us at contact@vocali.ca.`
      },
      {
        title: "8. Security",
        body: "We implement appropriate technical and organizational measures to protect your information against unauthorized access, loss, or disclosure, including encryption of data in transit and at rest."
      },
      {
        title: "9. Cross-Border Transfers",
        body: "Some of our sub-processors are located in the United States. Before any transfer, we conduct a Privacy Impact Assessment (PIA) to ensure an adequate level of protection."
      },
      {
        title: "10. Changes to This Policy",
        body: "We may update this policy at any time. The updated version will be published on this page with the revision date. For significant changes, we will notify you by email."
      },
      {
        title: "11. Contact",
        body: "For any questions regarding this policy or your personal information:\n\nVocali\nResponsible person: Jonathan Hébert\nEmail: contact@vocali.ca\nWebsite: vocali.ca"
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

export default async function PrivacyPage({ params }: Props) {
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
