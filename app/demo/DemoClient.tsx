"use client"

import { useCallback, useEffect, useState } from "react"
import { useConversation, ConversationProvider } from "@elevenlabs/react"

const AGENT_ID = "agent_3801kvc085yce259k5k87380shga"

function VoiceButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const conversation = useConversation({
    onError: () => {
      setIsConnecting(false)
      setPreparing(false)
    },
  })

  const isActive = conversation.status === "connected"

  // « preparing » = du clic jusqu'à ce que Sarah commence à parler → barre de
  // progression. On l'enlève dès qu'elle parle ou si la connexion se ferme.
  useEffect(() => {
    if (conversation.isSpeaking) setPreparing(false)
  }, [conversation.isSpeaking])
  useEffect(() => {
    if (conversation.status === "disconnected") setPreparing(false)
  }, [conversation.status])

  const start = useCallback(async () => {
    setPermissionDenied(false)
    setIsConnecting(true)
    setPreparing(true)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await conversation.startSession({ agentId: AGENT_ID, connectionType: "webrtc" })
    } catch (error) {
      setPreparing(false)
      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")
      ) {
        setPermissionDenied(true)
      }
    } finally {
      setIsConnecting(false)
    }
  }, [conversation])

  const stop = useCallback(async () => {
    setPreparing(false)
    await conversation.endSession()
  }, [conversation])

  return (
    <div className="demo-voice">
      {permissionDenied && (
        <p className="demo-perm">Veuillez autoriser l&apos;accès au microphone pour parler à Sarah.</p>
      )}
      <button
        type="button"
        onClick={isActive ? stop : start}
        disabled={isConnecting || preparing}
        className={`demo-btn ${isActive && !preparing ? "demo-btn--active" : ""}`}
      >
        {preparing ? (
          "Connexion…"
        ) : isActive ? (
          <>
            <span className="demo-pulse" />
            Sarah écoute…
          </>
        ) : (
          "🎙️ Parler à Sarah"
        )}
      </button>
      {preparing && (
        <div className="demo-progress" role="progressbar" aria-label="Connexion à Sarah">
          <div className="demo-progress__fill" />
        </div>
      )}
      <p className="demo-hint2">
        {preparing
          ? "Connexion à Sarah…"
          : isActive
          ? conversation.isSpeaking
            ? "Sarah parle"
            : "Sarah vous écoute"
          : "Cliquez pour commencer une conversation vocale"}
      </p>
    </div>
  )
}

// useConversation DOIT être à l'intérieur d'un ConversationProvider. Le garde
// "mounted" évite que le SDK (APIs navigateur) ne tourne au rendu serveur.
function VoiceWidget() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <div className="demo-voice">
        <div className="demo-skeleton" />
      </div>
    )
  }
  return (
    <ConversationProvider>
      <VoiceButton />
    </ConversationProvider>
  )
}

