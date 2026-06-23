"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { Slide, PostType, PostStyle } from "@/lib/supabase/social"
import { safeHtml } from "./richText"

interface Props {
  slide: Slide
  index: number
  total: number
  postType: PostType
  style: PostStyle
  size?: "preview" | "export"
}

// Dimensions de RÉFÉRENCE (aperçu). L'export est un agrandissement PROPORTIONNEL
// exact de l'aperçu → l'aperçu et l'image exportée sont identiques (WYSIWYG).
const PREVIEW_W = { square: 338, story: 238 }
const EXPORT_W = { square: 1080, story: 608 }
const PREVIEW_H = 423

export const PostSlide = forwardRef<HTMLDivElement, Props>(
  ({ slide, index, total, postType, style, size = "preview" }, ref) => {
    const isStory = postType === "story"
    const isLight = style === "light"
    const isCover = index === 0 && total > 1
    const isLast  = index === total - 1 && total > 1
    const hasNext = total > 1 && index < total - 1

    const fmt = isStory ? "story" : "square"
    const scale = size === "export" ? EXPORT_W[fmt] / PREVIEW_W[fmt] : 1
    const px = (n: number) => `${n * scale}px`

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col justify-between font-sans overflow-hidden flex-shrink-0",
          isLight ? "bg-[#FAF7F2] text-[#1C1A16]" : "bg-[#1C1A16] text-[#FAF7F2]"
        )}
        style={{ width: px(PREVIEW_W[fmt]), height: px(PREVIEW_H), padding: px(24) }}
      >
        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 bg-[#C9A864]" style={{ height: px(3) }} />

        {/* Content */}
        <div className={cn("flex flex-col flex-1 justify-center", isCover && "items-center text-center")}>
          {/* Gold dot — centered, right above text */}
          <div
            className="rounded-full bg-[#C9A864] mx-auto flex-shrink-0"
            style={{ width: px(5), height: px(5), marginBottom: px(8) }}
          />
          <h2
            className={cn(
              "font-serif font-bold leading-tight tracking-tight",
              isLight ? "text-[#1C1A16]" : "text-[#FAF7F2]",
              isCover && "text-center"
            )}
            style={{ fontFamily: "var(--font-playfair), serif", fontSize: px(22) }}
            dangerouslySetInnerHTML={{ __html: safeHtml(slide.headline) }}
          />

          {slide.body && (
            <p
              className={cn(
                "leading-relaxed whitespace-pre-line",
                isLight ? "text-[#4A4535]" : "text-[#C8C0AC]",
                isCover && "text-center"
              )}
              style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: px(14), marginTop: px(12) }}
              dangerouslySetInnerHTML={{ __html: safeHtml(slide.body) }}
            />
          )}

          {/* CTA for last slide */}
          {isLast && slide.cta && (
            <div
              className="font-semibold text-[#C9A864] flex items-center"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: px(14), marginTop: px(16), gap: px(4) }}
              dangerouslySetInnerHTML={{ __html: safeHtml(slide.cta) }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ marginTop: px(8) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isLight ? "/vocali-logo-black.png" : "/vocali-logo-white.png"}
            alt="Vocali"
            style={{ height: px(14), objectFit: "contain", display: "block" }}
          />
          <div
            className="flex-1 rounded-full bg-[#C9A864]/40"
            style={{ height: px(2), marginLeft: px(8), marginRight: px(8) }}
          />
          <span
            className="font-semibold text-[#C9A864] whitespace-nowrap"
            style={{ fontSize: px(10), lineHeight: 1, transform: "translateY(-0.2em)" }}
          >
            vocali.ca/demo
          </span>
        </div>

        {/* Flèche « slide suivante » — bas-droite, au-dessus de vocali.ca/demo */}
        {hasNext && (
          <div
            className="absolute font-sans font-bold text-[#C9A864]"
            style={{ right: px(24), bottom: px(50), fontSize: px(22), lineHeight: 1 }}
          >
            →
          </div>
        )}

        {/* Gold bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 opacity-30 bg-[#C9A864]" style={{ height: px(2) }} />
      </div>
    )
  }
)

PostSlide.displayName = "PostSlide"
