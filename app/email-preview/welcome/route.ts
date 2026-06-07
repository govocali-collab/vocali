import { NextResponse } from "next/server"

export function GET() {
  const year = new Date().getFullYear()
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email — Bienvenue</title>
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
                Merci de faire confiance à Vocali. Nous sommes ravis de vous accueillir —
                votre agent <strong style="color:#A88840;">Sofia</strong> est en cours de configuration
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
                        <td style="padding:6px 0;font-size:15px;color:#1C1C1E;font-weight:500;">marie@dermavia.ca</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:15px;color:#6C6C70;">Mot de passe</td>
                        <td style="padding:6px 0;font-size:15px;color:#1C1C1E;font-weight:500;font-family:monospace;">Welcome2024!</td>
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
                      <strong>Sofia</strong> sera configurée et prête dans les <strong>24–48h</strong>.
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
