import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWelcomeEmailParams {
  clinicName: string;
  ownerEmail: string;
  ownerFirstName: string;
  agentName: string;
  tempPassword: string;
  tempEmail?: string;
}

export async function sendWelcomeEmail({
  clinicName,
  ownerEmail,
  ownerFirstName,
  agentName,
  tempPassword,
  tempEmail,
}: SendWelcomeEmailParams) {
  const displayEmail = tempEmail ?? ownerEmail;
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: ownerEmail,
    subject: `Bienvenue chez Vocali — ${agentName} arrive bientôt ✨`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue chez Vocali</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
              <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;" />
              <div style="height:1px;background:#C9A864;margin-top:32px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:48px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1C1C1E;">
                Bonjour ${ownerFirstName},
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#4C4C50;">
                Merci de faire confiance à Vocali. Nous sommes ravis de vous accueillir —
                votre agent <strong style="color:#A88840;">${agentName}</strong> est en cours de configuration
                et sera bientôt prêt à prendre en charge vos appels.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#FAF7F2;border:1px solid #F0D9A0;border-radius:10px;padding:28px 32px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#A88840;text-transform:uppercase;letter-spacing:0.08em;">Vos accès temporaires</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:15px;color:#6C6C70;width:100px;">Courriel</td>
                        <td style="padding:6px 0;font-size:15px;color:#1C1C1E;font-weight:500;">${displayEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:15px;color:#6C6C70;">Mot de passe</td>
                        <td style="padding:6px 0;font-size:15px;color:#1C1C1E;font-weight:500;font-family:monospace;">${tempPassword}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="https://app.vocali.ca/dashboard"
                       style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.02em;">
                      Accéder à mon tableau de bord →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#F8EDD4;border-left:3px solid #C9A864;border-radius:0 8px 8px 0;padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#7D6430;">Prochaine étape</p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#4C4C50;">
                      <strong>${agentName}</strong> sera configurée et prête dans les <strong>24–48h</strong>.
                      Nous l'activerons ensemble lors de notre appel d'embarquement.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;line-height:1.7;color:#4C4C50;">
                Si vous avez des questions d'ici là, répondez simplement à ce courriel.
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="background:#FFFFFF;padding:0 48px 40px;border-radius:0 0 12px 12px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #EDE3D4;padding-top:28px;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1C1C1E;">Jonathan Hébert</p>
                    <p style="margin:0 0 2px;font-size:14px;color:#6C6C70;">Fondateur, Vocali</p>
                    <a href="mailto:support@vocali.ca" style="font-size:14px;color:#A88840;text-decoration:none;">support@vocali.ca</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B0B0B3;">
                © ${new Date().getFullYear()} Vocali · Réceptionniste IA pour cliniques
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

interface SendPaymentLinkParams {
  clinicName: string;
  firstName: string;
  email: string;
  price: number;
  billing: "month" | "year";
  trial: boolean;
  checkoutUrl: string;
}

export async function sendPaymentLinkEmail({
  clinicName,
  firstName,
  email,
  price,
  billing,
  trial,
  checkoutUrl,
}: SendPaymentLinkParams) {
  const billingLabel = billing === "month" ? "mois" : "an";
  const priceFormatted = new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(price);

  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: email,
    subject: `Votre accès à Vocali — Secrétaire IA`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre accès à Vocali</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
              <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;" />
              <div style="height:1px;background:#C9A864;margin-top:32px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:48px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1C1C1E;">
                Bonjour ${firstName},
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#4C4C50;">
                Merci de votre intérêt pour Vocali. Voici votre lien de paiement sécurisé pour activer votre secrétaire IA pour <strong>${clinicName}</strong>.
              </p>

              <!-- Pricing box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#FAF7F2;border:1px solid #F0D9A0;border-radius:10px;padding:24px 32px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#A88840;text-transform:uppercase;letter-spacing:0.08em;">Votre abonnement</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;font-size:15px;color:#6C6C70;width:140px;">Produit</td>
                        <td style="padding:5px 0;font-size:15px;color:#1C1C1E;font-weight:500;">Vocali — Secrétaire IA</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:15px;color:#6C6C70;">Facturation</td>
                        <td style="padding:5px 0;font-size:15px;color:#1C1C1E;font-weight:500;">${priceFormatted} / ${billingLabel}</td>
                      </tr>
                      ${trial ? `
                      <tr>
                        <td style="padding:5px 0;font-size:15px;color:#6C6C70;">Essai gratuit</td>
                        <td style="padding:5px 0;font-size:15px;color:#2D7A4F;font-weight:600;">30 jours — aucun débit</td>
                      </tr>` : ""}
                      <tr>
                        <td style="padding:5px 0;font-size:15px;color:#6C6C70;">Engagement</td>
                        <td style="padding:5px 0;font-size:15px;color:#1C1C1E;font-weight:500;">Aucun · annulation à tout moment</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="${checkoutUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.02em;">
                      Activer mon abonnement →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#F8EDD4;border-left:3px solid #C9A864;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#4C4C50;">
                      Après le paiement, vous serez guidé vers votre formulaire d'inscription pour configurer votre secrétaire IA. Tout sera prêt dans les <strong>24–48h</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;line-height:1.7;color:#4C4C50;">
                Des questions ? Répondez simplement à ce courriel.
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="background:#FFFFFF;padding:0 48px 40px;border-radius:0 0 12px 12px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #EDE3D4;padding-top:28px;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1C1C1E;">Jonathan Hébert</p>
                    <p style="margin:0 0 2px;font-size:14px;color:#6C6C70;">Fondateur, Vocali</p>
                    <a href="mailto:support@vocali.ca" style="font-size:14px;color:#A88840;text-decoration:none;">support@vocali.ca</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B0B0B3;">
                © ${new Date().getFullYear()} Vocali · Réceptionniste IA pour cliniques
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

interface SendAgentPausedParams {
  clinicName: string;
  agentName: string;
  ownerName: string;
  ownerEmail: string;
  clinicId: string;
}

export async function sendAgentPausedNotification({
  clinicName,
  agentName,
  ownerName,
  ownerEmail,
  clinicId,
}: SendAgentPausedParams) {
  const now = new Date().toLocaleString("fr-CA", {
    timeZone: "America/Toronto",
    dateStyle: "long",
    timeStyle: "short",
  })

  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: "contact@peaklocals.com",
    subject: `⏸️ Agent mis en pause — ${clinicName}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent mis en pause</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
              <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;" />
              <div style="height:1px;background:#C9A864;margin-top:32px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:40px 48px;">

              <!-- Alert badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#FFF8E6;border:1px solid #F0D9A0;border-radius:20px;padding:6px 14px;">
                    <span style="font-size:12px;font-weight:600;color:#A88840;letter-spacing:0.06em;">⏸ AGENT EN PAUSE</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1C1E;">${clinicName}</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6C6C70;">
                La clinique a mis <strong style="color:#A88840;">${agentName}</strong> en pause manuellement.
              </p>

              <!-- Info card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#FAF7F2;border:1px solid #EDE3D4;border-radius:10px;padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#A88840;text-transform:uppercase;letter-spacing:0.1em;">Détails</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["Clinique", clinicName],
                        ["Agent", agentName],
                        ["Propriétaire", ownerName || "—"],
                        ["Courriel", ownerEmail],
                        ["Date & heure", now],
                      ].map(([label, value]) => `
                      <tr>
                        <td style="padding:5px 16px 5px 0;font-size:13px;color:#8C8C90;white-space:nowrap;width:110px;">${label}</td>
                        <td style="padding:5px 0;font-size:13px;color:#1C1C1E;font-weight:500;">${value}</td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Recommendation -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#F8EDD4;border-left:3px solid #C9A864;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#4C4C50;">
                      Recommandé : faire un suivi avec la clinique dans les <strong>24h</strong> pour comprendre la raison et s'assurer que l'agent est réactivé.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="https://app.vocali.ca/admin/clinics/${clinicId}"
                       style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;letter-spacing:0.02em;">
                      Voir la clinique →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FFFFFF;border-top:1px solid #EDE3D4;border-radius:0 0 12px 12px;padding:20px 48px;">
              <p style="margin:0;font-size:12px;color:#B0B0B3;text-align:center;">
                © ${new Date().getFullYear()} Vocali · Notification interne
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

interface SendPauseReminderParams {
  clinicName: string;
  agentName: string;
  ownerName: string;
  ownerEmail: string;
  clinicId: string;
  pausedAt: string;
}

export async function sendPauseReminderNotification({
  clinicName,
  agentName,
  ownerName,
  ownerEmail,
  clinicId,
  pausedAt,
}: SendPauseReminderParams) {
  const pausedDate = new Date(pausedAt).toLocaleString("fr-CA", {
    timeZone: "America/Toronto",
    dateStyle: "long",
    timeStyle: "short",
  })

  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: "contact@peaklocals.com",
    subject: `⏸️ Rappel — Agent toujours en pause · ${clinicName}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
              <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;" />
              <div style="height:1px;background:#C9A864;margin-top:32px;"></div>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;padding:40px 48px;">

              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#FFF8E6;border:1px solid #F0D9A0;border-radius:20px;padding:6px 14px;">
                    <span style="font-size:12px;font-weight:600;color:#A88840;letter-spacing:0.06em;">⏸ RAPPEL 24H — AGENT EN PAUSE</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1C1E;">${clinicName}</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6C6C70;">
                L'agent <strong style="color:#A88840;">${agentName}</strong> est en pause depuis plus de 24 heures. Aucune réactivation n'a été effectuée.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#FAF7F2;border:1px solid #EDE3D4;border-radius:10px;padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#A88840;text-transform:uppercase;letter-spacing:0.1em;">Détails</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["Clinique", clinicName],
                        ["Agent", agentName],
                        ["Propriétaire", ownerName || "—"],
                        ["Courriel", ownerEmail],
                        ["En pause depuis", pausedDate],
                      ].map(([label, value]) => `
                      <tr>
                        <td style="padding:5px 16px 5px 0;font-size:13px;color:#8C8C90;white-space:nowrap;width:130px;">${label}</td>
                        <td style="padding:5px 0;font-size:13px;color:#1C1C1E;font-weight:500;">${value}</td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#F8EDD4;border-left:3px solid #C9A864;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#4C4C50;">
                      Contactez la clinique pour comprendre la raison de la pause et vous assurer que l'agent sera réactivé.
                    </p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="https://app.vocali.ca/admin/clinics/${clinicId}"
                       style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;letter-spacing:0.02em;">
                      Voir la clinique →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;border-top:1px solid #EDE3D4;border-radius:0 0 12px 12px;padding:20px 48px;">
              <p style="margin:0;font-size:12px;color:#B0B0B3;text-align:center;">
                © ${new Date().getFullYear()} Vocali · Notification interne
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

interface SendAdminNotificationParams {
  clinicId: string;
  clinicName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  agentName: string;
  services: string[];
  bookingSystem: string;
  language: string;
}

export async function sendAdminNotification({
  clinicId,
  clinicName,
  ownerName,
  ownerEmail,
  ownerPhone,
  city,
  agentName,
  services,
  bookingSystem,
  language,
}: SendAdminNotificationParams) {
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: "jonathan@vocali.ca",
    subject: `🆕 Nouvelle clinique : ${clinicName}`,
    html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#FAF7F2;border-radius:12px;">
  <p style="margin:0 0 4px;font-size:13px;color:#A88840;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Nouvelle inscription</p>
  <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#1C1C1E;">${clinicName}</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    ${[
      ["Propriétaire", ownerName],
      ["Courriel", ownerEmail],
      ["Téléphone", ownerPhone],
      ["Ville", city],
      ["Langue", language],
      ["Agent", agentName],
      ["Logiciel de réservation", bookingSystem],
    ].map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px 8px 0;font-size:13px;color:#8C8C90;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:13px;color:#1C1C1E;font-weight:500;">${value}</td>
    </tr>`).join("")}
  </table>

  <div style="background:#FFFFFF;border:1px solid #EDE3D4;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#A88840;text-transform:uppercase;letter-spacing:0.08em;">Services</p>
    <p style="margin:0;font-size:14px;color:#4C4C50;line-height:1.6;">${services.join(", ") || "—"}</p>
  </div>

  <a href="https://app.vocali.ca/admin/clinics/${clinicId}" style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 100%);color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:10px 24px;border-radius:8px;">
    Configurer la clinique →
  </a>
</div>
    `.trim(),
  });
}

export async function sendPaymentFailedNotification({
  clinicName, ownerEmail, clinicId, attemptCount, nextRetry,
}: { clinicName: string; ownerEmail: string; clinicId: string; attemptCount: number; nextRetry: string | null }) {
  const year = new Date().getFullYear()
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: "contact@peaklocals.com",
    subject: `⚠️ Paiement échoué — ${clinicName}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
        <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;"/>
        <div style="height:1px;background:#C9A864;margin-top:32px;"></div>
      </td></tr>
      <tr><td style="background:#FFFFFF;padding:40px 48px;">
        <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:20px;padding:6px 14px;">
            <span style="font-size:12px;font-weight:600;color:#92400E;letter-spacing:0.06em;">⚠️ PAIEMENT ÉCHOUÉ</span>
          </td></tr>
        </table>
        <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1C1E;">${clinicName}</p>
        <p style="margin:0 0 28px;font-size:15px;color:#6C6C70;">Une tentative de paiement a échoué pour cette clinique.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:#FAF7F2;border:1px solid #EDE3D4;border-radius:10px;padding:24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ["Clinique", clinicName],
                ["Courriel", ownerEmail],
                ["Tentative", `#${attemptCount}`],
                ["Prochaine tentative", nextRetry ?? "Aucune (abonnement à risque)"],
              ].map(([l, v]) => `<tr>
                <td style="padding:5px 16px 5px 0;font-size:13px;color:#8C8C90;white-space:nowrap;width:160px;">${l}</td>
                <td style="padding:5px 0;font-size:13px;color:#1C1C1E;font-weight:500;">${v}</td>
              </tr>`).join("")}
            </table>
          </td></tr>
        </table>
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="https://app.vocali.ca/admin/clinics/${clinicId}"
             style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
            Voir la clinique →
          </a>
        </td></tr></table>
      </td></tr>
      <tr><td style="background:#FFFFFF;border-top:1px solid #EDE3D4;border-radius:0 0 12px 12px;padding:20px 48px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#B0B0B3;">© ${year} Vocali · Notification interne</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`.trim(),
  })
}

export async function sendSubscriptionCancelledNotification({
  clinicName, ownerEmail, clinicId,
}: { clinicName: string; ownerEmail: string; clinicId: string }) {
  const year = new Date().getFullYear()
  return resend.emails.send({
    from: "Vocali <support@vocali.ca>",
    to: "contact@peaklocals.com",
    subject: `❌ Abonnement annulé — ${clinicName}`,
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#FFFFFF;border-radius:12px 12px 0 0;border-top:3px solid #C9A864;padding:32px 48px;text-align:center;">
        <img src="https://vocali.ca/vocali-logo-black.png" alt="Vocali" style="height:48px;width:auto;display:block;margin:0 auto;"/>
        <div style="height:1px;background:#C9A864;margin-top:32px;"></div>
      </td></tr>
      <tr><td style="background:#FFFFFF;padding:40px 48px;">
        <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td style="background:#FEE2E2;border:1px solid #FCA5A5;border-radius:20px;padding:6px 14px;">
            <span style="font-size:12px;font-weight:600;color:#991B1B;letter-spacing:0.06em;">❌ ABONNEMENT ANNULÉ</span>
          </td></tr>
        </table>
        <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1C1E;">${clinicName}</p>
        <p style="margin:0 0 28px;font-size:15px;color:#6C6C70;">L'abonnement de cette clinique a été annulé. L'agent a été mis en pause automatiquement.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:#FAF7F2;border:1px solid #EDE3D4;border-radius:10px;padding:24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[["Clinique", clinicName], ["Courriel", ownerEmail]].map(([l, v]) => `<tr>
                <td style="padding:5px 16px 5px 0;font-size:13px;color:#8C8C90;white-space:nowrap;width:100px;">${l}</td>
                <td style="padding:5px 0;font-size:13px;color:#1C1C1E;font-weight:500;">${v}</td>
              </tr>`).join("")}
            </table>
          </td></tr>
        </table>
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="https://app.vocali.ca/admin/clinics/${clinicId}"
             style="display:inline-block;background:linear-gradient(135deg,#C9A864 0%,#A88840 50%,#8A6E2F 100%);color:#FEFDFB;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
            Voir la clinique →
          </a>
        </td></tr></table>
      </td></tr>
      <tr><td style="background:#FFFFFF;border-top:1px solid #EDE3D4;border-radius:0 0 12px 12px;padding:20px 48px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#B0B0B3;">© ${year} Vocali · Notification interne</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`.trim(),
  })
}
