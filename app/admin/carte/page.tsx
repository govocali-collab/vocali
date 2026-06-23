import SystemMap from "./SystemMap"

export const metadata = { title: "Carte du système — Vocali" }

export default function SystemMapPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">Carte du système</h1>
        <p className="text-charcoal-500 text-sm font-body mt-1">
          Vocali au centre, les branches rayonnent vers chaque domaine. Cliquez un nœud{" "}
          <span className="text-gold-700 font-medium">doré</span> pour aller à sa page (↗ = outil externe).
          Molette pour zoomer, glisser pour déplacer.
        </p>
      </div>
      <SystemMap />
    </div>
  )
}
