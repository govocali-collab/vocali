import { Resend } from "resend"
import { mailTo } from "./recipient"

const resend = new Resend(process.env.RESEND_API_KEY)

// Le PDF doit être déposé dans public/ sous ce nom.
const PDF_URL = "https://vocali.ca/vocali-dossier.pdf"

/** Envoie le guide (lien PDF) au visiteur qui a rempli le formulaire. */
export async function sendGuideToVisitor(email: string, firstName?: string | null) {
  const year = new Date().getFullYear()
  const hello = firstName ? `Bonjour ${firstName},` : "Bonjour,"
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    // EXCEPTION : le guide va TOUJOURS au vrai courriel du prospect (pas de
    // redirection vers la boîte de test), sinon il ne le recevrait jamais.
    to: email,
    subject: "Votre guide Vocali (tarifs inclus) 📄",
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 0;"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr><td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
      <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;" />
    </td></tr>
    <tr><td style="background:#FFFFFF;padding:40px 48px;">
      <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1C1C1E;">${hello}</p>
      <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#4C4C50;">
        Merci de votre intérêt pour Vocali. Voici votre guide complet : il présente le Système Vocali 24/7, son fonctionnement et tous les tarifs.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td align="center">
        <a href="${PDF_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">
          Télécharger le guide (PDF) →
        </a>
      </td></tr></table>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#6C6C70;">
        Une question ? Répondez simplement à ce courriel, je vous réponds personnellement.
      </p>
    </td></tr>
    <tr><td style="background:#FFFFFF;padding:0 48px 36px;border-radius:0 0 12px 12px;">
      <table cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #EDE3D4;padding-top:24px;">
        <p style="margin:0 0 2px;font-size:15px;font-weight:600;color:#1C1C1E;">Jonathan Hébert</p>
        <p style="margin:0;font-size:14px;color:#6C6C70;">Fondateur, Vocali</p>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:20px 48px;text-align:center;"><p style="margin:0;font-size:12px;color:#B0B0B3;">© ${year} Vocali</p></td></tr>
  </table>
</td></tr></table>
</body></html>`.trim(),
  })
}

interface GuideLeadParams {
  fullName?: string | null
  email: string
  phone: string
  prospectId?: string | null
}

/** Notification interne : quelqu'un a téléchargé le guide. */
export async function sendGuideLeadNotification(p: GuideLeadParams) {
  const year = new Date().getFullYear()
  const row = (label: string, value?: string | null) =>
    value ? `<tr><td style="padding:7px 16px 7px 0;font-size:13px;color:#8A8A8E;white-space:nowrap;">${label}</td><td style="padding:7px 0;font-size:14px;color:#2A2A2E;font-weight:600;">${value}</td></tr>` : ""
  const cta = p.prospectId
    ? `<a href="https://vocali.ca/admin/crm/${p.prospectId}" style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 100%);color:#FEFDFB;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">Voir dans le CRM</a>`
    : ""
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: mailTo("contact@vocali.ca"),
    subject: "Nouveau téléchargement du guide",
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 0;"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:12px;border:1px solid #EDE3D4;">
    <tr><td style="padding:32px 48px 8px;">
      <p style="margin:0 0 4px;font-size:13px;color:#A88840;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📄 Guide téléchargé</p>
      <h1 style="margin:0;font-size:22px;color:#2A2A2E;">${p.fullName || p.email}</h1>
    </td></tr>
    <tr><td style="padding:16px 48px;"><table width="100%" cellpadding="0" cellspacing="0">
      ${row("Nom", p.fullName)}
      ${row("Courriel", p.email)}
      ${row("Téléphone", p.phone)}
    </table></td></tr>
    ${cta ? `<tr><td style="padding:8px 48px 28px;">${cta}</td></tr>` : ""}
    <tr><td style="background:#FFFFFF;border-top:1px solid #EDE3D4;border-radius:0 0 12px 12px;padding:20px 48px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#B0B0B3;">© ${year} Vocali · Notification interne</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`.trim(),
  })
}