export default function DemoClient() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .demo-page { font-family: 'Inter', sans-serif; color: #2E2A26; background: #FBF8F3; min-height: 100vh; }
        .demo-serif { font-family: 'Playfair Display', serif; }
        .demo-header { display: flex; align-items: center; justify-content: center; padding: 28px 24px; border-bottom: 1px solid #ECE3D5; }
        .demo-logo-img { height: 54px; width: auto; display: block; }
        .demo-hero { max-width: 760px; margin: 0 auto; padding: 64px 24px 48px; text-align: center; }
        .demo-hero h1 { font-family: 'Playfair Display', serif; font-size: 44px; line-height: 1.15; font-weight: 600; margin: 0 0 18px; }
        .demo-hero h1 em { color: #C9A86A; font-style: normal; }
        .demo-sub { font-size: 18px; color: #6B6258; max-width: 520px; margin: 0 auto 36px; }
        .demo-card { background: #fff; border: 1px solid #ECE3D5; border-radius: 24px; padding: 36px 28px; box-shadow: 0 20px 60px rgba(201,168,106,0.12); display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .demo-hint { font-size: 14px; color: #9A9082; }
        .demo-voice { min-height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
        .demo-btn { display: inline-flex; align-items: center; gap: 10px; border: none; cursor: pointer; border-radius: 999px; padding: 14px 28px; font-size: 16px; font-weight: 600; font-family: 'Inter', sans-serif; color: #fff; background: linear-gradient(135deg, #C9A86A, #B8945A); box-shadow: 0 10px 30px rgba(201,168,106,0.4); transition: transform .15s, box-shadow .15s, background .15s; }
        .demo-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(201,168,106,0.5); }
        .demo-btn:disabled { opacity: .6; cursor: default; }
        .demo-btn--active { background: #B4453C; box-shadow: 0 10px 30px rgba(180,69,60,0.4); }
        .demo-pulse { position: relative; width: 12px; height: 12px; border-radius: 999px; background: #fff; }
        .demo-pulse::before { content: ""; position: absolute; inset: 0; border-radius: 999px; background: #fff; opacity: .75; animation: demo-ping 1.2s cubic-bezier(0,0,.2,1) infinite; }
        @keyframes demo-ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }
        .demo-hint2 { font-size: 13px; color: #9A9082; }
        .demo-progress { width: 220px; max-width: 80%; height: 6px; background: #ECE3D5; border-radius: 999px; overflow: hidden; }
        .demo-progress__fill { width: 40%; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #C9A86A, #B8945A); animation: demo-progress-slide 1.15s ease-in-out infinite; }
        @keyframes demo-progress-slide { 0% { transform: translateX(-110%); } 100% { transform: translateX(300%); } }
        .demo-skeleton { width: 40px; height: 40px; border-radius: 999px; background: #ECE3D5; animation: demo-skel 1.2s ease-in-out infinite; }
        @keyframes demo-skel { 50% { opacity: .4; } }
        .demo-perm { font-size: 13px; color: #B4453C; background: rgba(180,69,60,0.08); padding: 8px 12px; border-radius: 10px; }
        .demo-section { max-width: 1000px; margin: 0 auto; padding: 56px 24px; }
        .demo-section h2 { font-family: 'Playfair Display', serif; font-size: 30px; text-align: center; margin: 0 0 40px; font-weight: 600; }
        .demo-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .demo-feat { background: #fff; border: 1px solid #ECE3D5; border-radius: 18px; padding: 30px 24px; text-align: center; transition: transform .2s, box-shadow .2s; }
        .demo-feat:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(201,168,106,0.14); }
        .demo-feat .ic { font-size: 28px; display: block; margin-bottom: 12px; }
        .demo-feat h3 { font-family: 'Playfair Display', serif; font-size: 20px; margin: 0 0 6px; }
        .demo-feat p { font-size: 15px; color: #6B6258; margin: 0; }
        .demo-info { background: #2E2A26; color: #F3ECE0; text-align: center; padding: 52px 24px; }
        .demo-info h2 { font-family: 'Playfair Display', serif; font-size: 26px; margin: 0 0 16px; color: #fff; }
        .demo-info span { color: #D8B878; }
        .demo-info p { font-size: 16px; line-height: 1.9; color: #D8CDBC; margin: 0; }
        .demo-footer { text-align: center; padding: 26px; font-size: 13px; color: #9A9082; }
        @media (max-width: 720px) { .demo-hero h1 { font-size: 32px; } .demo-cards { grid-template-columns: 1fr; } }
      `}</style>

      <div className="demo-page">
        <header className="demo-header">
          <img src="/studio-elegance-logo.png" alt="Salon Élégance" className="demo-logo-img" />
        </header>

        <section className="demo-hero">
          <h1 className="demo-serif">
            Rencontrez <em>Sarah</em>,<br />votre réceptionniste virtuelle
          </h1>
          <p className="demo-sub">
            Prenez rendez-vous en parlant, comme avec une vraie réceptionniste. Essayez la démo dès maintenant.
          </p>
          <div className="demo-card">
            <p className="demo-hint">Cliquez sur le bouton et parlez à Sarah 🎙️</p>
            <VoiceWidget />
          </div>
        </section>

        <section className="demo-section">
          <h2 className="demo-serif">Ce que Sarah peut faire</h2>
          <div className="demo-cards">
            <div className="demo-feat">
              <span className="ic">📅</span>
              <h3>Prendre un rendez-vous</h3>
              <p>Elle propose les disponibilités et confirme votre réservation.</p>
            </div>
            <div className="demo-feat">
              <span className="ic">💬</span>
              <h3>Répondre aux questions</h3>
              <p>Prix, services, horaires, adresse — instantanément.</p>
            </div>
            <div className="demo-feat">
              <span className="ic">🔄</span>
              <h3>Modifier ou annuler</h3>
              <p>Elle ajuste vos rendez-vous en quelques secondes.</p>
            </div>
          </div>
        </section>

        <section className="demo-info">
          <h2 className="demo-serif">Salon <span>Élégance</span></h2>
          <p>
            📍 1234 Boulevard Saint-Laurent, Montréal, Québec
            <br />
            🕐 Lundi au vendredi : 9h00 – 20h00
            <br />
            Samedi : 9h00 – 17h00 · Dimanche : fermé
          </p>
        </section>

        <footer className="demo-footer">Démonstration propulsée par Vocali</footer>
      </div>
    </>
  )
}
