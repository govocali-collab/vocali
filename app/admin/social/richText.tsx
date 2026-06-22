// Garde-fou minimal pour le HTML des slides (contenu rédigé dans l'admin).
// On retire seulement ce qui pourrait être dangereux ; le formatage visuel
// (gras / italique / couleur or) est conservé tel quel.
export function safeHtml(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|link|meta)\b/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
}
