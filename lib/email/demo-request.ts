import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface DemoRequestEmailParams {
  fullName: string
  company?: string | null
  email: string
  phone: string
  message?: string | null
  prospectId?: string | null
}

/** Notification interne : une demande de démonstration via le pop-up du site. */
export async function sendDemoRequestEmail(p: DemoRequestEmailParams) {
  const year = new Date().getFullYear()
  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:7px 16px 7px 0;font-size:13px;color:#8A8A8E;white-space:nowrap;vertical-align:top;width:130px;">${label}</td><td style="padding:7px 0;font-size:14px;color:#2A2A2E;font-weight:600;">${String(value).replace(/\n/g, "<br/>")}</td></tr>`
      : ""
  const cta = p.prospectId
    ? `<a href="https://app.vocali.ca/admin/crm/${p.prospectId}" style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">Voir dans le CRM</a>`
    : ""
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: "contact@vocali.ca",
    subject: "Nouvelle demande de démonstration",
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 0;"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:12px;border:1px solid #EDE3D4;">
    <tr><td style="padding:32px 48px 8px;">
      <p style="margin:0 0 4px;font-size:13px;color:#A88840;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Demande de démonstration</p>
      <h1 style="margin:0;font-size:22px;color:#2A2A2E;">${p.company || p.fullName}</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8A8A8E;">Reçue via le pop-up du site vocali.ca.</p>
    </td></tr>
    <tr><td style="padding:16px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Nom", p.fullName)}
        ${row("Entreprise", p.company)}
        ${row("Courriel", p.email)}
        ${row("Téléphone", p.phone)}
        ${row("Message", p.message)}
      </table>
    </td></tr>
    ${cta ? `<tr><td style="padding:8px 48px 28px;">${cta}</td></tr>` : ""}
    <tr><td style="background:#FFFFFF;border-top:1px solid #EDE3D4;border-radius:0 0 12px 12px;padding:20px 48px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#B0B0B3;">© ${year} Vocali · Notification interne</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`.trim(),
  })
}
