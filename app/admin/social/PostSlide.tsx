"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { Slide, PostType, PostStyle } from "@/lib/supabase/social"

interface Props {
  slide: Slide
  index: number
  total: number
  postType: PostType
  style: PostStyle
  size?: "preview" | "export"
}

const SIZES = {
  preview: {
    square: "w-[338px] h-[423px]",
    story:  "w-[238px] h-[423px]",
    text:   { headline: "text-[20px]", body: "text-[14px]", logo: "text-[13px]", num: "text-[13px]" },
    pad:    "p-6",
  },
  export: {
    square: "w-[1080px] h-[1350px]",
    story:  "w-[608px] h-[1080px]",
    text:   { headline: "text-[52px]", body: "text-[36px]", logo: "text-[32px]", num: "text-[30px]" },
    pad:    "p-20",
  },
}

export const PostSlide = forwardRef<HTMLDivElement, Props>(
  ({ slide, index, total, postType, style, size = "preview" }, ref) => {
    const isStory  = postType === "story"
    const isLight  = style === "light"
    const s        = SIZES[size]
    const isCover  = index === 0 && total > 1
    const isLast   = index === total - 1 && total > 1

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col justify-between font-sans overflow-hidden flex-shrink-0",
          isStory ? s.story : s.square,
          s.pad,
          isLight ? "bg-[#FAF7F2] text-[#1C1A16]" : "bg-[#1C1A16] text-[#FAF7F2]"
        )}
      >
        {/* Gold top bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0",
          size === "preview" ? "h-[3px]" : "h-[10px]",
          "bg-[#C9A864]"
        )} />

        {/* Slide number badge */}
        {total > 1 && (
          <div className={cn(
            "absolute top-0 right-0 bg-[#C9A864] text-white font-bold leading-none",
            size === "preview"
              ? "text-[7px] px-2 py-1 mt-[3px] rounded-bl-lg"
              : "text-[28px] px-7 py-3 mt-[10px] rounded-bl-2xl"
          )}>
            {index + 1}/{total}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex flex-col flex-1 justify-center", isCover && "items-center text-center")}>
          {/* Accent dot */}
          <div className={cn(
            "rounded-full bg-[#C9A864] mb-3 flex-shrink-0",
            size === "preview" ? "w-[5px] h-[5px]" : "w-5 h-5",
            isCover && "mx-auto"
          )} />

          <h2
            className={cn(
              "font-serif font-bold leading-tight tracking-tight",
              s.text.headline,
              isLight ? "text-[#1C1A16]" : "text-[#FAF7F2]",
              isCover && "text-center"
            )}
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {slide.headline}
          </h2>

          {slide.body && (
            <p
              className={cn(
                "leading-relaxed mt-3 whitespace-pre-line",
                s.text.body,
                isLight ? "text-[#4A4535]" : "text-[#C8C0AC]",
                isCover && "text-center"
              )}
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {slide.body}
            </p>
          )}

          {/* CTA for last slide */}
          {isLast && slide.cta && (
            <div className={cn(
              "mt-4 font-semibold text-[#C9A864] flex items-center gap-1",
              s.text.body
            )}
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {slide.cta}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between",
          size === "preview" ? "mt-2" : "mt-8"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isLight ? "/vocali-logo-black.png" : "/vocali-logo-white.png"}
            alt="Vocali"
            className={size === "preview" ? "h-[14px]" : "h-[56px]"}
            style={{ objectFit: "contain" }}
          />
          <div className={cn(
            "w-4 rounded-full bg-[#C9A864]/40",
            size === "preview" ? "h-[2px]" : "h-[6px]"
          )} />
        </div>

        {/* Gold bottom bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 opacity-30",
          size === "preview" ? "h-[2px]" : "h-[6px]",
          "bg-[#C9A864]"
        )} />
      </div>
    )
  }
)

PostSlide.displayName = "PostSlide"
