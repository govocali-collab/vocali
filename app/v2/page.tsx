import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  Sparkles, ArrowRight, Zap, Clock, Globe, MessageSquare, UserPlus, Calendar, Send,
  PhoneOff, Moon, CalendarX, Users, Check, Building2, ShieldCheck, LayoutDashboard, Rocket,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Vocali — Réceptionniste IA 24/7 pour cliniques esthétiques (aperçu)",
  robots: { index: false, follow: false },
}

const STATS: [string, string][] = [
  ["24/7", "Disponibilité"], ["< 1 s", "Délai de réponse"], ["FR · EN", "Bilingue"], ["100%", "Appels captés"],
]
const PROBLEMS = [
  { icon: PhoneOff, title: "Appels pendant les traitements", desc: "Votre équipe est en cabine. La cliente raccroche et appelle la concurrence." },
  { icon: Moon, title: "Appels après les heures", desc: "Votre bureau est fermé à 21h. La demande arrive, mais personne ne répond." },
  { icon: CalendarX, title: "Rendez-vous sans suite", desc: "Des demandes restent sans réponse. Les plages horaires demeurent vides." },
  { icon: Users, title: "Personnel surchargé", desc: "Votre équipe jongle entre les clientes présentes et celles au téléphone." },
]
const FEATURES = [
  { icon: Zap, title: "Répond instantanément", desc: "Aucune attente, aucun message laissé sans réponse. La première sonnerie suffit." },
  { icon: Clock, title: "Disponible 24/7", desc: "Jour, nuit, fins de semaine et jours fériés — votre clinique est toujours ouverte." },
  { icon: Globe, title: "Bilingue français et anglais", desc: "S'adapte automatiquement à la langue préférée de la personne qui appelle." },
  { icon: MessageSquare, title: "Répond aux questions fréquentes", desc: "Services, prix, disponibilités — elle connaît votre clinique sur le bout des doigts." },
  { icon: UserPlus, title: "Capture les coordonnées", desc: "Nom, numéro, raison de l'appel — chaque information est notée avec précision." },
  { icon: Calendar, title: "Aide à réserver un rendez-vous", desc: "Dirige les clientes vers la prise de rendez-vous selon vos disponibilités." },
  { icon: Send, title: "Confirmation par texto", desc: "Un message de suivi automatique est envoyé après chaque appel pris en charge." },
]
const STEPS: [string, string, string][] = [
  ["01", "Une cliente appelle", "Votre numéro habituel, votre identité. Notre réceptionniste répond en votre nom, avec votre ton et vos informations de clinique."],
  ["02", "L'IA prend en charge", "Elle répond aux questions, note toute l'information pertinente et guide la cliente vers la prochaine étape selon vos paramètres."],
  ["03", "Votre équipe reçoit tout", "Un résumé complet de chaque appel est transmis à votre équipe en temps réel, prête à donner suite rapidement."],
]
const BENEFITS = [
  ["Zéro appel manqué", "Fini les occasions perdues. Chaque cliente est accueillie, peu importe l'heure."],
  ["Plus de rendez-vous confirmés", "Chaque appel devient une opportunité concrète de remplir votre agenda."],
  ["Disponibilité 24/7", "Votre clinique ne ferme plus jamais pour les nouvelles demandes entrantes."],
  ["Aucune mise en attente", "Vos clientes sont prises en charge immédiatement — sans musique d'attente, sans frustration."],
  ["Expérience client soignée", "Un accueil professionnel et chaleureux à chaque interaction, sans exception."],
  ["Équipe soulagée", "Libérez votre personnel pour ce qui compte vraiment : vos clientes présentes."],
]
const FRANCHISE = [
  { icon: Building2, title: "Standardisation complète", desc: "Le même niveau de service dans chaque succursale, chaque jour, sans variation." },
  { icon: ShieldCheck, title: "Image de marque protégée", desc: "Votre ton, vos valeurs, votre image — uniformes dans toutes vos cliniques." },
  { icon: LayoutDashboard, title: "Gestion centralisée", desc: "Supervisez toutes vos succursales depuis un seul tableau de bord simplifié." },
  { icon: Rocket, title: "Déploiement en 48 heures", desc: "Opérationnel rapidement, sans infrastructure complexe à mettre en place." },
]
const FAQ = [
  ["Est-ce que l'IA remplace ma réceptionniste?", "Non. Notre réceptionniste IA est un outil complémentaire qui prend en charge les appels quand votre équipe est indisponible — en traitement, le soir, la fin de semaine. Elle libère votre personnel pour se concentrer sur l'expérience en clinique, là où votre touche humaine est irremplaçable."],
  ["Peut-elle répondre en français?", "Absolument. Le français est la langue par défaut. Elle s'adapte automatiquement à l'anglais selon la préférence de la personne qui appelle, ce qui est particulièrement utile pour les cliniques dans les régions bilingues."],
  ["Comment les rendez-vous sont-ils gérés?", "L'IA peut informer les clientes sur vos disponibilités, capturer leurs coordonnées et les guider vers la réservation. Une intégration avec votre logiciel de gestion de clinique est également possible selon votre configuration."],
  ["Combien de temps prend l'installation?", "La mise en place prend généralement moins de 48 heures. Notre équipe configure tout en fonction de vos services, vos horaires et votre ton de communication — sans que vous ayez à vous occuper de la technique."],
  ["Puis-je conserver mon numéro de téléphone actuel?", "Oui. Votre numéro existant est conservé. Nous configurons simplement le renvoi d'appels pour que notre réceptionniste prenne le relais quand vous êtes indisponible. Rien ne change pour vos clientes."],
]

