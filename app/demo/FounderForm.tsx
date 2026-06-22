"use client"

import { useState } from "react"

const BUSINESS_TYPES = [
  "Salon d'esthétique",
  "École de formation esthétique",
  "Clinique médico-esthétique",
  "Salon de coiffure",
  "Autre",
]
const CALL_VOLUME = ["1 à 10", "11 à 25", "26 à 50", "50+"]
const MISSED_CALLS = ["Oui régulièrement", "Parfois", "Rarement", "Jamais"]
const URGENCY = ["Immédiatement", "Dans le prochain mois", "Je suis simplement curieuse"]

type Status = "idle" | "submitting" | "success" | "error"

const EMPTY = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  businessType: "",
  callVolume: "",
  missedCalls: "",
  challenge: "",
  urgency: "",
}

export default function FounderForm() {
  const [form, setForm] = useState({ ...EMPTY })
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    setError("")
    try {
      const res = await fetch("/api/founder-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("request failed")

      // Suivi de conversion (no-op si Google Analytics n'est pas configuré sur le site).
      if (typeof window !== "undefined") {
        const w = window as unknown as { gtag?: (...args: unknown[]) => void }
        if (typeof w.gtag === "function") {
          w.gtag("event", "generate_lead", {
            event_category: "founder_form",
            event_label: form.company,
          })
        }
      }

      setStatus("success")
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setStatus("error")
      setError("Une erreur est survenue. Réessayez ou écrivez-nous à contact@vocali.ca.")
    }
  }

  return (
    <section className="founder" id="offre-fondatrice">
      <style>{`
        .founder { background: linear-gradient(180deg,#FBF8F3 0%,#F6EEE0 100%); padding: 64px 24px 80px; border-top: 1px solid #ECE3D5; }
        .founder-inner { max-width: 720px; margin: 0 auto; }
        .founder-badge { display: inline-flex; align-items: center; gap: 8px; background: #FFF1E6; border: 1px solid #F0CBA0; color: #B4453C; font-size: 13px; font-weight: 700; padding: 7px 16px; border-radius: 999px; letter-spacing: .02em; }
        .founder-head { text-align: center; margin-bottom: 36px; }
        .founder-head h2 { font-family: 'Playfair Display', serif; font-size: 36px; line-height: 1.15; font-weight: 600; margin: 18px 0 14px; color: #2E2A26; }
        .founder-head p { font-size: 17px; color: #6B6258; max-width: 560px; margin: 0 auto; line-height: 1.6; }
        .founder-card { background: #fff; border: 1px solid #ECE3D5; border-radius: 24px; padding: 36px 32px; box-shadow: 0 24px 70px rgba(201,168,106,0.14); }
        .founder-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .founder-field { margin-bottom: 20px; }
        .founder-field.full { grid-column: 1 / -1; }
        .founder-label { display: block; font-size: 14px; font-weight: 600; color: #3D3730; margin-bottom: 8px; }
        .founder-label .req { color: #B4453C; }
        .founder-input, .founder-select, .founder-textarea {
          width: 100%; box-sizing: border-box; border: 1px solid #E2D6C4; border-radius: 12px;
          padding: 13px 15px; font-size: 15px; font-family: 'Inter', sans-serif; color: #2E2A26;
          background: #FCFAF6; transition: border-color .15s, box-shadow .15s; }
        .founder-input::placeholder, .founder-textarea::placeholder { color: #B3A998; }
        .founder-input:focus, .founder-select:focus, .founder-textarea:focus {
          outline: none; border-color: #C9A86A; box-shadow: 0 0 0 3px rgba(201,168,106,0.15); }
        .founder-textarea { resize: vertical; min-height: 96px; }
        .founder-radios { display: flex; flex-wrap: wrap; gap: 10px; }
        .founder-radio { cursor: pointer; }
        .founder-radio input { position: absolute; opacity: 0; pointer-events: none; }
        .founder-radio span {
          display: inline-block; border: 1px solid #E2D6C4; background: #FCFAF6; color: #5C5448;
          padding: 10px 16px; border-radius: 999px; font-size: 14px; font-weight: 500;
          transition: all .15s; }
        .founder-radio:hover span { border-color: #C9A86A; }
        .founder-radio input:checked + span { background: linear-gradient(135deg,#C9A86A,#B8945A); border-color: transparent; color: #fff; box-shadow: 0 6px 18px rgba(201,168,106,0.35); }
        .founder-submit {
          width: 100%; margin-top: 8px; border: none; cursor: pointer; border-radius: 999px;
          padding: 16px 28px; font-size: 16px; font-weight: 700; font-family: 'Inter', sans-serif;
          color: #fff; background: linear-gradient(135deg,#C9A86A,#B8945A);
          box-shadow: 0 12px 34px rgba(201,168,106,0.4); transition: transform .15s, box-shadow .15s; }
        .founder-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 42px rgba(201,168,106,0.5); }
        .founder-submit:disabled { opacity: .65; cursor: default; }
        .founder-err { margin-top: 14px; text-align: center; font-size: 14px; color: #B4453C; background: rgba(180,69,60,0.08); padding: 10px 14px; border-radius: 10px; }
        .founder-legal { margin-top: 16px; text-align: center; font-size: 12.5px; color: #9A9082; }
        .founder-alt { margin-top: 24px; text-align: center; font-size: 15px; color: #6B6258; }
        .founder-alt a { color: #B8945A; font-weight: 600; text-decoration: none; border-bottom: 1px solid rgba(184,148,90,0.4); transition: color .15s; }
        .founder-alt a:hover { color: #8A6E2F; }
        .founder-success { background: #fff; border: 1px solid #ECE3D5; border-radius: 24px; padding: 56px 32px; text-align: center; box-shadow: 0 24px 70px rgba(201,168,106,0.14); }
        .founder-success .emoji { font-size: 52px; line-height: 1; }
        .founder-success h2 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; margin: 18px 0 10px; color: #2E2A26; }
        .founder-success .lead { font-size: 18px; color: #3D3730; margin: 0 0 18px; font-weight: 600; }
        .founder-success p { font-size: 16px; color: #6B6258; line-height: 1.7; max-width: 520px; margin: 0 auto 14px; }
        .founder-home { display: inline-flex; margin-top: 18px; text-decoration: none; border-radius: 999px; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #fff; background: linear-gradient(135deg,#C9A86A,#B8945A); box-shadow: 0 12px 34px rgba(201,168,106,0.4); transition: transform .15s, box-shadow .15s; }
        .founder-home:hover { transform: translateY(-2px); box-shadow: 0 16px 42px rgba(201,168,106,0.5); }
        @media (max-width: 640px) {
          .founder-row { grid-template-columns: 1fr; }
          .founder-head h2 { font-size: 28px; }
          .founder-card { padding: 28px 20px; }
        }
      `}</style>

      <div className="founder-inner">
        {status === "success" ? (
          <div className="founder-success">
            <div className="emoji">🎉</div>
            <h2>Merci&nbsp;!</h2>
            <p className="lead">Votre demande a bien été reçue.</p>
            <p>
              Nous allons analyser votre demande et communiquer avec vous dans les prochaines 24&nbsp;heures.
            </p>
            <p>
              Comme l&apos;offre fondatrice est limitée aux 10&nbsp;premières entreprises, les demandes sont
              traitées dans l&apos;ordre de réception.
            </p>
            <a href="/" className="founder-home">Retour à l&apos;accueil</a>
          </div>
        ) : (
          <>
            <div className="founder-head">
              <span className="founder-badge">🔥 Offre fondatrice limitée aux 10 premières clientes</span>
              <h2>Réservez votre place fondatrice</h2>
              <p>
                Nous acceptons actuellement seulement 10&nbsp;entreprises pour notre offre fondatrice.
                Remplissez ce court formulaire et nous communiquerons avec vous dans les prochaines 24&nbsp;heures.
              </p>
            </div>

            <form className="founder-card" onSubmit={handleSubmit}>
              <div className="founder-row">
                <div className="founder-field">
                  <label className="founder-label">Prénom et nom <span className="req">*</span></label>
                  <input
                    className="founder-input"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Marie Tremblay"
                  />
                </div>
                <div className="founder-field">
                  <label className="founder-label">Nom de l&apos;entreprise <span className="req">*</span></label>
                  <input
                    className="founder-input"
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="Salon Élégance"
                  />
                </div>
                <div className="founder-field">
                  <label className="founder-label">Courriel <span className="req">*</span></label>
                  <input
                    className="founder-input"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="vous@entreprise.ca"
                  />
                </div>
                <div className="founder-field">
                  <label className="founder-label">Téléphone <span className="req">*</span></label>
                  <input
                    className="founder-input"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(514) 555-1234"
                  />
                </div>
              </div>

              <div className="founder-field">
                <label className="founder-label">Quel type d&apos;entreprise exploitez-vous&nbsp;?</label>
                <select
                  className="founder-select"
                  value={form.businessType}
                  onChange={(e) => set("businessType", e.target.value)}
                >
                  <option value="">Sélectionnez…</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="founder-field">
                <label className="founder-label">En moyenne, combien d&apos;appels recevez-vous par semaine&nbsp;?</label>
                <div className="founder-radios">
                  {CALL_VOLUME.map((o) => (
                    <label key={o} className="founder-radio">
                      <input
                        type="radio"
                        name="callVolume"
                        value={o}
                        checked={form.callVolume === o}
                        onChange={(e) => set("callVolume", e.target.value)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="founder-field">
                <label className="founder-label">Est-ce que vous manquez parfois des appels lorsque vous êtes avec une cliente&nbsp;?</label>
                <div className="founder-radios">
                  {MISSED_CALLS.map((o) => (
                    <label key={o} className="founder-radio">
                      <input
                        type="radio"
                        name="missedCalls"
                        value={o}
                        checked={form.missedCalls === o}
                        onChange={(e) => set("missedCalls", e.target.value)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="founder-field">
                <label className="founder-label">Quel est votre plus grand défi actuellement&nbsp;?</label>
                <textarea
                  className="founder-textarea"
                  value={form.challenge}
                  onChange={(e) => set("challenge", e.target.value)}
                  placeholder="Décrivez en quelques mots…"
                />
              </div>

              <div className="founder-field">
                <label className="founder-label">À quel point souhaitez-vous régler ce problème&nbsp;?</label>
                <div className="founder-radios">
                  {URGENCY.map((o) => (
                    <label key={o} className="founder-radio">
                      <input
                        type="radio"
                        name="urgency"
                        value={o}
                        checked={form.urgency === o}
                        onChange={(e) => set("urgency", e.target.value)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="founder-submit" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Envoi en cours…" : "Envoyer ma demande"}
              </button>

              {status === "error" && <p className="founder-err">{error}</p>}

              <p className="founder-legal">
                Vos informations restent confidentielles et ne servent qu&apos;à vous recontacter.
              </p>
            </form>

            <p className="founder-alt">
              Pas prête à réserver ?{" "}
              <a href="/guide">Téléchargez plutôt le guide complet (tarifs inclus) →</a>
            </p>
          </>
        )}
      </div>
    </section>
  )
}
