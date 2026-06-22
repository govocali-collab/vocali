"use client"

import { useRef, useState, useEffect } from "react"
import { Download, Trash2, ChevronLeft, ChevronRight, Copy, Check, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SocialPost, Slide } from "@/lib/supabase/social"
import { PostSlide } from "./PostSlide"
import { RichEditor } from "./RichEditor"

const SLIDE_W = 338
const SLIDE_H = 423

interface Props {
  post: SocialPost
  onDelete?: (id: string) => void
  // Remonte les éditions (slides / caption) au parent — ex. pour les sauvegarder.
  onChange?: (patch: { slides: Slide[]; caption: string }) => void
}

export default function PostCard({ post, onDelete, onChange }: Props) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [slides, setSlides] = useState<Slide[]>(post.slides)
  const [caption, setCaption] = useState(post.caption)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const previewRef = useRef<HTMLDivElement>(null)
  const [slideScale, setSlideScale] = useState(1)

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width
      setSlideScale(Math.min(1, available / SLIDE_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Remonte les éditions au parent (après le montage initial).
  const didMount = useRef(false)
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    onChange?.({ slides, caption })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, caption])

  function updateSlide(index: number, field: keyof Slide, value: string) {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  async function downloadSlide(index: number) {
    const el = slideRefs.current[index]
    if (!el) return
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null })
    const link = document.createElement("a")
    link.download = `vocali-post-${post.topic.slice(0, 20).replace(/\s+/g, "-")}-${index + 1}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  async function downloadAll() {
    const html2canvas = (await import("html2canvas")).default
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()
    const slug = post.topic.slice(0, 20).replace(/\s+/g, "-")
    for (let i = 0; i < slides.length; i++) {
      const el = slideRefs.current[i]
      if (!el) continue
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null })
      const base64 = canvas.toDataURL("image/png").split(",")[1]
      zip.file(`vocali-${slug}-slide-${i + 1}.png`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: "blob" })
    const link = document.createElement("a")
    link.download = `vocali-${slug}.zip`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function copyCaption() {
    const full = `${caption}\n\n${post.hashtags.map(h => `#${h}`).join(" ")}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function ScaledSlide({ slide, index }: { slide: Slide; index: number }) {
    return (
      <div style={{
        width: SLIDE_W * slideScale,
        height: SLIDE_H * slideScale,
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}>
        <div style={{ transform: `scale(${slideScale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
          <PostSlide
            slide={slide}
            index={index}
            total={slides.length}
            postType={post.post_type}
            style={post.style}
          />
        </div>
      </div>
    )
  }

  const typeLabel: Record<string, string> = {
    single: "Post seul",
    carousel3: "Carousel · 3",
    carousel6: "Carousel · 6",
    story: "Story",
  }

  return (
    <div className="bg-white border border-ivory-300 rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest mb-0.5">
            {typeLabel[post.post_type]} · {post.style === "light" ? "Clair" : "Sombre"}
          </p>
          <p className="text-sm font-semibold text-charcoal-900 truncate">{post.topic}</p>
          <p className="text-xs text-charcoal-400 mt-0.5">
            {new Date(post.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-charcoal-300 hover:text-red-400 transition-colors shrink-0 p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Slide preview */}
      <div ref={previewRef} className="px-4 pb-2">
        {/* Hidden export-size slides for download */}
        <div className="pointer-events-none" style={{ position: "fixed", left: -99999, top: 0 }}>
          {slides.map((slide, i) => (
            <PostSlide
              key={i}
              ref={(el) => { slideRefs.current[i] = el }}
              slide={slide}
              index={i}
              total={slides.length}
              postType={post.post_type}
              style={post.style}
              size="export"
            />
          ))}
        </div>

        {/* Visible preview — scaled to fit card width */}
        {slides.length === 1 ? (
          <div className="flex justify-center">
            <ScaledSlide slide={slides[0]} index={0} />
          </div>
        ) : (
          <div>
            <div className="flex justify-center">
              <ScaledSlide slide={slides[activeSlide]} index={activeSlide} />
            </div>
            {/* Carousel nav */}
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setActiveSlide(i => Math.max(0, i - 1))}
                disabled={activeSlide === 0}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      i === activeSlide ? "bg-gold-500" : "bg-ivory-300"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSlide(i => Math.min(slides.length - 1, i + 1))}
                disabled={activeSlide === slides.length - 1}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="px-4 py-3 border-t border-ivory-200 bg-ivory-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-widest">
              Slide {activeSlide + 1} / {slides.length}
            </p>
            <button onClick={() => setEditing(false)} className="text-charcoal-400 hover:text-charcoal-700 p-0.5">
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-charcoal-400 mb-2">
            Sélectionnez du texte puis cliquez <b>G</b> (gras), <i>I</i> (italique) ou <span style={{ color: "#C9A864", fontWeight: 600 }}>Or</span>.
          </p>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-charcoal-400 mb-1">Titre</label>
              <RichEditor
                key={`h-${activeSlide}`}
                value={slides[activeSlide].headline}
                onChange={v => updateSlide(activeSlide, "headline", v)}
              />
            </div>
            <div>
              <label className="block text-xs text-charcoal-400 mb-1">Corps</label>
              <RichEditor
                key={`b-${activeSlide}`}
                value={slides[activeSlide].body ?? ""}
                onChange={v => updateSlide(activeSlide, "body", v)}
                multiline
              />
            </div>
            {slides[activeSlide].cta !== undefined && (
              <div>
                <label className="block text-xs text-charcoal-400 mb-1">CTA</label>
                <RichEditor
                  key={`c-${activeSlide}`}
                  value={slides[activeSlide].cta ?? ""}
                  onChange={v => updateSlide(activeSlide, "cta", v)}
                />
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-ivory-200">
            <label className="block text-xs text-charcoal-400 mb-1">Caption (légende)</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={4}
              placeholder="Légende du post…"
              className="w-full bg-white border border-ivory-300 rounded-lg px-3 py-2 text-sm text-charcoal-800 font-body placeholder:text-charcoal-300 focus:outline-none focus:border-gold-400 resize-none"
            />
          </div>
        </div>
      )}

      {/* Caption */}
      <div className="px-4 py-3 border-t border-ivory-200">
        <p className="text-xs text-charcoal-600 font-body leading-relaxed line-clamp-3">{caption}</p>
        <p className="text-xs text-gold-600 mt-1 font-body">
          {post.hashtags.map(h => `#${h}`).join(" ")}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-ivory-200 flex items-center gap-1">
        <button
          onClick={copyCaption}
          title={copied ? "Copié !" : "Copier la caption"}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
        <button
          onClick={() => setEditing(v => !v)}
          title="Éditer le texte (slides et caption)"
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            editing ? "bg-gold-100 text-gold-700" : "text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100"
          )}
        >
          <Pencil size={14} />
        </button>
        <div className="flex-1" />
        {slides.length > 1 && (
          <button
            onClick={downloadAll}
            title="Télécharger toutes les slides"
            className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 hover:text-charcoal-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-ivory-100"
          >
            <Download size={13} />
            Tout
          </button>
        )}
        <button
          onClick={() => downloadSlide(slides.length === 1 ? 0 : activeSlide)}
          title={slides.length > 1 ? `Télécharger slide ${activeSlide + 1}` : "Télécharger"}
          className="flex items-center gap-1.5 text-xs font-medium bg-gold-600 hover:bg-gold-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download size={13} />
          {slides.length > 1 ? `Slide ${activeSlide + 1}` : "Télécharger"}
        </button>
      </div>
    </div>
  )
}
