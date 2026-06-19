import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  highlight?: boolean
}

export default function StatsCard({ title, value, icon, description, highlight }: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-ink-card rounded-xl p-5 border shadow-card",
        highlight ? "border-gold-300" : "border-ivory-300"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-charcoal-400 text-xs font-body font-medium uppercase tracking-wider">
          {title}
        </p>
        <span className="text-charcoal-300">{icon}</span>
      </div>
      <p className={cn("text-3xl font-display font-semibold", highlight ? "text-gold-600" : "text-charcoal-900")}>
        {value}
      </p>
      {description && (
        <p className="text-charcoal-400 text-xs font-body mt-1">{description}</p>
      )}
    </div>
  )
}
