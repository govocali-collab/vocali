"use client"

import { useRef, useState } from "react"
import { Download, Trash2, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SocialPost } from "@/lib/supabase/social"
import { PostSlide } from "./PostSlide"

interface Props {
  post: SocialPost
  onDelete?: (id: string) => void
}

export default function PostCard({ post, onDelete }: Props) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [copied, setCopied] = useState(false)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  async function downloadSlide(index: number) {
    const el = slideRefs.current[index]
    if (!el) return

    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    })
    const link = document.createElement("a")
    link.download = `vocali-post-${post.topic.slice(0, 20).replace(/\s+/g, "-")}-${index + 1}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  async function downloadAll() {
    for (let i = 0; i < post.slides.length; i++) {
      await downloadSlide(i)
    }
  }

  function copyCaption() {
    const full = `${post.caption}\n\n${post.hashtags.map(h => `#${h}`).join(" ")}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className="px-4 pb-2">
        {/* Hidden export-size slides for download */}
        <div className="absolute pointer-events-none opacity-0 overflow-hidden" style={{ left: -9999 }}>
          {post.slides.map((slide, i) => (
            <PostSlide
              key={i}
              ref={(el) => { slideRefs.current[i] = el }}
              slide={slide}
              index={i}
              total={post.slides.length}
              postType={post.post_type}
              style={post.style}
              size="export"
            />
          ))}
        </div>

        {/* Visible preview */}
        {post.slides.length === 1 ? (
          <div className="flex justify-center">
            <PostSlide
              slide={post.slides[0]}
              index={0}
              total={1}
              postType={post.post_type}
              style={post.style}
            />
          </div>
        ) : (
          <div>
            <div className="flex justify-center">
              <PostSlide
                slide={post.slides[activeSlide]}
                index={activeSlide}
                total={post.slides.length}
                postType={post.post_type}
                style={post.style}
              />
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
                {post.slides.map((_, i) => (
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
                onClick={() => setActiveSlide(i => Math.min(post.slides.length - 1, i + 1))}
                disabled={activeSlide === post.slides.length - 1}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-4 py-3 border-t border-ivory-200">
        <p className="text-xs text-charcoal-600 font-body leading-relaxed line-clamp-3">{post.caption}</p>
        <p className="text-xs text-gold-600 mt-1 font-body">
          {post.hashtags.map(h => `#${h}`).join(" ")}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-ivory-200 flex items-center gap-2">
        <button
          onClick={copyCaption}
          className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 hover:text-charcoal-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-ivory-100"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? "Copié !" : "Copier caption"}
        </button>
        <div className="flex-1" />
        {post.slides.length > 1 && (
          <button
            onClick={downloadAll}
            className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 hover:text-charcoal-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-ivory-100"
          >
            <Download size={12} />
            Tout télécharger
          </button>
        )}
        <button
          onClick={() => downloadSlide(post.slides.length === 1 ? 0 : activeSlide)}
          className="flex items-center gap-1.5 text-xs font-medium bg-gold-600 hover:bg-gold-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download size={12} />
          {post.slides.length > 1 ? `Slide ${activeSlide + 1}` : "Télécharger"}
        </button>
      </div>
    </div>
  )
}
