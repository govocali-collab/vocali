import { NextResponse } from "next/server"

export function GET() {
  const year = new Date().getFullYear()
  const priceFormatted = new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(197)

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email — Lien de paiement</title>
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
                Bonjour Marie,
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#4C4C50;">
                Merci de votre intérêt pour Vocali. Voici votre lien de paiement sécurisé pour activer votre secrétaire IA pour <strong>Clinique Dermavia</strong>.
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
                        <td style="padding:5px 0;font-size:15px;color:#1C1C1E;font-weight:500;">${priceFormatted} / mois</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:15px;color:#6C6C70;">Essai gratuit</td>
                        <td style="padding:5px 0;font-size:15px;color:#2D7A4F;font-weight:600;">30 jours — aucun débit</td>
                      </tr>
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
                    <a href="#"
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
                © ${year} Vocali · Réceptionniste IA pour cliniques
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
}
