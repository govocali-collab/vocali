import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10)
  if (digits.length === 0) return ""
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const weekday = new Intl.DateTimeFormat("fr-CA", { weekday: "long" }).format(d)
  const day = d.getDate()
  const month = new Intl.DateTimeFormat("fr-CA", { month: "long" }).format(d)
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${weekday} ${day} ${month} ${year} à ${hours}h${minutes}`
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "—"
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export function formatShortDate(date: string | Date): string {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${d.getDate()} ${new Intl.DateTimeFormat("fr-CA", { month: "short" }).format(d)} à ${hours}h${minutes}`
}
