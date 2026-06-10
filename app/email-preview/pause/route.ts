import { NextResponse } from "next/server"

export function GET() {
  const year = new Date().getFullYear()
  const now = new Date().toLocaleString("fr-CA", {
    timeZone: "America/Toronto",
    dateStyle: "long",
    timeStyle: "short",
  })

  const details = [
    ["Clinique", "Clinique Dermavia"],
    ["Agent", "Alexandra"],
    ["Propriétaire", "Marie Tremblay"],
    ["Courriel", "marie@dermavia.ca"],
    ["Date &amp; heure", now],
  ]

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email — Agent en pause</title>
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

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1C1E;">Clinique Dermavia</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6C6C70;">
                La clinique a mis <strong style="color:#A88840;">Alexandra</strong> en pause manuellement.
              </p>

              <!-- Info card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#FAF7F2;border:1px solid #EDE3D4;border-radius:10px;padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#A88840;text-transform:uppercase;letter-spacing:0.1em;">Détails</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${details.map(([label, value]) => `
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
                    <a href="#"
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
                © ${year} Vocali · Notification interne
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
