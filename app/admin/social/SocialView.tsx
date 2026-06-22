"use client"

import { useState } from "react"
import { Sparkles, History, Loader2, TrendingUp, RotateCcw, Save, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SocialPost, PostType, PostStyle } from "@/lib/supabase/social"
import PostCard from "./PostCard"

const POST_TYPES: { value: PostType; label: string; desc: string }[] = [
  { value: "single",    label: "Post seul",    desc: "1 image" },
  { value: "carousel3", label: "Carousel · 3", desc: "3 slides" },
  { value: "carousel6", label: "Carousel · 6", desc: "6 slides" },
  { value: "story",     label: "Story",        desc: "Vertical" },
]

interface Props {
  initialPosts: SocialPost[]
}

export default function SocialView({ initialPosts }: Props) {
  const [tab, setTab] = useState<"generate" | "history">("generate")
  const [topic, setTopic] = useState("")
  const [customContent, setCustomContent] = useState("")
  const [postType, setPostType] = useState<PostType>("single")
  const [style, setStyle] = useState<PostStyle>("light")
  const [useTrends, setUseTrends] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts)
  const [latest, setLatest] = useState<SocialPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedLatest, setSavedLatest] = useState(false)

  const canGenerate = !generating && (topic.trim().length > 0 || customContent.trim().length > 0)

  async function handleGenerate() {
    if (!canGenerate) return
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, postType, style, useTrends, customContent: customContent.trim() || undefined }),
      })
      if (!res.ok) {
        let errMsg = "Erreur lors de la génération"
        try { const err = await res.json() as { error?: string }; errMsg = err.error ?? errMsg } catch { /* ignore */ }
        alert(errMsg)
        return
      }
      const { post } = await res.json() as { post: SocialPost }
      setLatest(post)
      setSavedLatest(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la génération")
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!latest || savedLatest) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/social/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: latest.topic,
          post_type: latest.post_type,
          style: latest.style,
          slides: latest.slides,
          caption: latest.caption,
          hashtags: latest.hashtags,
        }),
      })
      if (!res.ok) {
        let errMsg = "Erreur lors de l'enregistrement"
        try { const err = await res.json() as { error?: string }; errMsg = err.error ?? errMsg } catch { /* ignore */ }
        alert(errMsg)
        return
      }
      const { post } = await res.json() as { post: SocialPost }
      setPosts(prev => [post, ...prev])
      setLatest(post)
      setSavedLatest(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setTopic("")
    setCustomContent("")
    setPostType("single")
    setStyle("light")
    setUseTrends(false)
    setLatest(null)
    setSavedLatest(false)
  }

  function handleDelete(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id))
    if (latest?.id === id) setLatest(null)
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-charcoal-900 font-display text-2xl font-semibold">
          Générateur de posts
        </h1>
        <p className="text-charcoal-500 text-sm mt-1 font-body">
          Crée des posts et stories aux couleurs de Vocali en quelques secondes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-ivory-200 rounded-lg p-0.5 w-fit mb-6">
        {[
          { key: "generate", label: "Générer", icon: Sparkles },
          { key: "history",  label: `Historique (${posts.length})`, icon: History },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as "generate" | "history")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              tab === key
                ? "bg-white text-charcoal-900 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-700"
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {tab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white border border-ivory-300 rounded-xl p-6 shadow-card">
            <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-5">
              Nouvelle création
            </p>

            {/* Topic */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-1.5">
                Sujet
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGenerate()}
                placeholder="ex. Botox, soins du visage, promotion été…"
                disabled={generating}
                className="w-full border border-ivory-300 rounded-lg px-3 py-2.5 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400 placeholder:text-charcoal-300"
              />
            </div>

            {/* Custom content */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-1.5">
                Texte ou prompt <span className="normal-case font-normal text-charcoal-300">(optionnel)</span>
              </label>
              <textarea
                value={customContent}
                onChange={e => setCustomContent(e.target.value)}
                placeholder="Colle un texte déjà écrit, des points clés, ou une directive précise pour la génération…"
                disabled={generating}
                rows={4}
                className="w-full border border-ivory-300 rounded-lg px-3 py-2.5 text-sm font-body text-charcoal-800 focus:outline-none focus:border-gold-400 placeholder:text-charcoal-300 resize-none"
              />
            </div>

            {/* Post type */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-2">
                Type de post
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POST_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setPostType(t.value)}
                    disabled={generating}
                    className={cn(
                      "flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-colors",
                      postType === t.value
                        ? "border-gold-400 bg-gold-50 text-charcoal-900"
                        : "border-ivory-300 text-charcoal-500 hover:border-gold-300"
                    )}
                  >
                    <span className="text-sm font-semibold">{t.label}</span>
                    <span className="text-xs text-charcoal-400">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-2">
                Style
              </label>
              <div className="flex gap-2">
                {[
                  { value: "light", label: "Clair", bg: "bg-[#FAF7F2]", border: "border-[#E8E0D0]", text: "text-[#1C1A16]" },
                  { value: "dark",  label: "Sombre", bg: "bg-[#1C1A16]", border: "border-[#3A3A2E]", text: "text-[#FAF7F2]" },
                ].map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value as PostStyle)}
                    disabled={generating}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                      s.bg, s.text,
                      style === s.value ? "border-gold-400" : s.border
                    )}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#C9A864]" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trends toggle */}
            <div className="flex items-center justify-between mb-4 py-3 px-4 bg-ivory-100 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-gold-600" />
                <div>
                  <p className="text-xs font-semibold text-charcoal-700">Recherche des tendances</p>
                  <p className="text-xs text-charcoal-400">Base les posts sur les contenus viraux actuels</p>
                </div>
              </div>
              <button
                onClick={() => setUseTrends(v => !v)}
                disabled={generating}
                className={cn(
                  "relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                  useTrends ? "bg-gold-500" : "bg-ivory-300"
                )}
              >
                <span
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                  style={{ left: useTrends ? "20px" : "4px" }}
                />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="flex-1 flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
              >
                {generating
                  ? <><Loader2 size={15} className="animate-spin" />{useTrends ? "Recherche + génération…" : "Génération en cours…"}</>
                  : <><Sparkles size={15} /> Générer</>
                }
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={generating}
                title="Réinitialiser"
                className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-ivory-300 text-charcoal-500 hover:bg-ivory-100 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                <RotateCcw size={14} />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Preview of latest */}
          <div>
            {latest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 bg-white border border-ivory-300 rounded-xl px-4 py-3 shadow-card">
                  <p className="text-charcoal-500 text-sm font-body">
                    {savedLatest
                      ? "Ce post est dans l'historique."
                      : "Aperçu — non enregistré. Cliquez pour l'ajouter à l'historique."}
                  </p>
                  {savedLatest ? (
                    <span className="flex items-center gap-1.5 text-green-700 text-sm font-body font-medium whitespace-nowrap">
                      <CheckCircle size={15} className="text-green-600" /> Enregistré
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 bg-gold-gradient text-white text-sm font-semibold rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
                    >
                      {saving
                        ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
                        : <><Save size={15} /> Enregistrer dans l'historique</>}
                    </button>
                  )}
                </div>
                <PostCard
                  key={latest.id}
                  post={latest}
                  onDelete={handleDelete}
                  onChange={(u) => setLatest(prev => (prev ? { ...prev, ...u } : prev))}
                />
              </div>
            ) : (
              <div className="bg-white border border-ivory-300 rounded-xl p-8 shadow-card flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <Sparkles size={32} className="text-ivory-300 mx-auto mb-3" />
                  <p className="text-charcoal-400 text-sm font-body">
                    Ton post apparaîtra ici
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-16 text-charcoal-400 font-body text-sm">
              Aucun post créé pour l'instant.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
