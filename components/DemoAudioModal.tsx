"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Play, Pause, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Line {
  role: "ai" | "client"
  text: string
  time: number   // seconds — when this line becomes visible/active
  endTime?: number // seconds — when AI stops speaking (for highlight)
}

// Timestamps are estimates based on ~51s audio with 3s pauses between AI lines.
// Adjust time/endTime values if highlight is off.
const TRANSCRIPT_FR: Line[] = [
  { role: "ai",     text: "Clinique Dermavia, bonjour ! Je suis Sophia, l'assistante virtuelle de la clinique. Comment puis-je vous aider aujourd'hui ?",      time: 0,    endTime: 6.5 },
  { role: "client", text: "Bonjour, je voudrais prendre un rendez-vous pour un soin du visage.",                                                      time: 6.5 },
  { role: "ai",     text: "Bien sûr ! Nous offrons plusieurs soins du visage — hydratation, éclat, anti-âge. Vous avez une préférence, ou souhaitez-vous une consultation pour trouver le soin idéal ?", time: 9.5,  endTime: 19.5 },
  { role: "client", text: "Je pense que je voudrais quelque chose pour l'éclat.",                                                                     time: 19.5},
  { role: "ai",     text: "Excellent choix. Nous avons des disponibilités jeudi en fin de journée et samedi matin. Est-ce que l'une de ces plages vous conviendrait ?", time: 22.5, endTime: 33 },
  { role: "client", text: "Samedi matin, ce serait parfait.",                                                                                         time: 31  },
  { role: "ai",     text: "Parfait. Je note samedi matin pour vous. Puis-je avoir votre prénom et un numéro pour confirmer ?",                        time: 34,   endTime: 41 },
  { role: "client", text: "Marie Tremblay, 514-555-0192.",                                                                                            time: 40  },
  { role: "ai",     text: "Merci Marie. Votre rendez-vous est noté. Vous recevrez une confirmation par message. Bonne journée !",                     time: 43,   endTime: 52 },
]

const TRANSCRIPT_EN: Line[] = [
  { role: "ai",     text: "Dermavia Clinic, hello! I'm Sophia, the clinic's virtual assistant. How can I help you today?",                                                                                          time: 0,    endTime: 6.5 },
  { role: "client", text: "Hi, I'd like to book an appointment for a facial.",                                                                                                                                      time: 6.5 },
  { role: "ai",     text: "Of course! We offer several facial treatments — hydration, radiance, and anti-aging. Do you have a preference, or would you like a consultation to find the ideal treatment for you?",   time: 9.5,  endTime: 19.5 },
  { role: "client", text: "I think I'd like something for radiance.",                                                                                                                                               time: 19.5 },
  { role: "ai",     text: "Excellent choice. We have availability Thursday late afternoon and Saturday morning. Would either of those work for you?",                                                                time: 22,   endTime: 33 },
  { role: "client", text: "Saturday morning would be perfect.",                                                                                                                                                     time: 29  },
  { role: "ai",     text: "Perfect. I'll note Saturday morning for you. Could I get your first name and a number to confirm?",                                                                                      time: 31,   endTime: 38 },
  { role: "client", text: "Marie Tremblay, 514-555-0192.",                                                                                                                                                          time: 36  },
  { role: "ai",     text: "Thank you Marie. Your appointment is noted. You'll receive a confirmation by text. Have a great day!",                                                                                   time: 39,   endTime: 48 },
]

interface Props {
  open: boolean
  onClose: () => void
  lang: string
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export default function DemoAudioModal({ open, onClose, lang }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const transcriptRef = useRef<HTMLDivElement>(null)

  const transcript = lang === "en" ? TRANSCRIPT_EN : TRANSCRIPT_FR

  // Find index of currently active line (AI speaking or most recent client)
  const activeIndex = transcript.reduce((found, line, i) => {
    if (line.time <= currentTime) return i
    return found
  }, -1)

  // Scroll container so active line is centered
  useEffect(() => {
    if (activeIndex < 2) return
    const container = transcriptRef.current
    const el = lineRefs.current[activeIndex]
    if (!container || !el) return
    container.scrollTo({
      top: container.scrollTop + el.offsetHeight + 12,
      behavior: "smooth",
    })
  }, [activeIndex])

  // Reset on close
  useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlaying(false)
      setCurrentTime(0)
    }
  }, [open])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return
    const t = Number(e.target.value)
    audioRef.current.currentTime = t
    setCurrentTime(t)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">
                    {lang === "fr" ? "Appel de démonstration" : "Demo call"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      animate={playing ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <span className="text-xs text-charcoal-400">
                      {lang === "fr" ? "Vocali IA · Clinique Dermavia" : "Vocali AI · Clinique Dermavia"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-charcoal-400 hover:text-charcoal-700 transition-colors p-1 rounded-lg hover:bg-ivory-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Transcript */}
            <div ref={transcriptRef} className="px-6 py-3 space-y-3 h-64 overflow-y-auto">
              {transcript.map((line, i) => {
                const visible = line.time <= currentTime
                const isActive = i === activeIndex

                return (
                  <div
                    key={i}
                    ref={(el) => { lineRefs.current[i] = el }}
                    className={cn(
                      "flex gap-2.5 transition-opacity duration-500",
                      line.role === "client" && "flex-row-reverse",
                      visible ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      line.role === "ai" ? "bg-gradient-to-br from-gold-400 to-gold-600" : "bg-ivory-200"
                    )}>
                      {line.role === "ai"
                        ? <Sparkles size={10} className="text-white" />
                        : <User size={10} className="text-charcoal-500" />
                      }
                    </div>
                    <div className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-body transition-all duration-300",
                      line.role === "ai"
                        ? "bg-ivory-100 text-charcoal-700 rounded-tl-sm"
                        : "bg-gold-50 text-charcoal-700 rounded-tr-sm",
                      isActive && "ring-2 ring-gold-400 bg-gold-50 text-charcoal-900"
                    )}>
                      {line.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Player */}
            <div className="px-6 pt-4 pb-6 border-t border-ivory-200">
              <audio
                ref={audioRef}
                src={lang === "en" ? "/audio/demo-call-english.mp3" : "/audio/demo-call.mp3"}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setPlaying(false)}
              />

              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-gold-600 hover:bg-gold-700 text-white rounded-full flex items-center justify-center transition-colors shrink-0 shadow-sm"
                >
                  {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                </button>

                <div className="flex-1 flex flex-col gap-1.5">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 rounded-full accent-gold-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-charcoal-400 font-body">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
