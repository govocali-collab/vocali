import { NextResponse } from "next/server"

export function GET() {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vocali — Aperçu des emails</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #0F0F0F; color: #FAF7F2; min-height: 100vh; }
    .header { background: #1C1C1E; border-bottom: 1px solid #2C2C2E; padding: 16px 24px; display: flex; align-items: center; gap: 24px; }
    .header-title { font-size: 13px; font-weight: 600; color: #C9A864; text-transform: uppercase; letter-spacing: 0.08em; }
    .tabs { display: flex; gap: 4px; }
    .tab { padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; font-size: 13px; font-weight: 500; cursor: pointer; background: transparent; color: #8C8C90; transition: all 0.15s; }
    .tab:hover { background: #2C2C2E; color: #FAF7F2; }
    .tab.active { background: #2C2C2E; border-color: #3C3C3E; color: #C9A864; }
    .preview-area { padding: 24px; display: flex; justify-content: center; }
    iframe { width: 100%; max-width: 720px; height: calc(100vh - 100px); border: 0; border-radius: 12px; background: #FAF7F2; box-shadow: 0 8px 40px rgba(0,0,0,0.5); }
    .email-panel { display: none; width: 100%; max-width: 720px; }
    .email-panel.active { display: block; }
  </style>
</head>
<body>
  <div class="header">
    <span class="header-title">Aperçu des emails</span>
    <div class="tabs">
      <button class="tab active" onclick="show('welcome', this)">Bienvenue</button>
      <button class="tab" onclick="show('payment', this)">Lien de paiement</button>
      <button class="tab" onclick="show('pause', this)">Agent en pause</button>
    </div>
  </div>
  <div class="preview-area">
    <iframe id="email-welcome" src="/email-preview/welcome" title="Bienvenue"></iframe>
    <iframe id="email-payment" src="/email-preview/payment" title="Paiement" style="display:none;"></iframe>
    <iframe id="email-pause" src="/email-preview/pause" title="Pause" style="display:none;"></iframe>
  </div>
  <script>
    function show(name, btn) {
      document.querySelectorAll('iframe').forEach(f => f.style.display = 'none')
      document.getElementById('email-' + name).style.display = 'block'
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      btn.classList.add('active')
    }
  </script>
</body>
</html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
}