export default function V2Landing() {
  const year = new Date().getFullYear()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        .v2 { --bg:#161221; --fg:#FAFAFB; --card:#1E1830; --primary:#6B21A8; --secondary:#8B5CF6; --muted:#A5A3AD; --bd:rgba(255,255,255,0.08);
          background:var(--bg); color:var(--fg); min-height:100vh; font-family:'Inter',-apple-system,sans-serif; }
        .v2 h1,.v2 h2,.v2 h3,.v2 .disp { font-family:'Space Grotesk','Inter',sans-serif; letter-spacing:-0.02em; }
        .v2-muted { color:var(--muted); }
        .v2-grad { background:linear-gradient(135deg,#A78BFA 0%,#8B5CF6 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .v2-gradbg { background:linear-gradient(135deg,#6B21A8 0%,#8B5CF6 100%); }
        .v2-glow { box-shadow:0 20px 60px -20px rgba(139,92,246,0.55); }
        .v2-card { background:linear-gradient(180deg,#1E1830 0%,#171124 100%); }
        .v2-alt { background:linear-gradient(180deg,#1B1629 0%,#191426 100%); }
        .v2-blur { position:absolute; top:-120px; left:50%; transform:translateX(-50%); width:800px; height:800px; max-width:100vw; border-radius:9999px; background:rgba(139,92,246,0.20); filter:blur(160px); }
        .v2-bd { border-color:var(--bd); }
        .v2-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; height:48px; padding:0 28px; border-radius:12px; font-weight:600; font-size:15px; text-decoration:none; cursor:pointer; transition:transform .15s, box-shadow .15s, background .15s; border:1px solid transparent; }
        .v2-btn:hover { transform:translateY(-1px); }
        .v2-btn-outline { background:transparent; color:var(--fg); border-color:var(--bd); }
        .v2-btn-outline:hover { background:rgba(255,255,255,0.04); }
        .v2-btn-sm { height:38px; padding:0 16px; font-size:14px; border-radius:10px; }
        .v2-nav { position:sticky; top:0; z-index:40; backdrop-filter:blur(16px); background:rgba(22,18,33,0.7); border-bottom:1px solid var(--bd); }
        .v2-badge { display:inline-flex; align-items:center; gap:8px; padding:5px 14px; border-radius:9999px; border:1px solid var(--bd); background:rgba(30,24,48,0.5); font-size:12px; color:var(--muted); }
        .v2-link { color:var(--muted); text-decoration:none; transition:color .15s; }
        .v2-link:hover { color:var(--fg); }
        .v2-ico { width:40px; height:40px; border-radius:10px; background:rgba(107,33,168,0.18); display:grid; place-items:center; flex-shrink:0; }
        .v2-feat { transition:border-color .15s; }
        .v2-feat:hover { border-color:rgba(139,92,246,0.4); }
        .v2-faq { border-bottom:1px solid var(--bd); }
        .v2-faq summary { cursor:pointer; list-style:none; padding:20px 0; font-weight:600; display:flex; justify-content:space-between; gap:16px; }
        .v2-faq summary::-webkit-details-marker { display:none; }
        .v2-faq summary::after { content:"+"; color:var(--secondary); font-size:22px; line-height:1; }
        .v2-faq[open] summary::after { content:"–"; }
      `}</style>

      <div className="v2">
        <header className="v2-nav">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/v2" className="flex items-center gap-2">
              <Image src="/vocali-logo-white.png" alt="Vocali" width={104} height={32} className="h-7 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="#solution" className="v2-link">Solution</a>
              <a href="#how" className="v2-link">Fonctionnement</a>
              <a href="#franchises" className="v2-link">Franchises</a>
              <a href="#faq" className="v2-link">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="v2-link text-sm px-3 hidden sm:inline">Se connecter</Link>
              <Link href="/demo" className="v2-btn v2-gradbg v2-btn-sm v2-glow" style={{ color: "#fff" }}>Réserver une démo</Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10"><div className="v2-blur" /></div>
          <div className="max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
            <div className="v2-badge mb-8"><Sparkles className="size-3" style={{ color: "#8B5CF6" }} />Programme pilote au Québec · Places limitées</div>
            <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] max-w-4xl mx-auto">Ne manquez plus jamais <span className="v2-grad">un appel client</span>.</h1>
            <p className="mt-6 text-lg v2-muted max-w-2xl mx-auto">Une réceptionniste IA disponible 24/7 pour répondre aux appels, qualifier les demandes et aider à remplir votre agenda.</p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link href="/demo" className="v2-btn v2-gradbg v2-glow" style={{ color: "#fff" }}>Demander une démonstration <ArrowRight className="size-4" /></Link>
              <a href="#how" className="v2-btn v2-btn-outline">Comment ça marche</a>
            </div>
            <p className="mt-6 text-sm v2-muted">Pour les cliniques esthétiques et médico-esthétiques.</p>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto">
              {STATS.map(([k, v]) => (<div key={v}><div className="disp text-3xl v2-grad font-semibold">{k}</div><div className="text-xs v2-muted mt-1">{v}</div></div>))}
            </div>
          </div>
        </section>

        {/* PROBLÈME */}
        <Section title="Combien vous coûte chaque appel manqué?" sub="Chaque fois que votre équipe est occupée, un appel sonne dans le vide — et une cliente potentielle s'en va.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROBLEMS.map(({ icon: Icon, title, desc }) => (<Card key={title}><div className="v2-ico mb-4"><Icon className="size-5" style={{ color: "#8B5CF6" }} /></div><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm v2-muted leading-relaxed">{desc}</p></Card>))}
          </div>
        </Section>

        {/* SOLUTION */}
        <Section id="solution" title="Une réceptionniste qui répond à chaque appel." sub="Toujours disponible. Toujours professionnelle. Toujours à votre image." alt>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (<Card key={title}><div className="v2-ico mb-4"><Icon className="size-5" style={{ color: "#8B5CF6" }} /></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm v2-muted leading-relaxed">{desc}</p></Card>))}
          </div>
        </Section>

        {/* HOW */}
        <Section id="how" title="Comment ça fonctionne" sub="Simple pour vos clientes. Puissant pour votre entreprise.">
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(([n, t, d]) => (<div key={n} className="relative p-8 rounded-2xl border v2-bd v2-card"><div className="disp text-sm font-semibold" style={{ color: "#8B5CF6" }}>{n}</div><div className="mt-4 text-xl font-semibold disp">{t}</div><p className="mt-2 text-sm v2-muted leading-relaxed">{d}</p></div>))}
          </div>
        </Section>

        {/* BÉNÉFICES */}
        <Section title="Des résultats concrets pour votre clinique" sub="Chaque fonctionnalité est pensée pour avoir un impact direct sur vos revenus et votre expérience client." alt>
          <div className="grid md:grid-cols-3 gap-4">
            {BENEFITS.map(([t, d]) => (<Card key={t}><div className="v2-ico mb-4"><Check className="size-5" style={{ color: "#8B5CF6" }} /></div><h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 text-sm v2-muted leading-relaxed">{d}</p></Card>))}
          </div>
        </Section>

        {/* MULTI-SUCCURSALES */}
        <Section id="franchises" title="Conçu pour les entreprises multi-succursales." sub="Déployez une expérience client uniforme dans chaque point de vente, sans surcharge opérationnelle.">
          <div className="grid sm:grid-cols-2 gap-4">
            {FRANCHISE.map(({ icon: Icon, title, desc }) => (<Card key={title}><div className="flex gap-4"><div className="v2-ico"><Icon className="size-5" style={{ color: "#8B5CF6" }} /></div><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-1 text-sm v2-muted leading-relaxed">{desc}</p></div></div></Card>))}
          </div>
          <div className="text-center mt-8"><Link href="/demo" className="v2-btn v2-btn-outline">Parler à notre équipe</Link></div>
        </Section>

        {/* PROGRAMME PILOTE */}
        <Section title="Programme pilote au Québec" sub="Actuellement en déploiement auprès de cliniques esthétiques et médico-esthétiques." alt>
          <div className="max-w-3xl mx-auto v2-card rounded-2xl p-10 border v2-bd text-center">
            <p className="v2-muted leading-relaxed">« Les témoignages de nos partenaires pilotes arrivent bientôt. Rejoignez le programme pour être parmi les premiers. »</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link href="/demo" className="v2-btn v2-gradbg v2-glow" style={{ color: "#fff" }}>Rejoindre le programme pilote <ArrowRight className="size-4" /></Link>
              <span className="text-xs v2-muted">Places limitées disponibles</span>
            </div>
          </div>
        </Section>

        {/* FONDATEUR */}
        <Section title="">
          <div className="max-w-4xl mx-auto v2-card rounded-3xl p-10 md:p-14 border v2-bd flex flex-col md:flex-row items-center gap-10">
            <Image src="/photo-moi.png" alt="Jonathan, fondateur de Vocali" width={200} height={200} className="rounded-2xl w-40 h-40 object-cover flex-shrink-0" />
            <div>
              <div className="v2-badge mb-4"><Sparkles className="size-3" style={{ color: "#8B5CF6" }} />Le fondateur</div>
              <h2 className="text-3xl font-semibold">Bâti par quelqu'un qui comprend votre réalité.</h2>
              <p className="mt-4 v2-muted leading-relaxed">Je m'appelle Jonathan. J'ai développé Vocali après avoir constaté que les cliniques esthétiques et médico-esthétiques au Québec perdaient des clientes non pas par manque de qualité, mais par manque de disponibilité. Sarah, c'est la réceptionniste que j'aurais voulu leur donner dès le premier jour.</p>
              <p className="mt-5 font-semibold disp">Jonathan <span className="v2-muted font-normal">· Fondateur, Vocali</span></p>
              <p className="mt-1 text-sm v2-muted">Fait avec soin au Québec 🍁</p>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" title="Tout ce que vous voulez savoir" alt>
          <div className="max-w-3xl mx-auto">
            {FAQ.map(([q, a]) => (
              <details key={q} className="v2-faq">
                <summary className="disp">{q}</summary>
                <p className="pb-5 text-sm v2-muted leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* CTA FINAL */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="rounded-3xl p-12 md:p-16 text-center v2-gradbg v2-glow">
            <h2 className="text-4xl md:text-5xl font-semibold" style={{ color: "#fff" }}>Découvrez ce qu'une réceptionniste IA peut faire pour votre entreprise.</h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>Rejoignez les cliniques québécoises qui ne manquent plus jamais un appel.</p>
            <Link href="/demo" className="v2-btn mt-8" style={{ background: "#161221", color: "#fff" }}>Réserver une démonstration <ArrowRight className="size-4" /></Link>
            <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Aucun engagement requis · Réponse dans les 24 heures</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t v2-bd">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <Image src="/vocali-logo-white.png" alt="Vocali" width={90} height={28} className="h-6 w-auto mx-auto md:mx-0 mb-2" />
              <p className="text-sm v2-muted">La réceptionniste que votre clinique mérite.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="v2-link">Confidentialité</a>
              <a href="#" className="v2-link">Conditions</a>
              <a href="#" className="v2-link">Nous joindre</a>
            </div>
          </div>
          <div className="border-t v2-bd py-6 text-center text-xs v2-muted">© {year} Vocali. Tous droits réservés. · Fait avec soin au Québec</div>
        </footer>
      </div>
    </>
  )
}

function Section({ id, title, sub, alt, children }: { id?: string; title: string; sub?: string; alt?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={`border-t v2-bd ${alt ? "v2-alt" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold">{title}</h2>
            {sub && <p className="mt-4 v2-muted max-w-xl mx-auto">{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="v2-card v2-feat rounded-2xl p-6 border v2-bd">{children}</div>
}
