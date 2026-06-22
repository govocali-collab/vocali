"use client"

import { useState } from "react"
import { Mail, X, CheckCircle, Loader2, Send } from "lucide-react"

export default function SupportCard() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  function close() {
    setOpen(false)
    // réinitialise pour la prochaine ouverture
    setTimeout(() => {
      setMessage("")
      setSent(false)
      setError("")
    }, 200)
  }

  async function handleSend() {
    if (!message.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/dashboard/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Erreur lors de l'envoi")
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="bg-gold-50 rounded-xl border border-gold-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-gold-100 border border-gold-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mail size={13} className="text-gold-600" />
          </div>
          <p className="text-charcoal-600 text-sm font-body leading-relaxed">
            Une question ou une modification à demander ?{" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-gold-700 hover:text-gold-600 transition-colors underline underline-offset-2 font-medium"
            >
              Cliquez ici
            </button>{" "}
            pour nous écrire — on vous répond par courriel.
          </p>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm px-4 font-body">
          <div className="w-full max-w-md bg-white rounded-2xl border border-ivory-300 shadow-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-gold-600" />
                </div>
                <h2 className="text-charcoal-900 text-lg font-semibold">Contacter le support</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-charcoal-300 hover:text-charcoal-600 transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle size={32} className="text-green-600 mb-3" />
                <p className="text-charcoal-800 text-sm font-medium">Message envoyé !</p>
                <p className="text-charcoal-500 text-sm mt-1">
                  Notre équipe vous répondra par courriel.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white text-sm font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="text-charcoal-500 text-sm mb-4 mt-1">
                  Écrivez votre message ci-dessous. Nous vous répondrons à l'adresse de votre compte.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message…"
                  rows={5}
                  autoFocus
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-lg px-3.5 py-2.5 text-charcoal-900 text-sm font-body placeholder-charcoal-300 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                />
                {error && <p className="mt-2 text-red-500 text-xs">{error}</p>}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold-gradient text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Envoi…</>
                  ) : (
                    <><Send size={15} /> Envoyer le message</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
