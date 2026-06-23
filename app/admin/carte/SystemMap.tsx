"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ReactFlow,
  Background,
  Controls,
  Position,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

type Leaf = { label: string; href?: string; external?: boolean }
type Category = { id: string; label: string; color: string; leaves: Leaf[] }

const CATEGORIES: Category[] = [
  {
    id: "acq", label: "Acquisition", color: "#38bdf8",
    leaves: [
      { label: "Guide PDF → visiteur (contact@)" },
      { label: "Formulaire / demande démo" },
      { label: "Posts & calendrier", href: "/admin/social" },
      { label: "Scraper → CRM", href: "/admin/scraper" },
    ],
  },
  {
    id: "sale", label: "Vente & embarquement", color: "#34d399",
    leaves: [
      { label: "Facture / paiement (paiement@)", href: "/admin/billing" },
      { label: "Stripe checkout", href: "https://dashboard.stripe.com", external: true },
      { label: "Onboarding → compte", href: "/admin/onboarding" },
      { label: "Courriel d'accès (app@)" },
      { label: "Twilio → ElevenLabs", href: "https://elevenlabs.io/app/conversational-ai", external: true },
    ],
  },
  {
    id: "agent", label: "Agent (le produit)", color: "#fbbf24",
    leaves: [
      { label: "Appel entrant → répond" },
      { label: "Heures + catalogue publié", href: "/admin/clinics" },
      { label: "Lead capturé (dashboard cliente)" },
      { label: "SMS de suivi (selon config)" },
    ],
  },
  {
    id: "billing", label: "Facturation", color: "#fb7185",
    leaves: [
      { label: "Reçu mensuel", href: "https://dashboard.stripe.com", external: true },
      { label: "Paiement échoué (paiement@ + alerte@)" },
      { label: "Annulation / pause (alerte@)" },
    ],
  },
  {
    id: "levers", label: "Leviers Vocali", color: "#10b981",
    leaves: [
      { label: "Cliniques", href: "/admin/clinics" },
      { label: "Posts", href: "/admin/social" },
      { label: "CRM", href: "/admin/crm" },
      { label: "Scraper", href: "/admin/scraper" },
      { label: "Facturation", href: "/admin/billing" },
      { label: "Onboarding", href: "/admin/onboarding" },
      { label: "Statistiques", href: "/admin/stats" },
    ],
  },
  {
    id: "external", label: "Outils externes", color: "#f59e0b",
    leaves: [
      { label: "Stripe", href: "https://dashboard.stripe.com", external: true },
      { label: "ElevenLabs", href: "https://elevenlabs.io/app/conversational-ai", external: true },
      { label: "Resend", href: "https://resend.com/emails", external: true },
      { label: "Google Workspace", href: "https://admin.google.com", external: true },
      { label: "Twilio", href: "https://console.twilio.com", external: true },
      { label: "Supabase", href: "https://supabase.com/dashboard", external: true },
      { label: "Vercel", href: "https://vercel.com/dashboard", external: true },
      { label: "GitHub", href: "https://github.com/govocali-collab/vocali", external: true },
    ],
  },
]

const LEAF_H = 46
const GAP = 22
const CAT_X = 320
const LEAF_X = 660

const rootStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#C9A864,#8A6E2F)", color: "#FFFFFF", border: "none",
  borderRadius: 14, padding: "12px 18px", fontSize: 15, fontWeight: 700, width: 120, textAlign: "center",
  boxShadow: "0 4px 14px rgba(138,110,47,0.35)",
}
const catStyle = (color: string): React.CSSProperties => ({
  background: "#FFFFFF", color: "#2A2A2E", border: `2px solid ${color}`,
  borderRadius: 12, padding: "9px 13px", fontSize: 13, fontWeight: 600, width: 160, textAlign: "center",
})
const leafStyle = (clickable: boolean): React.CSSProperties => ({
  background: "#FAF7F2", color: clickable ? "#8A6E2F" : "#6B6B6E",
  border: `1px solid ${clickable ? "#E4D4AE" : "#EDE3D4"}`, borderRadius: 9,
  padding: "6px 11px", fontSize: 11.5, fontWeight: clickable ? 600 : 400, width: 190, textAlign: "left",
  cursor: clickable ? "pointer" : "default",
})

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  let y = 0
  const blockCenters: number[] = []
  CATEGORIES.forEach((cat) => {
    const m = cat.leaves.length
    const blockTop = y
    cat.leaves.forEach((leaf, j) => {
      const id = `${cat.id}-${j}`
      const clickable = !!leaf.href
      nodes.push({
        id,
        position: { x: LEAF_X, y: blockTop + j * LEAF_H },
        data: { label: leaf.external ? `${leaf.label}  ↗` : leaf.label, href: leaf.href, external: leaf.external },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: leafStyle(clickable),
        draggable: true,
      })
      edges.push({ id: `${cat.id}->${id}`, source: cat.id, target: id, style: { stroke: cat.color, strokeWidth: 1.5, opacity: 0.55 } })
    })
    const blockCenter = blockTop + ((m - 1) * LEAF_H) / 2
    blockCenters.push(blockCenter)
    nodes.push({
      id: cat.id,
      position: { x: CAT_X, y: blockCenter },
      data: { label: cat.label },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: catStyle(cat.color),
    })
    edges.push({ id: `root->${cat.id}`, source: "root", target: cat.id, style: { stroke: "#C9A864", strokeWidth: 2 }, animated: true })
    y = blockTop + m * LEAF_H + GAP
  })

  const rootY = blockCenters.length ? (blockCenters[0] + blockCenters[blockCenters.length - 1]) / 2 : 0
  nodes.push({
    id: "root",
    position: { x: 0, y: rootY },
    data: { label: "VOCALI" },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: rootStyle,
  })

  return { nodes, edges }
}

export default function SystemMap() {
  const router = useRouter()
  const { nodes, edges } = useMemo(buildGraph, [])

  const onNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    const href = node.data?.href as string | undefined
    if (!href) return
    if (node.data?.external) window.open(href, "_blank", "noopener,noreferrer")
    else router.push(href)
  }, [router])

  return (
    <div className="border border-ivory-300 rounded-xl bg-ivory-50 overflow-hidden" style={{ height: "72vh", minHeight: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#E4D4AE" gap={22} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
