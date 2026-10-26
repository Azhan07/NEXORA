import { cn } from '../lib/utils'

export default function Logo({ collapsed = false, className = '' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-8 w-8 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-full bg-accent/25 blur-md" />
        <svg viewBox="0 0 32 32" className="relative h-8 w-8" aria-hidden>
          <circle cx="16" cy="16" r="5.5" className="fill-accent" />
          <ellipse cx="16" cy="16" rx="13" ry="4.8" fill="none" strokeWidth="1.4" className="stroke-accent/70" transform="rotate(-25 16 16)" />
          <ellipse cx="16" cy="16" rx="13" ry="4.8" fill="none" strokeWidth="1.4" className="stroke-accent2/60" transform="rotate(35 16 16)" />
        </svg>
      </span>
      {!collapsed && <span className="font-display text-sm font-semibold tracking-[0.28em]">NEXORA</span>}
    </span>
  )
}
