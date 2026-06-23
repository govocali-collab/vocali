"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

type TNode = { label: string; href?: string; external?: boolean; color?: string; children?: TNode[] }

const TREE: TNode = {
  label: "VOCALI",
  children: [
    {
      label: "Acquisition", color: "#38bdf8",
      children: [
        { label: "Formulaire contact / démo", children: [{ label: "Notif interne → contact@" }] },
        { label: "Guide téléchargé", children: [
          { label: "PDF envoyé au visiteur (contact@)" },
          { label: "Notif lead → alerte@" },
        ] },
        { label: "Scraper", href: "/admin/scraper", children: [
          { label: "Google Places API", href: "https://console.cloud.google.com", external: true, children: [
            { label: "Infos business (nom, tél, site)", children: [
              { label: "Prospects au CRM", href: "/admin/crm" },
            ] },
          ] },
        ] },
        { label: "Posts", href: "/admin/social", children: [
          { label: "Générés par IA", children: [
            { label: "Enregistrés (manuel)", children: [
              { label: "Planifiés (calendrier)" },
            ] },
          ] },
        ] },
      ],
    },
    {
      label: "Vente & embarquement", color: "#34d399",
      children: [
        { label: "Facture créée", href: "/admin/billing", children: [
          { label: "Lien de paiement → cliente (paiement@)", children: [
            { label: "Cliente paie (Stripe)", href: "https://dashboard.stripe.com", external: true, children: [
              { label: "Paiement confirmé (invoice.paid)", children: [
                { label: "Redirigée au questionnaire d'embarquement", children: [
                  { label: "Compte créé", children: [
                    { label: "Courriel d'accès + mot de passe (app@)", children: [
                      { label: "Notif nouvelle clinique → contact@" },
                    ] },
                  ] },
                ] },
              ] },
            ] },
          ] },
        ] },
      ],
    },
    {
      label: "Agent (le produit)", color: "#fbbf24",
      children: [
        { label: "Appel entrant", children: [
          { label: "ElevenLabs répond", href: "https://elevenlabs.io/app/conversational-ai", external: true, children: [
            { label: "Charge heures + catalogue publié", children: [
              { label: "Conversation → postcall webhook", children: [
                { label: "Transcript + Claude analyse", children: [
                  { label: "Lead capturé", children: [
                    { label: "Dashboard de la cliente" },
                  ] },
                ] },
              ] },
            ] },
          ] },
        ] },
      ],
    },
    {
      label: "Facturation mensuelle", color: "#fb7185",
      children: [
        { label: "Paiement complété (invoice.paid)", children: [
          { label: "Reçu envoyé (Stripe)" },
          { label: "Si clinique en pause → révision manuelle" },
        ] },
        { label: "Échec de paiement", children: [
          { label: "Notif → paiement@ + alerte@ (nb tentatives)", children: [
            { label: "Stripe réessaie (Smart Retries)", children: [
              { label: "Si abandon → abonnement annulé" },
            ] },
          ] },
        ] },
        { label: "Abonnement annulé", children: [
          { label: "Agent désactivé (is_active = false)", children: [
            { label: "Notif → alerte@" },
          ] },
        ] },
      ],
    },
    {
      label: "Leviers Vocali", color: "#10b981",
      children: [
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
      label: "Outils externes", color: "#f59e0b",
      children: [
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
  ],
}

const LEVEL_W = 230
const ROW_H = 56

const rootStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#C9A864,#8A6E2F)", color: "#FFFFFF", border: "none",
  borderRadius: 14, padding: "12px 18px", fontSize: 15, fontWeight: 700, width: 120, textAlign: "center",
  boxShadow: "0 4px 14px rgba(138,110,47,0.35)",
}
const catStyle = (color: string): React.CSSProperties => ({
  background: "#FFFFFF", color: "#2A2A2E", border: `2px solid ${color}`,
  borderRadius: 12, padding: "9px 13px", fontSize: 13, fontWeight: 600, width: 165, textAlign: "center",
})
const stepStyle = (clickable: boolean): React.CSSProperties => ({
  background: "#FAF7F2", color: clickable ? "#8A6E2F" : "#5A5A5E",
  border: `1px solid ${clickable ? "#E4D4AE" : "#EDE3D4"}`, borderRadius: 9,
  padding: "6px 10px", fontSize: 11, fontWeight: clickable ? 600 : 400, width: 200,
  textAlign: "left", lineHeight: 1.3, whiteSpace: "normal",
  cursor: clickable ? "pointer" : "default",
})

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let leafCursor = 0

  function walk(node: TNode, depth: number, parentId: string | null, inherited: string | undefined, id: string): number {
    const isRoot = depth === 0
    const isCat = depth === 1
    const color = isCat ? node.color : inherited

    let y: number
    if (!node.children || node.children.length === 0) {
      y = leafCursor * ROW_H
      leafCursor++
    } else {
      const childYs = node.children.map((c, k) => walk(c, depth + 1, id, color, `${id}-${k}`))
      y = (childYs[0] + childYs[childYs.length - 1]) / 2
    }

    nodes.push({
      id,
      position: { x: depth * LEVEL_W, y },
      data: { label: node.external ? `${node.label}  ↗` : node.label, href: node.href, external: node.external },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: isRoot ? rootStyle : isCat ? catStyle(node.color ?? "#C9A864") : stepStyle(!!node.href),
    })

    if (parentId) {
      edges.push({
        id: `${parentId}->${id}`,
        source: parentId,
        target: id,
        style: { stroke: color ?? "#C9A864", strokeWidth: isCat ? 2 : 1.5, opacity: isCat ? 0.9 : 0.5 },
        animated: isCat,
      })
    }
    return y
  }

  walk(TREE, 0, null, undefined, "n")
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
    <div className="border border-ivory-300 rounded-xl bg-ivory-50 overflow-hidden" style={{ height: "76vh", minHeight: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.15}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#E4D4AE" gap={22} size={1} />
        <MiniMap pannable zoomable nodeColor={(n) => ((n.style?.borderColor as string) || "#C9A864")} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
