"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const GOLD = "#C9A864"

interface Props {
  value: string
  onChange: (html: string) => void
  multiline?: boolean
}

/** Petit éditeur visuel (WYSIWYG) : gras, italique, or — sans codes visibles. */
export function RichEditor({ value, onChange, multiline }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Synchronise le contenu quand la valeur change de l'extérieur (changement de
  // slide). Le garde évite de réécrire pendant la frappe (pas de saut de curseur).
  useEffect(() => {
    const el = ref.current
    if (el && el.innerHTML !== (value ?? "")) el.innerHTML = value ?? ""
  }, [value])

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function format(kind: "bold" | "italic" | "gold") {
    const el = ref.current
    if (!el) return
    el.focus()
    if (kind === "bold") document.execCommand("bold")
    else if (kind === "italic") document.execCommand("italic")
    else {
      document.execCommand("styleWithCSS", false, "true")
      document.execCommand("foreColor", false, GOLD)
    }
    emit()
  }

  const btn =
    "h-6 min-w-[26px] px-1.5 rounded border border-ivory-300 bg-white text-xs text-charcoal-600 hover:bg-ivory-100 transition-colors"

  return (
    <div>
      <div className="flex gap-1 mb-1">
        <button type="button" title="Gras" onMouseDown={(e) => e.preventDefault()} onClick={() => format("bold")} className={cn(btn, "font-bold")}>G</button>
        <button type="button" title="Italique" onMouseDown={(e) => e.preventDefault()} onClick={() => format("italic")} className={cn(btn, "italic")}>I</button>
        <button type="button" title="Mettre en or" onMouseDown={(e) => e.preventDefault()} onClick={() => format("gold")} className={btn} style={{ color: GOLD, fontWeight: 600 }}>Or</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          document.execCommand("insertText", false, text)
        }}
        onKeyDown={(e) => {
          if (!multiline && e.key === "Enter") e.preventDefault()
        }}
        className={cn(
          "w-full border border-ivory-300 rounded-lg px-3 py-2 text-sm text-charcoal-800 focus:outline-none focus:border-gold-400 bg-white",
          multiline ? "min-h-[72px]" : ""
        )}
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  )
}
