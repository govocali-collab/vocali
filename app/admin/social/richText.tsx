import React from "react"

// Balisage léger pour le texte des slides :
//   **gras**      → gras
//   *italique*    → italique
//   ==or==        → couleur or (#C9A864)
const TOKEN = /(\*\*[^*]+?\*\*|==[^=]+?==|\*[^*]+?\*)/g

/** Rend un texte avec le balisage léger. Retourne des nœuds React (spans). */
export function renderRich(text: string | null | undefined): React.ReactNode {
  if (!text) return text ?? null
  const parts = text.split(TOKEN)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.length >= 4 && part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 800 }}>{part.slice(2, -2)}</strong>
    if (part.length >= 4 && part.startsWith("==") && part.endsWith("=="))
      return <span key={i} style={{ color: "#C9A864" }}>{part.slice(2, -2)}</span>
    if (part.length >= 2 && part.startsWith("*") && part.endsWith("*"))
      return <em key={i} style={{ fontStyle: "italic" }}>{part.slice(1, -1)}</em>
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}
